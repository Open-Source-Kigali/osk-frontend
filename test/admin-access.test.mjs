import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const accessUrl = new URL("../src/admin/access.ts", import.meta.url);
const httpUrl = new URL("../src/api/http.ts", import.meta.url);
const appPath = new URL("../src/App.tsx", import.meta.url);
const loginPath = new URL("../src/pages/admin/AdminLoginPage.tsx", import.meta.url);
const shellPath = new URL("../src/pages/admin/AdminShell.tsx", import.meta.url);
const navPath = new URL("../src/constants/navigation.ts", import.meta.url);

const {
  ADMIN_NAV,
  checkAdminSession,
  describeAdminScreen,
  endAdminSession,
  initialAdminGate,
  loginNotice,
  loginRedirectPath,
  performLogin,
  resolveAdminDestination,
  resolveLoginEntry,
  showsProtectedContent,
} = await import(accessUrl);
const { ApiRequestError, createApiClient } = await import(httpUrl);

const BASE = "https://api.example.test/api";
const admin = {
  id: "admin-1",
  name: "Aline Admin",
  email: "admin@example.com",
  role: "ADMIN",
};
const session = {
  user: admin,
  expiresAt: "2026-10-21T18:00:00.000Z",
};

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
    calls.push({ url: String(input), init });
    return handler(String(input), init, calls);
  };
  return { client: createApiClient({ baseUrl: BASE, fetch: fetchImpl }), calls };
}

test("login success returns only an internal admin destination", async () => {
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
      return success({ ...session, csrfToken: "from-login" });
    }
    if (url.endsWith("/auth/csrf")) {
      csrfCalls += 1;
      return success({ csrfToken: "rotated" });
    }
    return success(null);
  });

  try {
    const result = await performLogin(
      {
        email: " admin@example.com ",
        password: "correct-password",
        next: "/admin/reviews?status=PENDING",
      },
      client.login,
    );
    assert.deepEqual(result, {
      ok: true,
      destination: "/admin/reviews?status=PENDING",
    });
    assert.equal(JSON.stringify(result).includes("correct-password"), false);
    assert.equal(writes.length, 0);
    assert.equal(csrfCalls, 0);
    assert.equal(calls[0].init.credentials, "include");
    assert.equal(header(calls[0].init, "x-api-key"), null);
    assert.equal(header(calls[0].init, "origin"), null);
    assert.equal(JSON.parse(calls[0].init.body).email, "admin@example.com");
  } finally {
    globalThis.localStorage = previousLocal;
    globalThis.sessionStorage = previousSession;
  }
});

test("login failure shows the server message and does not navigate", async () => {
  const { client, calls } = createHarness((url) => {
    if (url.endsWith("/auth/login")) return failure("Invalid email or password", 401);
    throw new Error(url);
  });

  const result = await performLogin(
    { email: "admin@example.com", password: "wrong-password", next: "https://evil.test/admin" },
    client.login,
  );

  assert.equal(result.ok, false);
  assert.equal(result.message, "Invalid email or password");
  assert.deepEqual(result.fieldErrors, {});
  assert.equal("destination" in result, false);
  assert.equal(JSON.stringify(result).includes("wrong-password"), false);
  assert.equal(calls.length, 1);
});

test("invalid login fields never call the login helper", async () => {
  let calls = 0;
  const result = await performLogin(
    { email: "not-an-email", password: "", next: null },
    async () => {
      calls += 1;
      return session;
    },
  );
  assert.equal(calls, 0);
  assert.equal(result.ok, false);
  assert.equal(result.fieldErrors.email, "Enter a valid email address");
  assert.equal(result.fieldErrors.password, "Password is required");
});

test("admin destinations reject external and login redirects", () => {
  assert.equal(resolveAdminDestination(null), "/admin");
  assert.equal(resolveAdminDestination("/admin/events"), "/admin/events");
  assert.equal(resolveAdminDestination("https://evil.test/admin"), "/admin");
  assert.equal(resolveAdminDestination("//evil.test"), "/admin");
  assert.equal(resolveAdminDestination("/\\evil.test"), "/admin");
  assert.equal(resolveAdminDestination("/admin/../secret"), "/admin");
  assert.equal(resolveAdminDestination("/partners"), "/admin");
  assert.equal(resolveAdminDestination("/admin/login"), "/admin");
  assert.equal(resolveAdminDestination("javascript:alert(1)"), "/admin");
  assert.equal(
    resolveAdminDestination(decodeURIComponent("%2F%2Fevil.test")),
    "/admin",
  );
});

test("an existing session leaves the login form for the validated destination", async () => {
  const entry = await resolveLoginEntry(async () => session);
  assert.equal(entry, "redirect");
  assert.equal(resolveAdminDestination("/admin/members"), "/admin/members");
});

test("a missing or failed session check shows the login form", async () => {
  assert.equal(await resolveLoginEntry(async () => null), "form");
  assert.equal(
    await resolveLoginEntry(async () => {
      throw new Error("network down");
    }),
    "form",
  );
});

test("protected route stays on the loading screen before session validation", () => {
  const screen = describeAdminScreen(initialAdminGate(), "/admin/reviews");
  assert.deepEqual(screen, { kind: "loading" });
  assert.equal(showsProtectedContent(screen), false);
  assert.equal("session" in screen, false);
});

test("missing session redirects to admin login and hides protected content", async () => {
  const gate = await checkAdminSession(async () => null);
  const screen = describeAdminScreen(gate, "/admin/partner-applications");
  assert.equal(screen.kind, "redirect");
  assert.equal(
    screen.to,
    loginRedirectPath("/admin/partner-applications"),
  );
  assert.equal(screen.to, "/admin/login?next=%2Fadmin%2Fpartner-applications");
  assert.equal(showsProtectedContent(screen), false);
});

test("a valid session renders the admin shell", async () => {
  const gate = await checkAdminSession(async () => session);
  const screen = describeAdminScreen(gate, "/admin");
  assert.equal(screen.kind, "shell");
  assert.equal(showsProtectedContent(screen), true);
  assert.equal(screen.session.user.email, "admin@example.com");
  assert.deepEqual(
    ADMIN_NAV.map((item) => item.label),
    [
      "Dashboard",
      "Events",
      "Projects",
      "Partners",
      "Members",
      "Partner applications",
      "Reviews",
    ],
  );
});

test("a failed session check keeps admin pages closed", async () => {
  const gate = await checkAdminSession(async () => {
    throw new ApiRequestError("Service unavailable", 503);
  });
  const screen = describeAdminScreen(gate, "/admin/events");
  assert.equal(screen.kind, "unavailable");
  assert.equal(screen.message, "Service unavailable");
  assert.equal(showsProtectedContent(screen), false);
});

test("logout success is confirmed by the server before the client leaves admin", async () => {
  const { client, calls } = createHarness((url) => {
    if (url.endsWith("/auth/csrf")) return success({ csrfToken: "token-1" });
    if (url.endsWith("/auth/logout")) return success(null);
    throw new Error(url);
  });

  const result = await endAdminSession(client.logout);
  assert.deepEqual(result, { ok: true });
  const logoutCall = calls.find((call) => call.url.endsWith("/auth/logout"));
  assert.equal(logoutCall.init.credentials, "include");
  assert.equal(header(logoutCall.init, "x-csrf-token"), "token-1");
  assert.equal(header(logoutCall.init, "x-api-key"), null);
  assert.equal(calls.filter((call) => call.url.endsWith("/auth/logout")).length, 1);
});

test("logout failure keeps the admin page open", async () => {
  const { client, calls } = createHarness((url) => {
    if (url.endsWith("/auth/csrf")) return success({ csrfToken: "token-1" });
    if (url.endsWith("/auth/logout")) return failure("Invalid CSRF token", 403);
    throw new Error(url);
  });

  const result = await endAdminSession(client.logout);
  assert.equal(result.ok, false);
  assert.equal(result.sessionEnded, false);
  assert.match(result.message, /Sign-out was not confirmed/);
  assert.equal(calls.filter((call) => call.url.endsWith("/auth/logout")).length, 1);
});

test("a 401 during logout sends the user to sign in without claiming a new revocation", async () => {
  const { client } = createHarness((url) => {
    if (url.endsWith("/auth/csrf")) return success({ csrfToken: "token-1" });
    if (url.endsWith("/auth/logout")) return failure("Authentication required", 401);
    throw new Error(url);
  });

  const result = await endAdminSession(client.logout);
  assert.equal(result.ok, false);
  assert.equal(result.sessionEnded, true);
  assert.equal(loginNotice({ notice: result.message }), result.message);
  assert.equal(loginNotice(null), null);
});

test("admin routes are outside the public site and use the session helpers", async () => {
  const [app, login, shell, navigation] = await Promise.all([
    readFile(appPath, "utf8"),
    readFile(loginPath, "utf8"),
    readFile(shellPath, "utf8"),
    readFile(navPath, "utf8"),
  ]);

  assert.match(app, /path:\s*"\/admin\/login"/);
  assert.match(app, /path:\s*"\/admin"/);
  const publicRoutes = app.slice(
    app.indexOf("const router"),
    app.indexOf('path: "/admin/login"'),
  );
  assert.match(publicRoutes, /Component:\s*RootLayer/);
  assert.doesNotMatch(publicRoutes, /\/admin/);
  assert.doesNotMatch(navigation, /\/admin/);

  assert.match(login, /from "@\/api\/client"/);
  assert.match(login, /\blogin\b/);
  assert.match(login, /performLogin/);
  assert.match(login, /type="password"/);
  assert.doesNotMatch(login, /localStorage|sessionStorage|x-api-key/);

  assert.match(shell, /getSession/);
  assert.match(shell, /\blogout\b/);
  assert.match(shell, /describeAdminScreen/);
  const outletAt = shell.indexOf("<Outlet />");
  assert.ok(shell.indexOf('screen.kind === "loading"') < outletAt);
  assert.ok(shell.indexOf('screen.kind === "redirect"') < outletAt);
  assert.ok(shell.indexOf('screen.kind === "unavailable"') < outletAt);
  assert.doesNotMatch(shell, /localStorage|sessionStorage|x-api-key/);
});
