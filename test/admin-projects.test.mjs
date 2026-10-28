import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const projectsUrl = new URL("../src/admin/projects.ts", import.meta.url);
const httpUrl = new URL("../src/api/http.ts", import.meta.url);
const pagePath = new URL("../src/pages/admin/AdminProjectsPage.tsx", import.meta.url);

const {
  EMPTY_PROJECT_FORM,
  PROJECT_PAGE_SIZE,
  beginPending,
  buildProjectFormData,
  confirmedDeletion,
  controlsLocked,
  deleteProject,
  formFromProject,
  initialProjectList,
  loadProjectPage,
  pageAfterSave,
  pageToReloadAfterDelete,
  projectResourcePath,
  projectsListPath,
  readProjectPage,
  refreshProjectCache,
  refreshSummary,
  saveProject,
  validateProjectForm,
} = await import(projectsUrl);
const { ApiRequestError, createApiClient } = await import(httpUrl);

const saved = {
  id: "11111111-1111-1111-1111-111111111111",
  slug: "osk-backend",
  repoOwner: "Open-Source-Kigali",
  repoName: "osk-backend",
  imageUrl: "https://cdn.example/project.png",
  tagline: "Community API",
  category: "backend",
  status: "active",
  featured: false,
  maintainer: "Ada",
  langColor: "#3178c6",
  ghStars: 12,
  ghLanguage: "TypeScript",
};

function values(overrides = {}) {
  return {
    ...EMPTY_PROJECT_FORM,
    slug: "osk-backend",
    repoOwner: "Open-Source-Kigali",
    repoName: "osk-backend",
    tagline: "Community API",
    category: "backend",
    status: "active",
    featured: true,
    maintainer: "Ada",
    langColor: "#3178c6",
    ...overrides,
  };
}

function file() {
  return new File([Uint8Array.from([1, 2, 3])], "cover.png", { type: "image/png" });
}

function pageOf(count, slugPrefix = "project") {
  return Array.from({ length: count }, (_, index) => ({
    ...saved,
    id: `11111111-1111-1111-1111-${String(index + 1).padStart(12, "0")}`,
    slug: `${slugPrefix}-${index + 1}`,
  }));
}

test("project pages load from the paginated array and do not invent a total", async () => {
  assert.equal(PROJECT_PAGE_SIZE, 10);
  assert.equal(projectsListPath(2), "/projects?page=2&limit=10");
  assert.equal(projectsListPath(0), "/projects?page=1&limit=10");
  assert.deepEqual(initialProjectList(2), { status: "loading", page: 2 });

  const full = await loadProjectPage(async (page) => {
    assert.equal(page, 1);
    return pageOf(10);
  }, 1);
  assert.equal(full.status, "ready");
  assert.equal(full.projects.length, 10);
  assert.equal(full.hasNextPage, true);
  assert.equal("total" in full, false);

  const last = await loadProjectPage(async () => pageOf(3), 2);
  assert.equal(last.status, "ready");
  assert.equal(last.page, 2);
  assert.equal(last.hasNextPage, false);

  const empty = await loadProjectPage(async () => [], 1);
  assert.deepEqual(empty, { status: "ready", page: 1, projects: [], hasNextPage: false });
});

test("a malformed project page fails instead of dropping rows", async () => {
  const envelope = await loadProjectPage(async () => ({ projects: [saved] }), 1);
  assert.equal(envelope.status, "invalid");

  const broken = await loadProjectPage(async () => [{ ...saved, status: "draft" }, saved], 1);
  assert.equal(broken.status, "invalid");
  assert.equal(readProjectPage([{ ...saved, ghStars: "12" }]), null);
});

test("pagination moves to the previous page after the last item on a later page is removed", () => {
  assert.equal(pageToReloadAfterDelete(2, 1), 1);
  assert.equal(pageToReloadAfterDelete(2, 4), 2);
  assert.equal(pageToReloadAfterDelete(1, 1), 1);
  assert.equal(pageAfterSave("create", 3), 1);
  assert.equal(pageAfterSave("edit", 3), 3);
});

test("create sends the project contract and does not call the API when invalid", async () => {
  let calls = 0;
  const client = {
    async createProject(form) {
      calls += 1;
      assert.equal(form.get("slug"), "osk-backend");
      assert.equal(form.get("repoOwner"), "Open-Source-Kigali");
      assert.equal(form.get("repoName"), "osk-backend");
      assert.equal(form.get("tagline"), "Community API");
      assert.equal(form.get("category"), "backend");
      assert.equal(form.get("status"), "active");
      assert.equal(form.get("featured"), "true");
      assert.equal(form.get("maintainer"), "Ada");
      assert.equal(form.get("langColor"), "#3178c6");
      assert.equal(form.get("file") instanceof File, true);
      assert.equal(form.get("ghStars"), null);
      return saved;
    },
    async updateProject() {
      throw new Error("update was not requested");
    },
  };

  const invalid = await saveProject(client, { intent: "create" }, values({ slug: "OSK 2" }), null, null);
  assert.equal(invalid.ok, false);
  assert.equal(invalid.kind, "validation");
  assert.match(invalid.fieldErrors.slug, /lowercase with hyphens only/);
  assert.equal(calls, 0);

  const missingImage = await saveProject(client, { intent: "create" }, values(), null, null);
  assert.equal(missingImage.fieldErrors.file, "Image file is required");
  assert.equal(calls, 0);

  const created = await saveProject(client, { intent: "create" }, values(), file(), null);
  assert.equal(created.ok, true);
  assert.equal(calls, 1);
});

test("server validation is mapped onto project fields", async () => {
  const result = await saveProject(
    {
      async createProject() {
        throw new ApiRequestError("slug: Slug must be lowercase with hyphens only, no spaces or special characters", 400);
      },
      async updateProject() {
        return saved;
      },
    },
    { intent: "create" },
    values(),
    file(),
    null,
  );
  assert.equal(result.ok, false);
  assert.match(result.fieldErrors.slug, /hyphens only/);
});

test("edit updates without replacing the image and can omit a blank optional field", async () => {
  const calls = [];
  const result = await saveProject(
    {
      async createProject() {
        throw new Error("create was not requested");
      },
      async updateProject(id, form) {
        calls.push({ id, form });
        return { ...saved, featured: false, status: "paused" };
      },
    },
    { intent: "edit", id: saved.id },
    values({ featured: false, status: "paused", maintainer: "  " }),
    null,
    null,
  );
  assert.equal(result.ok, true);
  assert.equal(result.project.status, "paused");
  assert.equal(calls[0].id, saved.id);
  assert.equal(calls[0].form.get("featured"), "false");
  assert.equal(calls[0].form.get("maintainer"), null);
  assert.equal(calls[0].form.get("file"), null);
});

test("edit failure keeps the failure message", async () => {
  const result = await saveProject(
    {
      async createProject() {
        return saved;
      },
      async updateProject() {
        throw new ApiRequestError("Project not found", 404);
      },
    },
    { intent: "edit", id: "missing" },
    values(),
    null,
    null,
  );
  assert.equal(result.ok, false);
  assert.equal(result.message, "Project not found");
});

test("delete confirmation, cancellation, success, and failure", async () => {
  assert.equal(confirmedDeletion(null, true), null);
  assert.equal(confirmedDeletion(saved, false), null);

  let deleted = 0;
  const id = confirmedDeletion(saved, true);
  const result = await deleteProject(
    {
      async deleteProject(projectId) {
        deleted += 1;
        assert.equal(projectId, id);
        return null;
      },
    },
    id,
  );
  assert.deepEqual(result, { ok: true });
  assert.equal(deleted, 1);

  const failed = await deleteProject(
    {
      async deleteProject() {
        throw new ApiRequestError("Project not found", 404);
      },
    },
    saved.id,
  );
  assert.equal(failed.ok, false);
  assert.equal(failed.message, "Project not found");
});

test("session expiry and forbidden writes do not count as saved", async () => {
  const expired = await saveProject(
    {
      async createProject() {
        throw new ApiRequestError("Authentication required", 401);
      },
      async updateProject() {
        return saved;
      },
    },
    { intent: "create" },
    values(),
    file(),
    null,
  );
  assert.equal(expired.ok, false);
  assert.equal(expired.kind, "unauthorized");
  assert.equal(expired.message, "Your admin session is no longer active.");

  const forbidden = await deleteProject(
    {
      async deleteProject() {
        throw new ApiRequestError("Origin is not allowed", 403);
      },
    },
    saved.id,
  );
  assert.equal(forbidden.ok, false);
  assert.equal(forbidden.kind, "forbidden");
  assert.match(forbidden.message, /Origin is not allowed/);
});

test("pending actions block another submit, delete, or refresh", () => {
  assert.equal(controlsLocked(null), false);
  assert.equal(controlsLocked("refresh"), true);
  assert.equal(beginPending("save", "refresh"), null);
  assert.equal(beginPending(null, "refresh"), "refresh");
});

test("refresh reports each project and does not run while loading the list", async () => {
  let refreshed = 0;
  const loaded = await loadProjectPage(async () => {
    refreshed += 1;
    return [saved];
  }, 1);
  assert.equal(loaded.status, "ready");
  assert.equal(refreshed, 1);

  const mixed = await refreshProjectCache(async () => {
    refreshed += 1;
    return [
      { id: saved.id, slug: saved.slug, ok: true },
      { id: "22222222-2222-2222-2222-222222222222", slug: "missing-repo", ok: false, error: "Not Found" },
    ];
  });
  assert.equal(mixed.ok, true);
  assert.equal(refreshSummary(mixed.items), "Refreshed 1 of 2 projects. 1 failed.");
  assert.equal(refreshed, 2);

  const empty = await refreshProjectCache(async () => []);
  assert.equal(refreshSummary(empty.items), "No projects were refreshed.");

  const malformed = await refreshProjectCache(async () => ({ totalParsed: 1, success: 1 }));
  assert.equal(malformed.ok, false);

  const denied = await refreshProjectCache(async () => {
    throw new ApiRequestError("Authentication required", 401);
  });
  assert.equal(denied.ok, false);
  assert.equal(denied.kind, "unauthorized");
});

test("project writes use the session client once", async () => {
  const calls = [];
  const fetchImpl = async (input, init) => {
    calls.push({ url: String(input), init });
    if (String(input).endsWith("/auth/csrf")) {
      return json({ success: true, message: "ok", data: { csrfToken: "token-1" } });
    }
    if (String(input).endsWith("/projects") && init.method === "POST") {
      return json({ success: true, message: "created", data: saved }, 201);
    }
    if (String(input).endsWith("/projects/refresh") && init.method === "POST") {
      return json({ success: true, message: "Refresh completed", data: [{ id: saved.id, slug: saved.slug, ok: true }] });
    }
    throw new Error(String(input));
  };
  const client = createApiClient({ baseUrl: "https://api.example.test/api", fetch: fetchImpl });
  const created = await saveProject(
    {
      createProject: (form) => client.sessionForm("/projects", "POST", form),
      updateProject: (id, form) => client.sessionForm(projectResourcePath(id), "PUT", form),
    },
    { intent: "create" },
    values(),
    file(),
    null,
  );
  assert.equal(created.ok, true);
  const post = calls.find((call) => call.url.endsWith("/projects") && call.init.method === "POST");
  assert.equal(post.init.credentials, "include");
  assert.equal(new Headers(post.init.headers).get("x-csrf-token"), "token-1");
  assert.equal(new Headers(post.init.headers).get("content-type"), null);
  assert.equal(new Headers(post.init.headers).get("x-api-key"), null);

  const refreshed = await refreshProjectCache(() => client.sessionSend("/projects/refresh", "POST"));
  assert.equal(refreshed.ok, true);
  const refresh = calls.find((call) => call.url.endsWith("/projects/refresh"));
  assert.equal(refresh.init.credentials, "include");
  assert.equal(refresh.init.body, undefined);
  assert.equal(new Headers(refresh.init.headers).get("x-api-key"), null);
});

test("the projects page keeps refresh separate and disables pending controls", async () => {
  const source = await readFile(pagePath, "utf8");
  assert.match(source, /apiGet<unknown>\(projectsListPath\(page\)\)/);
  assert.match(source, /sessionForm<unknown>\("\/projects", "POST", form\)/);
  assert.match(source, /sessionForm<unknown>\(projectResourcePath\(id\), "PUT", form\)/);
  assert.match(source, /sessionSend<unknown>\(projectResourcePath\(id\), "DELETE"\)/);
  assert.match(source, /sessionSend<unknown>\("\/projects\/refresh", "POST"\)/);
  assert.match(source, /validateImageFile/);
  assert.match(source, /disabled=\{locked\}/);
  assert.match(source, /Keep project/);
  assert.match(source, /Keep cached data/);
  assert.match(source, /confirmedDeletion\(deleteTarget, true\)/);
  assert.match(source, /pageToReloadAfterDelete/);
  assert.doesNotMatch(source, /localStorage|sessionStorage|x-api-key/);
  const effect = source.slice(source.indexOf("useEffect("), source.indexOf("function openCreate"));
  assert.match(effect, /loadProjectPage/);
  assert.doesNotMatch(effect, /refreshProjects/);
  assert.equal(formFromProject(readProjectPage([saved])[0]).featured, false);
  assert.equal(buildProjectFormData(values(), null).get("status"), "active");
});

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
