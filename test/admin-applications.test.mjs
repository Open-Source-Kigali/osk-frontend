import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const applicationsUrl = new URL("../src/admin/applications.ts", import.meta.url);
const httpUrl = new URL("../src/api/http.ts", import.meta.url);
const pagePath = new URL("../src/pages/admin/AdminApplicationsPage.tsx", import.meta.url);

const {
  APPLICATION_STATUSES,
  applyDeletion,
  applyStatusUpdate,
  beginPending,
  confirmedDeletion,
  controlsLocked,
  deleteApplication,
  initialApplicationList,
  loadApplication,
  loadApplicationList,
  prepareStatusUpdate,
  readApplication,
  saveApplicationStatus,
} = await import(applicationsUrl);
const { ApiRequestError, createApiClient } = await import(httpUrl);

const saved = {
  id: "11111111-1111-1111-1111-111111111111",
  organisationName: "KLab",
  organisationLogoUrl: "https://cdn.example/klab.png",
  organisationLogoPublicId: "applications/klab",
  organisationType: "NGO / Community Hub",
  website: "https://klab.rw",
  organisationSize: "11–50 people",
  country: "Rwanda",
  description: "A Kigali technology hub.",
  partnershipTier: "Community Partner",
  organisationOffer: "Mentors and event space.",
  projectIdea: "  ",
  fullName: "Ada Lovelace",
  jobTitle: "Director",
  workEmail: "ada@klab.rw",
  agreedToTerms: true,
  status: "Pending",
  createdAt: "2026-10-01T00:00:00.000Z",
  updatedAt: "2026-10-02T00:00:00.000Z",
};

test("applications load as a complete protected list and accept an empty list", async () => {
  assert.equal(initialApplicationList().status, "loading");
  const populated = await loadApplicationList(async () => [saved]);
  assert.equal(populated.status, "ready");
  assert.equal(populated.applications[0].organisationName, "KLab");
  assert.equal(populated.applications[0].projectIdea, null);
  assert.equal("organisationLogoPublicId" in populated.applications[0], false);

  const empty = await loadApplicationList(async () => []);
  assert.deepEqual(empty, { status: "ready", applications: [] });
});

test("incomplete application payloads are rejected", async () => {
  const envelope = await loadApplicationList(async () => ({ applications: [saved] }));
  assert.equal(envelope.status, "invalid");

  const broken = await loadApplicationList(async () => [{ ...saved, status: "Archived" }, saved]);
  assert.equal(broken.status, "invalid");

  const badLogo = await loadApplicationList(async () => [{ ...saved, organisationLogoPublicId: 12 }]);
  assert.equal(badLogo.status, "invalid");
});

test("a list failure does not invent applications", async () => {
  const failed = await loadApplicationList(async () => {
    throw new ApiRequestError("Not Found", 404);
  });
  assert.equal(failed.status, "error");
  assert.equal(failed.message, "Not Found");

  const expired = await loadApplicationList(async () => {
    throw new ApiRequestError("Authentication required", 401);
  });
  assert.equal(expired.status, "unauthorized");
  assert.equal(expired.message, "Your admin session is no longer active.");
});

test("application details use the single-record response", async () => {
  const detail = await loadApplication(async (id) => {
    assert.equal(id, saved.id);
    return saved;
  }, saved.id);
  assert.equal(detail.status, "ready");
  assert.equal(detail.application.fullName, "Ada Lovelace");
  assert.equal(detail.application.workEmail, "ada@klab.rw");
  assert.equal(detail.application.agreedToTerms, true);
  assert.equal("organisationLogoPublicId" in detail.application, false);

  const missing = await loadApplication(async () => {
    throw new ApiRequestError("Partner application not found", 404);
  }, saved.id);
  assert.equal(missing.status, "error");
  assert.equal(missing.message, "Partner application not found");
});

test("any supported status can be saved and an unsupported value is not sent", async () => {
  assert.deepEqual(APPLICATION_STATUSES, ["Pending", "Contacted", "Approved", "Rejected"]);
  const calls = [];
  const client = {
    async updateStatus(id, status) {
      calls.push({ id, status });
      return { ...saved, status };
    },
  };

  const approved = await saveApplicationStatus(client, readApplication(saved), "Approved");
  assert.equal(approved.ok, true);
  assert.equal(approved.application.status, "Approved");
  assert.deepEqual(calls, [{ id: saved.id, status: "Approved" }]);

  const back = await saveApplicationStatus(client, approved.application, "Pending");
  assert.equal(back.ok, true);
  assert.equal(calls[1].status, "Pending");

  const same = await saveApplicationStatus(client, readApplication(saved), "Pending");
  assert.equal(same.ok, false);
  assert.equal(same.kind, "validation");
  assert.equal(same.message, "Choose a different status.");
  assert.equal(calls.length, 2);

  const unsupported = prepareStatusUpdate("Pending", "Archived");
  assert.equal(unsupported.ok, false);
  assert.match(unsupported.message, /Pending, Contacted, Approved, or Rejected/);
  const rejected = await saveApplicationStatus(client, readApplication(saved), "Archived");
  assert.equal(rejected.ok, false);
  assert.equal(calls.length, 2);
});

test("a failed status update does not report success or change the list", async () => {
  const list = await loadApplicationList(async () => [saved]);
  const result = await saveApplicationStatus(
    {
      async updateStatus() {
        throw new ApiRequestError("status: Invalid option", 400);
      },
    },
    readApplication(saved),
    "Contacted",
  );
  assert.equal(result.ok, false);
  assert.equal(result.message, "status: Invalid option");
  assert.equal(applyStatusUpdate(list, readApplication(saved)).applications[0].status, "Pending");

  const missing = await saveApplicationStatus(
    {
      async updateStatus() {
        return { id: saved.id };
      },
    },
    readApplication(saved),
    "Approved",
  );
  assert.equal(missing.ok, false);
  assert.equal(missing.message, "The server response did not include the updated application.");
});

test("delete confirmation, cancellation, success, and failure", async () => {
  assert.equal(confirmedDeletion(null, true), null);
  assert.equal(confirmedDeletion(saved, false), null);

  let deleted = 0;
  const id = confirmedDeletion(saved, true);
  const result = await deleteApplication(
    {
      async deleteApplication(applicationId) {
        deleted += 1;
        assert.equal(applicationId, id);
        return null;
      },
    },
    id,
  );
  assert.deepEqual(result, { ok: true });
  assert.equal(deleted, 1);

  const list = { status: "ready", applications: [readApplication(saved)] };
  assert.deepEqual(applyDeletion(list, saved.id), { status: "ready", applications: [] });
  assert.equal(applyDeletion({ status: "error", message: "Not Found" }, saved.id).status, "error");

  const failed = await deleteApplication(
    {
      async deleteApplication() {
        throw new ApiRequestError("Partner application not found", 404);
      },
    },
    saved.id,
  );
  assert.equal(failed.ok, false);
  assert.equal(failed.message, "Partner application not found");
});

test("session expiry and forbidden writes do not count as saved", async () => {
  const expired = await saveApplicationStatus(
    {
      async updateStatus() {
        throw new ApiRequestError("Authentication required", 401);
      },
    },
    readApplication(saved),
    "Rejected",
  );
  assert.equal(expired.ok, false);
  assert.equal(expired.kind, "unauthorized");
  assert.equal(expired.message, "Your admin session is no longer active.");

  const forbidden = await deleteApplication(
    {
      async deleteApplication() {
        throw new ApiRequestError("Origin is not allowed", 403);
      },
    },
    saved.id,
  );
  assert.equal(forbidden.ok, false);
  assert.equal(forbidden.kind, "forbidden");
  assert.match(forbidden.message, /Origin is not allowed/);
});

test("pending actions block another status change or delete", () => {
  assert.equal(controlsLocked(null), false);
  assert.equal(controlsLocked("status"), true);
  assert.equal(beginPending("status", "delete"), null);
  assert.equal(beginPending(null, "delete"), "delete");
});

test("the status update uses the session client once", async () => {
  const calls = [];
  const fetchImpl = async (input, init) => {
    calls.push({ url: String(input), init });
    if (String(input).endsWith("/auth/csrf")) {
      return json({ success: true, message: "ok", data: { csrfToken: "token-1" } });
    }
    if (String(input).endsWith(`/partner-applications/${saved.id}/status`) && init.method === "PATCH") {
      return json({ success: true, message: "updated", data: { ...saved, status: "Approved" } });
    }
    throw new Error(`${init.method} ${String(input)}`);
  };
  const client = createApiClient({ baseUrl: "https://api.example.test/api", fetch: fetchImpl });
  const result = await saveApplicationStatus(
    {
      updateStatus: (id, status) => client.sessionSend(`/partner-applications/${id}/status`, "PATCH", { status }),
    },
    readApplication(saved),
    "Approved",
  );
  assert.equal(result.ok, true);
  const patch = calls.find((call) => call.init.method === "PATCH");
  assert.equal(patch.init.credentials, "include");
  assert.equal(new Headers(patch.init.headers).get("x-csrf-token"), "token-1");
  assert.equal(new Headers(patch.init.headers).get("content-type"), "application/json");
  assert.equal(new Headers(patch.init.headers).get("x-api-key"), null);
  assert.deepEqual(JSON.parse(patch.init.body), { status: "Approved" });
  assert.equal(calls.filter((call) => call.init.method === "PATCH").length, 1);
});

test("the applications page keeps failed mutations from replacing the list", async () => {
  const source = await readFile(pagePath, "utf8");
  assert.match(source, /sessionGet<unknown>\("\/partner-applications"\)/);
  assert.match(source, /sessionGet<unknown>\(applicationResourcePath\(id\)\)/);
  assert.match(source, /sessionSend<unknown>\(applicationStatusPath\(id\), "PATCH", \{ status \}\)/);
  assert.match(source, /sessionSend<unknown>\(applicationResourcePath\(id\), "DELETE"\)/);
  assert.match(source, /disabled=\{locked\}/);
  assert.match(source, /Keep application/);
  assert.match(source, /confirmedDeletion\(deleteTarget, true\)/);
  assert.match(source, /applyStatusUpdate/);
  assert.match(source, /applyDeletion/);
  assert.doesNotMatch(source, /localStorage|sessionStorage|x-api-key|organisationLogoPublicId|PartnersForm/);
  const saveFn = source.slice(source.indexOf("async function onSaveStatus"), source.indexOf("async function onConfirmDelete"));
  assert.ok(saveFn.indexOf("if (!result.ok)") < saveFn.indexOf("applyStatusUpdate"));
  const deleteFn = source.slice(source.indexOf("async function onConfirmDelete"));
  assert.ok(deleteFn.indexOf("if (!result.ok)") < deleteFn.indexOf("applyDeletion"));
});

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
