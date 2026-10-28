import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const partnersUrl = new URL("../src/admin/partners.ts", import.meta.url);
const httpUrl = new URL("../src/api/http.ts", import.meta.url);
const pagePath = new URL("../src/pages/admin/AdminPartnersPage.tsx", import.meta.url);

const {
  EMPTY_PARTNER_FORM,
  UNCLEARABLE_PARTNER_FIELDS,
  beginPending,
  buildPartnerFormData,
  confirmedDeletion,
  controlsLocked,
  deletePartner,
  formFromPartner,
  initialPartnerList,
  loadPartnerList,
  partnerResourcePath,
  readPartnerList,
  savePartner,
  validatePartnerForm,
} = await import(partnersUrl);
const { ApiRequestError, createApiClient } = await import(httpUrl);

const saved = {
  id: "11111111-1111-1111-1111-111111111111",
  name: "KLab",
  websiteUrl: "https://klab.rw",
  logoUrl: "https://cdn.example/klab.png",
  logoPublicId: "partners/klab",
  description: "A Kigali technology hub.",
  email: "hello@klab.rw",
  partnershipReason: "Hosts community sessions.",
};

function values(overrides = {}) {
  return {
    ...EMPTY_PARTNER_FORM,
    name: "KLab",
    websiteUrl: "https://klab.rw",
    description: "A Kigali technology hub.",
    email: "hello@klab.rw",
    partnershipReason: "Hosts community sessions.",
    ...overrides,
  };
}

function logo() {
  return new File([Uint8Array.from([1, 2, 3])], "logo.png", { type: "image/png" });
}

test("partners load as a complete list and accept an empty list", async () => {
  assert.equal(initialPartnerList().status, "loading");

  const populated = await loadPartnerList(async () => [saved]);
  assert.equal(populated.status, "ready");
  assert.equal(populated.partners[0].name, "KLab");
  assert.equal(populated.partners[0].logoUrl, saved.logoUrl);
  assert.equal("logoPublicId" in populated.partners[0], false);

  const empty = await loadPartnerList(async () => []);
  assert.deepEqual(empty, { status: "ready", partners: [] });
});

test("incomplete partner payloads are rejected", async () => {
  assert.equal(readPartnerList({ partners: [saved] }), null);
  const broken = await loadPartnerList(async () => [{ ...saved, email: "" }, saved]);
  assert.equal(broken.status, "invalid");
  const badLogo = await loadPartnerList(async () => [{ ...saved, logoPublicId: 12 }]);
  assert.equal(badLogo.status, "invalid");
});

test("a list failure does not invent partners", async () => {
  const failed = await loadPartnerList(async () => {
    throw new ApiRequestError("Not Found", 404);
  });
  assert.equal(failed.status, "error");
  assert.equal(failed.message, "Not Found");

  const expired = await loadPartnerList(async () => {
    throw new ApiRequestError("Authentication required", 401);
  });
  assert.equal(expired.status, "unauthorized");
  assert.equal(expired.message, "Your admin session is no longer active.");
});

test("create sends the partner contract and keeps the saved partner", async () => {
  let calls = 0;
  const client = {
    async createPartner(form) {
      calls += 1;
      assert.equal(form.get("name"), "KLab");
      assert.equal(form.get("websiteUrl"), "https://klab.rw");
      assert.equal(form.get("description"), "A Kigali technology hub.");
      assert.equal(form.get("email"), "hello@klab.rw");
      assert.equal(form.get("partnershipReason"), "Hosts community sessions.");
      assert.equal(form.get("file") instanceof File, true);
      assert.equal(form.get("logoUrl"), null);
      assert.equal(form.get("logoPublicId"), null);
      return saved;
    },
    async updatePartner() {
      throw new Error("update was not requested");
    },
  };

  const created = await savePartner(client, { intent: "create" }, values(), logo(), null);
  assert.equal(created.ok, true);
  assert.equal(created.partner.name, "KLab");
  assert.equal(calls, 1);
});

test("create validation and server errors do not report success", async () => {
  let calls = 0;
  const client = {
    async createPartner() {
      calls += 1;
      return saved;
    },
    async updatePartner() {
      return saved;
    },
  };

  const invalid = await savePartner(client, { intent: "create" }, values({ websiteUrl: "klab.rw", email: "hello" }), null, null);
  assert.equal(invalid.ok, false);
  assert.equal(invalid.kind, "validation");
  assert.equal(invalid.fieldErrors.websiteUrl, "Website URL must be a valid URL");
  assert.equal(invalid.fieldErrors.email, "Email format is invalid");
  assert.equal(invalid.fieldErrors.file, "Logo file is required");
  assert.equal(calls, 0);

  const rejected = await savePartner(
    {
      async createPartner() {
        throw new ApiRequestError("email: Email format is invalid; Logo file is required", 400);
      },
      async updatePartner() {
        return saved;
      },
    },
    { intent: "create" },
    values(),
    logo(),
    null,
  );
  assert.equal(rejected.ok, false);
  assert.equal(rejected.fieldErrors.email, "Email format is invalid");
  assert.equal(rejected.fieldErrors.file, "Logo file is required");

  const unusable = await savePartner(
    {
      async createPartner() {
        return { id: saved.id };
      },
      async updatePartner() {
        return saved;
      },
    },
    { intent: "create" },
    values(),
    logo(),
    null,
  );
  assert.equal(unusable.ok, false);
  assert.equal(unusable.message, "The server response did not include the saved partner.");
});

test("edit sends a PUT body and can omit a replacement logo", async () => {
  const calls = [];
  const result = await savePartner(
    {
      async createPartner() {
        throw new Error("create was not requested");
      },
      async updatePartner(id, form) {
        calls.push({ id, form });
        return { ...saved, description: "Updated description." };
      },
    },
    { intent: "edit", id: saved.id },
    values({ description: "Updated description." }),
    null,
    null,
  );
  assert.equal(result.ok, true);
  assert.equal(result.partner.description, "Updated description.");
  assert.equal(calls[0].id, saved.id);
  assert.equal(calls[0].form.get("description"), "Updated description.");
  assert.equal(calls[0].form.get("file"), null);
  assert.equal(calls[0].form.get("logoUrl"), null);
});

test("blank fields are rejected and are not submitted as empty values", async () => {
  let calls = 0;
  const result = await savePartner(
    {
      async createPartner() {
        calls += 1;
        return saved;
      },
      async updatePartner() {
        calls += 1;
        return saved;
      },
    },
    { intent: "edit", id: saved.id },
    values({ partnershipReason: "   ", name: "" }),
    null,
    null,
  );
  assert.equal(result.ok, false);
  assert.equal(result.kind, "validation");
  assert.equal(result.fieldErrors.name, "Name is required");
  assert.equal(result.fieldErrors.partnershipReason, "Partnership reason is required");
  assert.equal(calls, 0);

  const form = buildPartnerFormData(values({ description: "  ", email: "" }), null);
  assert.equal(form.get("description"), null);
  assert.equal(form.get("email"), null);
  assert.equal(form.get("name"), "KLab");
  assert.deepEqual(UNCLEARABLE_PARTNER_FIELDS, [
    "name",
    "websiteUrl",
    "description",
    "email",
    "partnershipReason",
    "logo",
  ]);
});

test("edit failure keeps the failure message", async () => {
  const result = await savePartner(
    {
      async createPartner() {
        return saved;
      },
      async updatePartner() {
        throw new ApiRequestError("Partner not found", 404);
      },
    },
    { intent: "edit", id: "missing" },
    values(),
    null,
    null,
  );
  assert.equal(result.ok, false);
  assert.equal(result.message, "Partner not found");
});

test("delete confirmation, cancellation, success, and failure", async () => {
  assert.equal(confirmedDeletion(null, true), null);
  assert.equal(confirmedDeletion(saved, false), null);

  let deleted = 0;
  const id = confirmedDeletion(saved, true);
  const result = await deletePartner(
    {
      async deletePartner(partnerId) {
        deleted += 1;
        assert.equal(partnerId, id);
        return null;
      },
    },
    id,
  );
  assert.deepEqual(result, { ok: true });
  assert.equal(deleted, 1);

  const failed = await deletePartner(
    {
      async deletePartner() {
        throw new ApiRequestError("Partner not found", 404);
      },
    },
    saved.id,
  );
  assert.equal(failed.ok, false);
  assert.equal(failed.message, "Partner not found");
});

test("session expiry and forbidden writes do not count as saved", async () => {
  const expired = await savePartner(
    {
      async createPartner() {
        throw new ApiRequestError("Authentication required", 401);
      },
      async updatePartner() {
        return saved;
      },
    },
    { intent: "create" },
    values(),
    logo(),
    null,
  );
  assert.equal(expired.ok, false);
  assert.equal(expired.kind, "unauthorized");
  assert.equal(expired.message, "Your admin session is no longer active.");

  const forbidden = await deletePartner(
    {
      async deletePartner() {
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

test("the multipart write uses the session client once", async () => {
  const calls = [];
  const fetchImpl = async (input, init) => {
    calls.push({ url: String(input), init });
    if (String(input).endsWith("/auth/csrf")) {
      return json({ success: true, message: "ok", data: { csrfToken: "token-1" } });
    }
    if (String(input).endsWith("/partners") && init.method === "POST") {
      return json({ success: true, message: "created", data: saved }, 201);
    }
    throw new Error(String(input));
  };
  const client = createApiClient({ baseUrl: "https://api.example.test/api", fetch: fetchImpl });
  const result = await savePartner(
    {
      createPartner: (form) => client.sessionForm("/partners", "POST", form),
      updatePartner: (id, form) => client.sessionForm(partnerResourcePath(id), "PUT", form),
    },
    { intent: "create" },
    values(),
    logo(),
    null,
  );

  assert.equal(result.ok, true);
  const post = calls.find((call) => call.url.endsWith("/partners") && call.init.method === "POST");
  assert.equal(post.init.credentials, "include");
  assert.equal(new Headers(post.init.headers).get("x-csrf-token"), "token-1");
  assert.equal(new Headers(post.init.headers).get("content-type"), null);
  assert.equal(new Headers(post.init.headers).get("x-api-key"), null);
  assert.equal(calls.filter((call) => call.init.method === "POST").length, 1);
});

test("the partners page uses the session helpers and does not clear the list on failure", async () => {
  const source = await readFile(pagePath, "utf8");
  assert.match(source, /apiGet<unknown>\("\/partners"\)/);
  assert.match(source, /sessionForm<unknown>\("\/partners", "POST", form\)/);
  assert.match(source, /sessionForm<unknown>\(partnerResourcePath\(id\), "PUT", form\)/);
  assert.match(source, /sessionSend<unknown>\(partnerResourcePath\(id\), "DELETE"\)/);
  assert.match(source, /validateImageFile/);
  assert.match(source, /IMAGE_UPLOAD_ACCEPT/);
  assert.match(source, /disabled=\{locked\}/);
  assert.match(source, /Keep partner/);
  assert.match(source, /cannot be cleared/);
  assert.match(source, /confirmedDeletion\(deleteTarget, true\)/);
  assert.doesNotMatch(source, /localStorage|sessionStorage|x-api-key|partner-applications/);
  const saveFn = source.slice(source.indexOf("async function onSave"), source.indexOf("async function onConfirmDelete"));
  assert.ok(saveFn.indexOf("if (!result.ok)") < saveFn.indexOf("await reload"));
  assert.equal(formFromPartner(readPartnerList([saved])[0]).email, "hello@klab.rw");
  assert.equal(validatePartnerForm(values(), { requireLogo: false, imageError: "Use a PNG image." }).file, "Use a PNG image.");
});

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
