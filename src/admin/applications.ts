import { ApiRequestError } from "../api/http.ts";

/**
 * Partner application reads and writes are admin-only.
 * GET /partner-applications and GET /partner-applications/:id use the session.
 * PATCH /partner-applications/:id/status sends JSON { status }.
 * DELETE /partner-applications/:id uses the session and CSRF token.
 *
 * Status may be any of Pending, Contacted, Approved, or Rejected from any
 * current value. The API does not define a narrower transition graph.
 * The public POST /partner-applications form is not used here.
 *
 * organisationLogoPublicId is storage metadata and is not kept on the admin record.
 */

export const APPLICATION_STATUSES = ["Pending", "Contacted", "Approved", "Rejected"] as const;

export const ORGANISATION_TYPES = [
  "University / School",
  "Tech Company",
  "Government Body",
  "NGO / Community Hub",
  "Other",
] as const;

export const ORGANISATION_SIZES = [
  "1–10 people",
  "11–50 people",
  "51–200 people",
  "201–500 people",
  "500+ people",
] as const;

export const PARTNERSHIP_TIERS = [
  "Gold Partner",
  "Silver Partner",
  "Community Partner",
  "Not Sure Yet",
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];
export type OrganisationType = (typeof ORGANISATION_TYPES)[number];
export type OrganisationSize = (typeof ORGANISATION_SIZES)[number];
export type PartnershipTier = (typeof PARTNERSHIP_TIERS)[number];

export const SESSION_EXPIRED_MESSAGE = "Your admin session is no longer active.";
export const APPLICATION_UNCHANGED_MESSAGE = "The application was not changed.";

export type AdminApplication = {
  id: string;
  organisationName: string;
  organisationLogoUrl: string;
  organisationType: OrganisationType;
  website: string;
  organisationSize: OrganisationSize;
  country: string;
  description: string;
  partnershipTier: PartnershipTier;
  organisationOffer: string;
  projectIdea: string | null;
  fullName: string;
  jobTitle: string;
  workEmail: string;
  agreedToTerms: boolean;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
};

export type ApplicationListState =
  | { status: "loading" }
  | { status: "ready"; applications: AdminApplication[] }
  | { status: "invalid"; message: string }
  | { status: "error"; message: string }
  | { status: "unauthorized"; message: string };

export type ApplicationDetailState =
  | { status: "loading"; id: string }
  | { status: "ready"; application: AdminApplication }
  | { status: "invalid"; id: string; message: string }
  | { status: "error"; id: string; message: string }
  | { status: "unauthorized"; id: string; message: string };

export type PendingAction = "status" | "delete";

export type StatusResult =
  | { ok: true; application: AdminApplication }
  | {
      ok: false;
      kind: "validation" | "unauthorized" | "forbidden" | "error";
      message: string;
    };

export type DeleteResult =
  | { ok: true }
  | { ok: false; kind: "unauthorized" | "forbidden" | "error"; message: string };

export function initialApplicationList(): ApplicationListState {
  return { status: "loading" };
}

export function controlsLocked(action: PendingAction | null): boolean {
  return action !== null;
}

export function beginPending(current: PendingAction | null, next: PendingAction): PendingAction | null {
  if (current) return null;
  return next;
}

export function applicationResourcePath(id: string): string {
  return `/partner-applications/${encodeURIComponent(id)}`;
}

export function applicationStatusPath(id: string): string {
  return `${applicationResourcePath(id)}/status`;
}

export function prepareStatusUpdate(
  current: ApplicationStatus,
  next: string,
): { ok: true; status: ApplicationStatus } | { ok: false; message: string } {
  if (!isApplicationStatus(next)) {
    return { ok: false, message: "Status must be Pending, Contacted, Approved, or Rejected." };
  }
  if (next === current) return { ok: false, message: "Choose a different status." };
  return { ok: true, status: next };
}

export function readApplication(data: unknown): AdminApplication | null {
  if (!isRecord(data)) return null;
  if (!isNonEmptyString(data.id) || !isNonEmptyString(data.organisationName)) return null;
  if (!isNonEmptyString(data.organisationLogoUrl) || !isOrganisationType(data.organisationType)) return null;
  if (!isNonEmptyString(data.website) || !isOrganisationSize(data.organisationSize)) return null;
  if (!isNonEmptyString(data.country) || !isNonEmptyString(data.description)) return null;
  if (!isPartnershipTier(data.partnershipTier) || !isNonEmptyString(data.organisationOffer)) return null;
  if (!isNonEmptyString(data.fullName) || !isNonEmptyString(data.jobTitle) || !isNonEmptyString(data.workEmail)) return null;
  if (typeof data.agreedToTerms !== "boolean" || !isApplicationStatus(data.status)) return null;
  if (!isNonEmptyString(data.createdAt) || !isNonEmptyString(data.updatedAt)) return null;
  const projectIdea = optionalText(data.projectIdea);
  if (projectIdea === false) return null;
  if ("organisationLogoPublicId" in data && data.organisationLogoPublicId !== undefined && typeof data.organisationLogoPublicId !== "string") {
    return null;
  }

  return {
    id: data.id,
    organisationName: data.organisationName,
    organisationLogoUrl: data.organisationLogoUrl,
    organisationType: data.organisationType,
    website: data.website,
    organisationSize: data.organisationSize,
    country: data.country,
    description: data.description,
    partnershipTier: data.partnershipTier,
    organisationOffer: data.organisationOffer,
    projectIdea,
    fullName: data.fullName,
    jobTitle: data.jobTitle,
    workEmail: data.workEmail,
    agreedToTerms: data.agreedToTerms,
    status: data.status,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export function readApplicationList(data: unknown): AdminApplication[] | null {
  if (!Array.isArray(data)) return null;
  const applications: AdminApplication[] = [];
  for (const item of data) {
    const application = readApplication(item);
    if (!application) return null;
    applications.push(application);
  }
  return applications;
}

export async function loadApplicationList(
  listApplications: () => Promise<unknown>,
): Promise<Exclude<ApplicationListState, { status: "loading" }>> {
  try {
    const applications = readApplicationList(await listApplications());
    if (!applications) {
      return { status: "invalid", message: "The applications response was not a list of applications." };
    }
    return { status: "ready", applications };
  } catch (error) {
    return listFailure(error);
  }
}

export async function loadApplication(
  getApplication: (id: string) => Promise<unknown>,
  id: string,
): Promise<Exclude<ApplicationDetailState, { status: "loading" }>> {
  try {
    const application = readApplication(await getApplication(id));
    if (!application) {
      return { status: "invalid", id, message: "The application response was not an application." };
    }
    return { status: "ready", application };
  } catch (error) {
    const failure = listFailure(error);
    if (failure.status === "unauthorized") return { status: "unauthorized", id, message: failure.message };
    return { status: failure.status, id, message: failure.message };
  }
}

export async function saveApplicationStatus(
  client: { updateStatus: (id: string, status: ApplicationStatus) => Promise<unknown> },
  application: AdminApplication,
  nextStatus: string,
): Promise<StatusResult> {
  const prepared = prepareStatusUpdate(application.status, nextStatus);
  if (!prepared.ok) return { ok: false, kind: "validation", message: prepared.message };

  try {
    const updated = readApplication(await client.updateStatus(application.id, prepared.status));
    if (!updated) {
      return { ok: false, kind: "error", message: "The server response did not include the updated application." };
    }
    return { ok: true, application: updated };
  } catch (error) {
    const failure = mutationFailure(error);
    return { ok: false, kind: failure.kind, message: failure.message };
  }
}

export function confirmedDeletion(target: { id: string } | null, confirmed: boolean): string | null {
  if (!confirmed || !target?.id.trim()) return null;
  return target.id;
}

export async function deleteApplication(
  client: { deleteApplication: (id: string) => Promise<unknown> },
  id: string,
): Promise<DeleteResult> {
  if (!id.trim()) return { ok: false, kind: "error", message: "Choose an application to delete." };
  try {
    await client.deleteApplication(id);
    return { ok: true };
  } catch (error) {
    return { ok: false, ...mutationFailure(error) };
  }
}

export function applyStatusUpdate(list: ApplicationListState, application: AdminApplication): ApplicationListState {
  if (list.status !== "ready") return list;
  return {
    status: "ready",
    applications: list.applications.map((item) => (item.id === application.id ? application : item)),
  };
}

export function applyDeletion(list: ApplicationListState, id: string): ApplicationListState {
  if (list.status !== "ready") return list;
  return {
    status: "ready",
    applications: list.applications.filter((item) => item.id !== id),
  };
}

function listFailure(error: unknown): Exclude<ApplicationListState, { status: "loading" | "ready" }> {
  if (error instanceof ApiRequestError && error.status === 401) {
    return { status: "unauthorized", message: SESSION_EXPIRED_MESSAGE };
  }
  return {
    status: "error",
    message: error instanceof Error && error.message.trim() ? error.message : "The request failed.",
  };
}

function mutationFailure(error: unknown): { kind: "unauthorized" | "forbidden" | "error"; message: string } {
  if (error instanceof ApiRequestError && error.status === 401) {
    return { kind: "unauthorized", message: SESSION_EXPIRED_MESSAGE };
  }
  const message = error instanceof Error && error.message.trim() ? error.message : "The request failed.";
  if (error instanceof ApiRequestError && error.status === 403) return { kind: "forbidden", message };
  return { kind: "error", message };
}

function optionalText(value: unknown): string | null | false {
  if (value === undefined || value === null) return null;
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isApplicationStatus(value: unknown): value is ApplicationStatus {
  return APPLICATION_STATUSES.some((status) => status === value);
}

function isOrganisationType(value: unknown): value is OrganisationType {
  return ORGANISATION_TYPES.some((type) => type === value);
}

function isOrganisationSize(value: unknown): value is OrganisationSize {
  return ORGANISATION_SIZES.some((size) => size === value);
}

function isPartnershipTier(value: unknown): value is PartnershipTier {
  return PARTNERSHIP_TIERS.some((tier) => tier === value);
}
