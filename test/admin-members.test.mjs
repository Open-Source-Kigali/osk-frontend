import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const membersUrl = new URL("../src/admin/members.ts", import.meta.url);
const httpUrl = new URL("../src/api/http.ts", import.meta.url);
const pagePath = new URL("../src/pages/admin/AdminMembersPage.tsx", import.meta.url);

const {
  UNCLEARABLE_MEMBER_FIELDS,
  beginPending,
  buildMemberPayload,
  confirmedDeletion,
  controlsLocked,
  deleteMember,
  formFromMember,
  initialMemberList,
  loadMemberList,
  memberResourcePath,
  readMemberList,
  saveMember,
  validateMemberForm,
} = await import(membersUrl);
const { ApiRequestError, createApiClient } = await import(httpUrl);

const saved = {
  id: "11111111-1111-1111-1111-111111111111",
  name: "Alice",
  email: "alice@example.com",
  githubUsername: "alice",
  orgName: "OSK",
  joinReason: "Love OSS",
  codingLevel: "intermediate",
  createdAt: "2026-10-01T00:00:00.000Z",
  updatedAt: "2026-10-02T00:00:00.000Z",
};

function values(overrides = {}) {
  return {
    name: "Alice",
    email: "alice@example.com",
    githubUsername: "alice",
    orgName: "OSK",
    joinReason: "Love OSS",
    codingLevel: "intermediate",
    ...overrides,
  };
}

test("members load as a complete list and accept an empty list", async () => {
  assert.equal(initialMemberList().status, "loading");

  const populated = await loadMemberList(async () => [saved]);
  assert.equal(populated.status, "ready");
  assert.equal(populated.members[0].name, "Alice");
  assert.equal(populated.members[0].codingLevel, "intermediate");
  assert.equal("createdAt" in populated.members[0], false);

  const empty = await loadMemberList(async () => []);
  assert.deepEqual(empty, { status: "ready", members: [] });
});

test("incomplete member payloads are rejected", async () => {
  assert.equal(readMemberList({ members: [saved] }), null);
  const broken = await loadMemberList(async () => [{ ...saved, codingLevel: "expert" }, saved]);
  assert.equal(broken.status, "invalid");
  const missing = await loadMemberList(async () => [{ ...saved, githubUsername: "" }]);
  assert.equal(missing.status, "invalid");
});

test("a list failure does not invent members", async () => {
  const failed = await loadMemberList(async () => {
    throw new ApiRequestError("Not Found", 404);
  });
  assert.equal(failed.status, "error");
  assert.equal(failed.message, "Not Found");

  const expired = await loadMemberList(async () => {
    throw new ApiRequestError("Authentication required", 401);
  });
  assert.equal(expired.status, "unauthorized");
  assert.equal(expired.message, "Your admin session is no longer active.");
});

test("edit sends the JSON update contract and keeps the saved member", async () => {
  const calls = [];
  const result = await saveMember(
    {
      async updateMember(id, payload) {
        calls.push({ id, payload });
        return { ...saved, name: "Alicia", codingLevel: "advanced" };
      },
    },
    saved.id,
    values({ name: " Alicia ", codingLevel: "advanced" }),
  );
  assert.equal(result.ok, true);
  assert.equal(result.member.name, "Alicia");
  assert.equal(calls[0].id, saved.id);
  assert.deepEqual(calls[0].payload, {
    name: "Alicia",
    email: "alice@example.com",
    githubUsername: "alice",
    orgName: "OSK",
    joinReason: "Love OSS",
    codingLevel: "advanced",
  });
  assert.equal("id" in calls[0].payload, false);
  assert.equal("createdAt" in calls[0].payload, false);
});

test("edit validation and server errors do not report success", async () => {
  let calls = 0;
  const invalid = await saveMember(
    {
      async updateMember() {
        calls += 1;
        return saved;
      },
    },
    saved.id,
    values({ email: "alice", orgName: "  " }),
  );
  assert.equal(invalid.ok, false);
  assert.equal(invalid.kind, "validation");
  assert.equal(invalid.fieldErrors.email, "Email format is invalid");
  assert.equal(invalid.fieldErrors.orgName, "Organization name is required");
  assert.equal(calls, 0);

  const rejected = await saveMember(
    {
      async updateMember() {
        throw new ApiRequestError("githubUsername: GitHub username is required", 400);
      },
    },
    saved.id,
    values(),
  );
  assert.equal(rejected.ok, false);
  assert.equal(rejected.fieldErrors.githubUsername, "GitHub username is required");

  const unusable = await saveMember(
    {
      async updateMember() {
        return { id: saved.id };
      },
    },
    saved.id,
    values(),
  );
  assert.equal(unusable.ok, false);
  assert.equal(unusable.message, "The server response did not include the saved member.");
});

test("blank fields are omitted and cannot clear a stored member", () => {
  const errors = validateMemberForm(values({ name: "", joinReason: "   " }));
  assert.equal(errors.name, "Name is required");
  assert.equal(errors.joinReason, "Join reason is required");

  const payload = buildMemberPayload(values({ orgName: "  ", joinReason: "" }));
  assert.equal("orgName" in payload, false);
  assert.equal("joinReason" in payload, false);
  assert.equal(payload.name, "Alice");
  assert.equal(payload.codingLevel, "intermediate");
  assert.deepEqual(UNCLEARABLE_MEMBER_FIELDS, [
    "name",
    "email",
    "githubUsername",
    "orgName",
    "joinReason",
    "codingLevel",
  ]);
});

test("edit failure keeps the failure message", async () => {
  const result = await saveMember(
    {
      async updateMember() {
        throw new ApiRequestError("Member not found", 404);
      },
    },
    "missing",
    values(),
  );
  assert.equal(result.ok, false);
  assert.equal(result.message, "Member not found");
});

test("delete confirmation, cancellation, success, and failure", async () => {
  assert.equal(confirmedDeletion(null, true), null);
  assert.equal(confirmedDeletion(saved, false), null);

  let deleted = 0;
  const id = confirmedDeletion(saved, true);
  const result = await deleteMember(
    {
      async deleteMember(memberId) {
        deleted += 1;
        assert.equal(memberId, id);
        return null;
      },
    },
    id,
  );
  assert.deepEqual(result, { ok: true });
  assert.equal(deleted, 1);

  const failed = await deleteMember(
    {
      async deleteMember() {
        throw new ApiRequestError("Member not found", 404);
      },
    },
    saved.id,
  );
  assert.equal(failed.ok, false);
  assert.equal(failed.message, "Member not found");
});

test("session expiry and forbidden writes do not count as saved", async () => {
  const expired = await saveMember(
    {
      async updateMember() {
        throw new ApiRequestError("Authentication required", 401);
      },
    },
    saved.id,
    values(),
  );
  assert.equal(expired.ok, false);
  assert.equal(expired.kind, "unauthorized");
  assert.equal(expired.message, "Your admin session is no longer active.");

  const forbidden = await deleteMember(
    {
      async deleteMember() {
        throw new ApiRequestError("Origin is not allowed", 403);
      },
    },
    saved.id,
  );
  assert.equal(forbidden.ok, false);
  assert.equal(forbidden.kind, "forbidden");
  assert.match(forbidden.message, /Origin is not allowed/);
});

test("pending actions block another submit or delete", () => {
  assert.equal(controlsLocked(null), false);
  assert.equal(controlsLocked("save"), true);
  assert.equal(beginPending("save", "delete"), null);
  assert.equal(beginPending(null, "delete"), "delete");
});

test("the JSON update uses the session client once", async () => {
  const calls = [];
  const fetchImpl = async (input, init) => {
    calls.push({ url: String(input), init });
    if (String(input).endsWith("/auth/csrf")) {
      return json({ success: true, message: "ok", data: { csrfToken: "token-1" } });
    }
    if (String(input).endsWith(`/members/${saved.id}`) && init.method === "PUT") {
      return json({ success: true, message: "updated", data: saved });
    }
    throw new Error(`${init.method} ${String(input)}`);
  };
  const client = createApiClient({ baseUrl: "https://api.example.test/api", fetch: fetchImpl });
  const result = await saveMember(
    {
      updateMember: (id, payload) => client.sessionSend(memberResourcePath(id), "PUT", payload),
    },
    saved.id,
    values(),
  );

  assert.equal(result.ok, true);
  const put = calls.find((call) => call.init.method === "PUT");
  assert.equal(put.init.credentials, "include");
  assert.equal(new Headers(put.init.headers).get("x-csrf-token"), "token-1");
  assert.equal(new Headers(put.init.headers).get("content-type"), "application/json");
  assert.equal(new Headers(put.init.headers).get("x-api-key"), null);
  assert.equal(JSON.parse(put.init.body).githubUsername, "alice");
  assert.equal(calls.filter((call) => call.init.method === "PUT").length, 1);
  assert.equal(calls.some((call) => call.init.method === "POST"), false);
});

test("the members page edits and deletes without creating members", async () => {
  const source = await readFile(pagePath, "utf8");
  assert.match(source, /apiGet<unknown>\("\/members"\)/);
  assert.match(source, /sessionSend<unknown>\(memberResourcePath\(id\), "PUT", payload\)/);
  assert.match(source, /sessionSend<unknown>\(memberResourcePath\(id\), "DELETE"\)/);
  assert.match(source, /disabled=\{locked\}/);
  assert.match(source, /Keep member/);
  assert.match(source, /cannot be cleared/);
  assert.match(source, /does not register new ones/);
  assert.match(source, /confirmedDeletion\(deleteTarget, true\)/);
  assert.doesNotMatch(source, /localStorage|sessionStorage|x-api-key|sessionForm|New member/);
  const saveFn = source.slice(source.indexOf("async function onSave"), source.indexOf("async function onConfirmDelete"));
  assert.ok(saveFn.indexOf("if (!result.ok)") < saveFn.indexOf("await reload"));
  assert.equal(formFromMember(readMemberList([saved])[0]).githubUsername, "alice");
});

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
