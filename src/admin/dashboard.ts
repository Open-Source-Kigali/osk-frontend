import { ApiRequestError } from "../api/http.ts";

/**
 * GET /stats counts events, projects, partners, approved reviews, and the
 * pull-request sum stored on projects.
 * `members` in that payload adds a fixed public offset, and `contributors`
 * keeps at most 100 logins per repository, so neither is shown here.
 * Member records come from the complete GET /members list.
 * Pending reviews and partner applications come from the complete admin lists.
 * GET /projects is paginated, so this dashboard does not count that list.
 */

export const SESSION_EXPIRED_MESSAGE = "Your admin session is no longer active.";

const APPLICATION_STATUSES = ["Pending", "Contacted", "Approved", "Rejected"] as const;

export type CommunityCounts = {
  events: number;
  projects: number;
  partners: number;
  approvedReviews: number;
  pullRequests: number;
};

export type ApplicationCounts = {
  total: number;
  pending: number;
};

export type Metric<T> =
  | { status: "loading" }
  | { status: "ready"; data: T }
  | { status: "invalid"; message: string }
  | { status: "error"; message: string }
  | { status: "session-expired"; message: string };

export type AdminDashboardSnapshot = {
  community: Metric<CommunityCounts>;
  members: Metric<number>;
  applications: Metric<ApplicationCounts>;
  pendingReviews: Metric<number>;
};

export type CountPresentation =
  | { state: "loading"; text: "Loading count..." }
  | { state: "ready"; value: string }
  | { state: "unavailable"; text: string };

export type DashboardClient = {
  getStats: () => Promise<unknown>;
  getMembers: () => Promise<unknown>;
  getApplications: () => Promise<unknown>;
  getPendingReviews: () => Promise<unknown>;
};

const COMMUNITY_FIELDS = {
  events: "events",
  projects: "projects",
  partners: "partners",
  approvedReviews: "reviews",
  pullRequests: "pullRequests",
} as const;

export function initialDashboard(): AdminDashboardSnapshot {
  return {
    community: { status: "loading" },
    members: { status: "loading" },
    applications: { status: "loading" },
    pendingReviews: { status: "loading" },
  };
}

export function formatCount(value: number): string {
  return value.toLocaleString("en-US");
}

export function presentCount(metric: Metric<number>): CountPresentation {
  if (metric.status === "loading") return { state: "loading", text: "Loading count..." };
  if (metric.status === "ready") return { state: "ready", value: formatCount(metric.data) };
  if (metric.status === "session-expired") {
    return { state: "unavailable", text: "Sign in again to load this count." };
  }
  return { state: "unavailable", text: "Count unavailable" };
}

export function countMetric<T>(
  metric: Metric<T>,
  select: (data: T) => number,
): Metric<number> {
  if (metric.status !== "ready") return metric;
  return { status: "ready", data: select(metric.data) };
}

export function applicationDetail(counts: ApplicationCounts): string {
  if (counts.total === 0) return "No applications yet.";
  if (counts.pending === 0) return "None are pending.";
  return counts.pending === 1 ? "1 pending." : `${formatCount(counts.pending)} pending.`;
}

export function projectDetail(counts: CommunityCounts): string {
  const pulls = formatCount(counts.pullRequests);
  return counts.projects === 0
    ? `No projects yet. ${pulls} recorded pull requests.`
    : `${pulls} recorded pull requests.`;
}

export function emptyDetail(count: number, empty: string, ready: string): string {
  return count === 0 ? empty : ready;
}

export function problemMessages(snapshot: AdminDashboardSnapshot): string[] {
  const messages: string[] = [];
  for (const metric of Object.values(snapshot)) {
    if (
      (metric.status === "error" || metric.status === "invalid") &&
      !messages.includes(metric.message)
    ) {
      messages.push(metric.message);
    }
  }
  return messages;
}

export function dashboardSessionExpired(snapshot: AdminDashboardSnapshot): boolean {
  return Object.values(snapshot).some((metric) => metric.status === "session-expired");
}

export function readCommunityCounts(data: unknown): CommunityCounts | null {
  if (!isRecord(data)) return null;
  const counts = {} as CommunityCounts;
  for (const [target, source] of Object.entries(COMMUNITY_FIELDS)) {
    const value = data[source];
    if (!isCount(value)) return null;
    counts[target as keyof CommunityCounts] = value;
  }
  return counts;
}

export function readMemberCount(data: unknown): number | null {
  if (!Array.isArray(data) || !data.every(isRecord)) return null;
  return data.length;
}

export function readApplicationCounts(data: unknown): ApplicationCounts | null {
  if (!Array.isArray(data) || !data.every(isRecord)) return null;
  let pending = 0;
  for (const item of data) {
    if (!isApplicationStatus(item.status)) return null;
    if (item.status === "Pending") pending += 1;
  }
  return { total: data.length, pending };
}

export function readPendingReviewCount(data: unknown): number | null {
  if (!Array.isArray(data) || !data.every(isRecord)) return null;
  if (!data.every((item) => item.status === "PENDING")) return null;
  return data.length;
}

export async function loadAdminDashboard(
  client: DashboardClient,
): Promise<AdminDashboardSnapshot> {
  const [community, members, applications, pendingReviews] = await Promise.all([
    loadPublic(
      client.getStats,
      readCommunityCounts,
      "Community stats did not include a usable count.",
    ),
    loadPublic(
      client.getMembers,
      readMemberCount,
      "The members response was not a list of records.",
    ),
    loadProtected(
      client.getApplications,
      readApplicationCounts,
      "The partner applications response was not a complete list.",
    ),
    loadProtected(
      client.getPendingReviews,
      readPendingReviewCount,
      "The pending reviews response was not a list of pending reviews.",
    ),
  ]);

  return { community, members, applications, pendingReviews };
}

async function loadPublic<T>(
  request: () => Promise<unknown>,
  read: (data: unknown) => T | null,
  invalidMessage: string,
): Promise<Metric<T>> {
  try {
    const parsed = read(await request());
    if (parsed === null) return { status: "invalid", message: invalidMessage };
    return { status: "ready", data: parsed };
  } catch (error) {
    return { status: "error", message: errorMessage(error) };
  }
}

async function loadProtected<T>(
  request: () => Promise<unknown>,
  read: (data: unknown) => T | null,
  invalidMessage: string,
): Promise<Metric<T>> {
  try {
    const parsed = read(await request());
    if (parsed === null) return { status: "invalid", message: invalidMessage };
    return { status: "ready", data: parsed };
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 401) {
      return { status: "session-expired", message: SESSION_EXPIRED_MESSAGE };
    }
    return { status: "error", message: errorMessage(error) };
  }
}

function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim()) return error.message;
  return "The request failed.";
}

function isCount(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isApplicationStatus(value: unknown): value is (typeof APPLICATION_STATUSES)[number] {
  return APPLICATION_STATUSES.some((status) => status === value);
}
