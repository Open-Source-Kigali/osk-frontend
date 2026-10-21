import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import test from "node:test";

const httpUrl = new URL("../src/api/http.ts", import.meta.url);
const formUrl = new URL("../src/api/partner-application-form.ts", import.meta.url);
const partnersFormPath = fileURLToPath(
  new URL("../src/pages/PartnersForm.tsx", import.meta.url),
);

const constantsUrl = new URL("../src/constants/partnersForm.ts", import.meta.url);

const { ApiRequestError, createApiClient } = await import(httpUrl);
const { buildPartnerApplicationFormData } = await import(formUrl);
const { ORG_SIZES, PARTNERSHIP_TIERS } = await import(constantsUrl);

const BASE = "https://api.example.test/api";

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function success(data, status = 200) {
  return jsonResponse({ success: true, message: "ok", data }, status);
}

function failure(message, status) {
  return jsonResponse({ success: false, message, data: null }, status);
}

function header(init, name) {
  return new Headers(init?.headers).get(name);
}

function createHarness(handler) {
  const calls = [];
  const fetchImpl = async (input, init) => {
    const url = String(input);
    calls.push({ url, init });
    return handler(url, init, calls);
  };
  const client = createApiClient({ baseUrl: BASE, fetch: fetchImpl });
  return { client, calls };
}

const admin = {
  id: "admin-1",
  name: "Admin",
  email: "admin@example.com",
  role: "ADMIN",
};

function applicationValues(overrides = {}) {
  return {
    orgName: "Kigali Hub",
    orgCategory: "Tech Company",
    orgSize: ORG_SIZES[1],
    country: "Rwanda",
    website: "https://hub.example",
    description: "We build with the community.",
    tier: PARTNERSHIP_TIERS[3].value,
    whatWeOffer: "Mentors, venue space, and workshop support.",
    projectIdea: "",
    contactName: "Aline",
    contactRole: "Partnerships Lead",
    contactEmail: "aline@hub.example",
    agreeToTerms: true,
    logoFile: new File([new Uint8Array([1, 2, 3])], "logo.png", {
      type: "image/png",
    }),
    ...overrides,
  };
}

test("public requests stay unauthenticated", async () => {
  const { client, calls } = createHarness(() =>
    success([{ id: "event-1" }]),
  );

  const events = await client.publicGet("/events");

  assert.deepEqual(events, [{ id: "event-1" }]);
  assert.equal(calls[0].url, `${BASE}/events`);
  assert.equal(calls[0].init.credentials, "same-origin");
  assert.equal(header(calls[0].init, "x-csrf-token"), null);
  assert.equal(header(calls[0].init, "x-api-key"), null);
  assert.equal(header(calls[0].init, "origin"), null);
});

test("error envelopes keep the server message", async () => {
  const { client } = createHarness(() =>
    failure("Description must be at most 300 characters", 400),
  );

  await assert.rejects(
    () => client.publicPost("/partner-applications", {}),
    (error) => {
      assert.ok(error instanceof ApiRequestError);
      assert.equal(error.status, 400);
      assert.equal(error.message, "Description must be at most 300 characters");
      return true;
    },
  );
});

test("login stores only the in-memory CSRF token and session check honors 401", async () => {
  const writes = [];
  const storage = {
    getItem() {
      return null;
    },
    setItem(key, value) {
      writes.push([key, value]);
    },
    removeItem() {},
    clear() {},
    key() {
      return null;
    },
    length: 0,
  };
  const previousLocal = globalThis.localStorage;
  const previousSession = globalThis.sessionStorage;
  globalThis.localStorage = storage;
  globalThis.sessionStorage = storage;

  let csrfCalls = 0;
  const { client, calls } = createHarness((url) => {
    if (url.endsWith("/auth/login")) {
      return success({
        user: admin,
        expiresAt: "2026-10-21T18:00:00.000Z",
        csrfToken: "from-login",
      });
    }
    if (url.endsWith("/auth/me")) {
      return failure("Authentication required", 401);
    }
    if (url.endsWith("/auth/csrf")) {
      csrfCalls += 1;
      return success({ csrfToken: "should-not-be-used" });
    }
    return success(null);
  });

  try {
    const session = await client.login("admin@example.com", "correct-password");
    assert.deepEqual(session, {
      user: admin,
      expiresAt: "2026-10-21T18:00:00.000Z",
    });
    assert.equal(calls[0].init.credentials, "include");
    assert.equal(header(calls[0].init, "x-csrf-token"), null);
    assert.equal(header(calls[0].init, "x-api-key"), null);
    assert.equal(JSON.parse(calls[0].init.body).password, "correct-password");
    assert.equal(writes.length, 0);
    assert.equal(csrfCalls, 0);

    const current = await client.getSession();
    assert.equal(current, null);
  } finally {
    globalThis.localStorage = previousLocal;
    globalThis.sessionStorage = previousSession;
  }
});

test("an active session uses the login CSRF token without refreshing it", async () => {
  let csrfCalls = 0;
  const { client, calls } = createHarness((url) => {
    if (url.endsWith("/auth/login")) {
      return success({
        user: admin,
        expiresAt: "2026-10-21T18:00:00.000Z",
        csrfToken: "from-login",
      });
    }
    if (url.endsWith("/auth/me")) {
      return success({
        user: admin,
        expiresAt: "2026-10-21T18:00:00.000Z",
      });
    }
    if (url.endsWith("/auth/csrf")) {
      csrfCalls += 1;
      return success({ csrfToken: "rotated" });
    }
    if (url.endsWith("/auth/logout")) {
      return success(null);
    }
    return success({ status: "APPROVED" });
  });

  await client.login("admin@example.com", "correct-password");
  const current = await client.getSession();
  assert.equal(current.user.email, admin.email);

  await client.sessionSend("/admin/reviews/review-1/status", "PATCH", {
    status: "APPROVED",
  });
  await client.logout();

  const mutation = calls.find((call) => call.url.endsWith("/status"));
  const logoutCall = calls.find((call) => call.url.endsWith("/auth/logout"));
  assert.equal(mutation.init.credentials, "include");
  assert.equal(header(mutation.init, "x-csrf-token"), "from-login");
  assert.equal(header(mutation.init, "x-api-key"), null);
  assert.equal(logoutCall.init.method, "POST");
  assert.equal(logoutCall.init.credentials, "include");
  assert.equal(header(logoutCall.init, "x-csrf-token"), "from-login");
  assert.equal(csrfCalls, 0);
});

test("parallel authenticated writes share one CSRF fetch", async () => {
  let release = () => {};
  const gate = new Promise((resolve) => {
    release = resolve;
  });
  let csrfCalls = 0;

  const { client, calls } = createHarness(async (url) => {
    if (url.endsWith("/auth/csrf")) {
      csrfCalls += 1;
      await gate;
      return success({ csrfToken: "shared-token" });
    }
    return success({ ok: true });
  });

  const first = client.sessionSend("/admin/reviews/1/status", "PATCH", {
    status: "APPROVED",
  });
  const second = client.sessionSend("/admin/reviews/2/status", "PATCH", {
    status: "REJECTED",
  });

  await Promise.resolve();
  assert.equal(csrfCalls, 1);
  assert.equal(calls.length, 1);
  release();
  await Promise.all([first, second]);

  assert.equal(csrfCalls, 1);
  const writes = calls.filter((call) => call.url.endsWith("/status"));
  assert.equal(writes.length, 2);
  assert.equal(header(writes[0].init, "x-csrf-token"), "shared-token");
  assert.equal(header(writes[1].init, "x-csrf-token"), "shared-token");
  assert.equal(writes[0].init.credentials, "include");
});

test("a CSRF failure does not retry the mutation", async () => {
  let csrfCalls = 0;
  const { client, calls } = createHarness((url) => {
    if (url.endsWith("/auth/csrf")) {
      csrfCalls += 1;
      return success({ csrfToken: `token-${csrfCalls}` });
    }
    if (url.endsWith("/auth/logout")) {
      return failure("Invalid CSRF token", 403);
    }
    return success(null);
  });

  await assert.rejects(() => client.logout(), (error) => {
    assert.ok(error instanceof ApiRequestError);
    assert.equal(error.status, 403);
    return true;
  });

  assert.equal(csrfCalls, 1);
  assert.equal(
    calls.filter((call) => call.url.endsWith("/auth/logout")).length,
    1,
  );
  assert.equal(header(calls.at(-1).init, "x-csrf-token"), "token-1");
});

test("partner applications use the public contract and not the admin partner route", async () => {
  const form = buildPartnerApplicationFormData(
    applicationValues({ projectIdea: "A documentation sprint" }),
  );
  const { client, calls } = createHarness(() =>
    success({ id: "application-1", status: "Pending" }, 201),
  );

  await client.publicPostForm("/partner-applications", form);

  assert.equal(calls[0].url, `${BASE}/partner-applications`);
  assert.equal(calls[0].init.credentials, "same-origin");
  assert.equal(calls[0].init.method, "POST");
  assert.equal(header(calls[0].init, "content-type"), null);
  assert.equal(header(calls[0].init, "x-csrf-token"), null);
  assert.equal(header(calls[0].init, "x-api-key"), null);
  assert.equal(form.get("organisationName"), "Kigali Hub");
  assert.equal(form.get("organisationType"), "Tech Company");
  assert.equal(form.get("organisationSize"), ORG_SIZES[1]);
  assert.equal(form.get("partnershipTier"), "Not Sure Yet");
  assert.equal(form.get("organisationOffer"), "Mentors, venue space, and workshop support.");
  assert.equal(form.get("projectIdea"), "A documentation sprint");
  assert.equal(form.get("fullName"), "Aline");
  assert.equal(form.get("jobTitle"), "Partnerships Lead");
  assert.equal(form.get("workEmail"), "aline@hub.example");
  assert.equal(form.get("agreedToTerms"), "true");
  assert.equal(form.get("file") instanceof File, true);
  assert.equal(form.get("status"), null);
  assert.equal(form.get("partershipReason"), null);
  assert.equal(form.get("name"), null);

  const source = await readFile(partnersFormPath, "utf8");
  assert.match(source, /submitPartnerApplication/);
  assert.match(source, /validateImageFile/);
  assert.doesNotMatch(source, /partershipReason/);
  assert.doesNotMatch(source, /postForm\(/);
});
