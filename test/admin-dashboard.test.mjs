import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const dashboardUrl = new URL("../src/admin/dashboard.ts", import.meta.url);
const httpUrl = new URL("../src/api/http.ts", import.meta.url);
const pagePath = new URL("../src/pages/admin/AdminDashboardPage.tsx", import.meta.url);

const {
  applicationDetail,
  countMetric,
  dashboardSessionExpired,
  initialDashboard,
  loadAdminDashboard,
  presentCount,
  problemMessages,
  projectDetail,
  readCommunityCounts,
} = await import(dashboardUrl);
const { ApiRequestError } = await import(httpUrl);

const stats = {
  contributors: 80,
  members: 999,
  projects: 7,
  events: 3,
  partners: 2,
  reviews: 6,
  pullRequests: 24,
};

function readyClient(overrides = {}) {
  const calls = [];
  const client = {
    async getStats() {
      calls.push("stats");
      return stats;
    },
    async getMembers() {
      calls.push("members");
      return [{ id: "member-1" }, { id: "member-2" }];
    },
    async getApplications() {
      calls.push("applications");
      return [
        { id: "app-1", status: "Pending" },
        { id: "app-2", status: "Approved" },
      ];
    },
    async getPendingReviews() {
      calls.push("pending-reviews");
      return [
        { id: "review-1", status: "PENDING" },
        { id: "review-2", status: "PENDING" },
      ];
    },
    ...overrides,
  };
  return { client, calls };
}

test("dashboard loads counts from the stats payload and the complete lists", async () => {
  const { client, calls } = readyClient();
  const snapshot = await loadAdminDashboard(client);

  assert.deepEqual(snapshot.community, {
    status: "ready",
    data: {
      events: 3,
      projects: 7,
      partners: 2,
      approvedReviews: 6,
      pullRequests: 24,
    },
  });
  assert.deepEqual(snapshot.members, { status: "ready", data: 2 });
  assert.deepEqual(snapshot.applications, {
    status: "ready",
    data: { total: 2, pending: 1 },
  });
  assert.deepEqual(snapshot.pendingReviews, { status: "ready", data: 2 });
  assert.equal(JSON.stringify(snapshot).includes("999"), false);
  assert.equal(JSON.stringify(snapshot).includes("80"), false);
  assert.deepEqual(calls.sort(), ["applications", "members", "pending-reviews", "stats"]);

  assert.equal(presentCount(countMetric(snapshot.community, (data) => data.events)).value, "3");
  assert.equal(presentCount(snapshot.members).value, "2");
  assert.equal(applicationDetail(snapshot.applications.data), "1 pending.");
  assert.equal(projectDetail(snapshot.community.data), "24 recorded pull requests.");
  assert.deepEqual(problemMessages(snapshot), []);
  assert.equal(dashboardSessionExpired(snapshot), false);
});

test("the dashboard starts in a loading state with no counts", () => {
  const snapshot = initialDashboard();
  for (const metric of Object.values(snapshot)) {
    const presentation = presentCount(countMetric(metric, () => 0));
    assert.equal(presentation.state, "loading");
    assert.equal(presentation.text, "Loading count...");
    assert.equal("value" in presentation, false);
  }
});

test("a failed stats request does not invent community counts", async () => {
  const { client } = readyClient({
    async getStats() {
      throw new Error("Service unavailable");
    },
  });
  const snapshot = await loadAdminDashboard(client);
  const events = presentCount(countMetric(snapshot.community, (data) => data.events));

  assert.equal(snapshot.community.status, "error");
  assert.equal(snapshot.community.message, "Service unavailable");
  assert.equal(events.state, "unavailable");
  assert.equal(events.text, "Count unavailable");
  assert.equal("value" in events, false);
  assert.equal(snapshot.members.status, "ready");
  assert.deepEqual(problemMessages(snapshot), ["Service unavailable"]);
});

test("missing or invalid stats fields produce no count", async () => {
  const incomplete = await loadAdminDashboard(
    readyClient({
      async getStats() {
        return { events: 4, projects: 1, partners: 1, members: 10 };
      },
    }).client,
  );
  assert.equal(incomplete.community.status, "invalid");
  assert.equal(presentCount(countMetric(incomplete.community, () => 4)).state, "unavailable");
  assert.equal(readCommunityCounts({ events: 1, projects: 1, partners: 1, reviews: "6", pullRequests: 1 }), null);

  const badMembers = await loadAdminDashboard(
    readyClient({
      async getMembers() {
        return { total: 5 };
      },
    }).client,
  );
  assert.equal(badMembers.members.status, "invalid");
  assert.equal(presentCount(badMembers.members).state, "unavailable");

  const badApplications = await loadAdminDashboard(
    readyClient({
      async getApplications() {
        return [{ id: "app-1", status: "Waiting" }];
      },
    }).client,
  );
  assert.equal(badApplications.applications.status, "invalid");

  const badReviews = await loadAdminDashboard(
    readyClient({
      async getPendingReviews() {
        return [{ id: "review-1", status: "APPROVED" }];
      },
    }).client,
  );
  assert.equal(badReviews.pendingReviews.status, "invalid");
  assert.equal(presentCount(badReviews.pendingReviews).value, undefined);
});

test("empty lists show zero", async () => {
  const snapshot = await loadAdminDashboard(
    readyClient({
      async getStats() {
        return { events: 0, projects: 0, partners: 0, reviews: 0, pullRequests: 0 };
      },
      async getMembers() {
        return [];
      },
      async getApplications() {
        return [];
      },
      async getPendingReviews() {
        return [];
      },
    }).client,
  );

  assert.equal(presentCount(snapshot.members).value, "0");
  assert.equal(presentCount(countMetric(snapshot.applications, (data) => data.total)).value, "0");
  assert.equal(applicationDetail(snapshot.applications.data), "No applications yet.");
  assert.equal(presentCount(snapshot.pendingReviews).value, "0");
  assert.equal(projectDetail(snapshot.community.data), "No projects yet. 0 recorded pull requests.");
});

test("an expired session hides protected counts and keeps public counts", async () => {
  const snapshot = await loadAdminDashboard(
    readyClient({
      async getApplications() {
        throw new ApiRequestError("Authentication required", 401);
      },
      async getPendingReviews() {
        throw new ApiRequestError("Authentication required", 401);
      },
    }).client,
  );

  assert.equal(snapshot.community.status, "ready");
  assert.equal(snapshot.members.status, "ready");
  assert.equal(snapshot.applications.status, "session-expired");
  assert.equal(snapshot.pendingReviews.status, "session-expired");
  assert.equal(dashboardSessionExpired(snapshot), true);
  assert.equal(presentCount(countMetric(snapshot.applications, (data) => data.total)).state, "unavailable");
  assert.equal(presentCount(snapshot.pendingReviews).text, "Sign in again to load this count.");
  assert.equal(presentCount(countMetric(snapshot.community, (data) => data.events)).value, "3");
  assert.deepEqual(problemMessages(snapshot), []);
});

test("the dashboard page requests the contracted endpoints", async () => {
  const source = await readFile(pagePath, "utf8");
  assert.match(source, /fetchStats\(/);
  assert.match(source, /apiGet<unknown>\("\/members"\)/);
  assert.match(source, /sessionGet<unknown>\("\/partner-applications"\)/);
  assert.match(source, /sessionGet<unknown>\("\/admin\/reviews\?status=PENDING"\)/);
  assert.match(source, /presentCount/);
  assert.doesNotMatch(source, /["'`]\/projects["'`]|contributors|stats\.members/);
});
