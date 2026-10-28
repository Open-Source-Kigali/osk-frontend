import { ApiRequestError } from "../api/http.ts";

/**
 * GET /projects is public and paginated with `page` and `limit`.
 * The response is only the current page, with no total count.
 * The backend default page size is 10 and the first page is 1.
 * POST /projects/refresh reloads cached GitHub fields for every project.
 * It is not part of create, update, or delete.
 */

export const PROJECT_PAGE_SIZE = 10;

export const PROJECT_STATUSES = [
  { value: "active", label: "Active" },
  { value: "archived", label: "Archived" },
  { value: "paused", label: "Paused" },
] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number]["value"];

const SLUG_PATTERN = /^[a-z]+(?:-[a-z]+)*$/;

export const SESSION_EXPIRED_MESSAGE = "Your admin session is no longer active.";
export const PROJECT_UNCHANGED_MESSAGE = "The project was not changed.";

const FIELD_NAMES = [
  "slug",
  "repoOwner",
  "repoName",
  "tagline",
  "category",
  "status",
  "maintainer",
  "langColor",
  "file",
] as const;

export type ProjectField = (typeof FIELD_NAMES)[number];
export type ProjectFieldErrors = Partial<Record<ProjectField, string>>;

export type ProjectFormValues = {
  slug: string;
  repoOwner: string;
  repoName: string;
  tagline: string;
  category: string;
  status: ProjectStatus;
  featured: boolean;
  maintainer: string;
  langColor: string;
};

export type AdminProject = {
  id: string;
  slug: string;
  repoOwner: string;
  repoName: string;
  imageUrl: string | null;
  tagline: string;
  category: string;
  status: ProjectStatus;
  featured: boolean;
  maintainer: string | null;
  langColor: string | null;
  ghStars: number | null;
  ghLanguage: string | null;
};

export type RefreshItem = {
  id: string;
  slug: string;
  ok: boolean;
  error: string | null;
};

export type ProjectListState =
  | { status: "loading"; page: number }
  | { status: "ready"; page: number; projects: AdminProject[]; hasNextPage: boolean }
  | { status: "invalid"; page: number; message: string }
  | { status: "error"; page: number; message: string }
  | { status: "unauthorized"; page: number; message: string };

export type PendingAction = "save" | "delete" | "refresh";

export type SaveResult =
  | { ok: true; project: AdminProject }
  | {
      ok: false;
      kind: "validation" | "unauthorized" | "forbidden" | "error";
      message: string | null;
      fieldErrors: ProjectFieldErrors;
    };

export type DeleteResult =
  | { ok: true }
  | { ok: false; kind: "unauthorized" | "forbidden" | "error"; message: string };

export type RefreshResult =
  | { ok: true; items: RefreshItem[] }
  | { ok: false; kind: "unauthorized" | "forbidden" | "error"; message: string };

export const EMPTY_PROJECT_FORM: ProjectFormValues = {
  slug: "",
  repoOwner: "",
  repoName: "",
  tagline: "",
  category: "",
  status: "active",
  featured: false,
  maintainer: "",
  langColor: "",
};

export function initialProjectList(page = 1): ProjectListState {
  return { status: "loading", page: normalizePage(page) };
}

export function controlsLocked(action: PendingAction | null): boolean {
  return action !== null;
}

export function beginPending(
  current: PendingAction | null,
  next: PendingAction,
): PendingAction | null {
  if (current) return null;
  return next;
}

export function projectsListPath(page: number): string {
  return `/projects?page=${normalizePage(page)}&limit=${PROJECT_PAGE_SIZE}`;
}

export function projectResourcePath(id: string): string {
  return `/projects/${encodeURIComponent(id)}`;
}

export function pageAfterSave(intent: "create" | "edit", currentPage: number): number {
  if (intent === "create") return 1;
  return normalizePage(currentPage);
}

export function pageToReloadAfterDelete(page: number, itemsOnPage: number): number {
  const current = normalizePage(page);
  if (itemsOnPage <= 1 && current > 1) return current - 1;
  return current;
}

export function formFromProject(project: AdminProject): ProjectFormValues {
  return {
    slug: project.slug,
    repoOwner: project.repoOwner,
    repoName: project.repoName,
    tagline: project.tagline,
    category: project.category,
    status: project.status,
    featured: project.featured,
    maintainer: project.maintainer ?? "",
    langColor: project.langColor ?? "",
  };
}

export function validateProjectForm(
  values: ProjectFormValues,
  options: { requireImage: boolean; imageError: string | null },
): ProjectFieldErrors {
  const errors: ProjectFieldErrors = {};
  const slug = values.slug.trim();
  if (!slug) errors.slug = "Slug is required";
  else if (!SLUG_PATTERN.test(slug)) {
    errors.slug = "Slug must be lowercase with hyphens only, no spaces or special characters";
  }
  if (!values.repoOwner.trim()) errors.repoOwner = "Repository owner is required and cannot be empty";
  if (!values.repoName.trim()) errors.repoName = "Repository name is required and cannot be empty";
  if (!values.tagline.trim()) errors.tagline = "Tagline is required";
  if (!values.category.trim()) errors.category = "Category is required";
  if (!PROJECT_STATUSES.some((status) => status.value === values.status)) {
    errors.status = "Status must be active, archived, or paused";
  }
  if (options.imageError) errors.file = options.imageError;
  else if (options.requireImage) errors.file = "Image file is required";
  return errors;
}

export function buildProjectFormData(
  values: ProjectFormValues,
  file: File | null,
): FormData {
  const form = new FormData();
  form.set("slug", values.slug.trim());
  form.set("repoOwner", values.repoOwner.trim());
  form.set("repoName", values.repoName.trim());
  form.set("tagline", values.tagline.trim());
  form.set("category", values.category.trim());
  form.set("status", values.status);
  form.set("featured", values.featured ? "true" : "false");
  appendOptional(form, "maintainer", values.maintainer);
  appendOptional(form, "langColor", values.langColor);
  if (file) form.set("file", file);
  return form;
}

export function readProject(data: unknown): AdminProject | null {
  if (!isRecord(data)) return null;
  if (!isNonEmptyString(data.id) || !isNonEmptyString(data.slug)) return null;
  if (!isNonEmptyString(data.repoOwner) || !isNonEmptyString(data.repoName)) return null;
  if (typeof data.tagline !== "string" || typeof data.category !== "string") return null;
  if (typeof data.featured !== "boolean" || !isProjectStatus(data.status)) return null;
  const maintainer = optionalString(data.maintainer);
  const langColor = optionalString(data.langColor);
  const imageUrl = optionalString(data.imageUrl);
  const ghLanguage = optionalString(data.ghLanguage);
  const ghStars = optionalCount(data.ghStars);
  if (
    maintainer === false ||
    langColor === false ||
    imageUrl === false ||
    ghLanguage === false ||
    ghStars === false
  ) {
    return null;
  }

  return {
    id: data.id,
    slug: data.slug,
    repoOwner: data.repoOwner,
    repoName: data.repoName,
    imageUrl: imageUrl ?? null,
    tagline: data.tagline,
    category: data.category,
    status: data.status,
    featured: data.featured,
    maintainer: maintainer ?? null,
    langColor: langColor ?? null,
    ghStars: ghStars ?? null,
    ghLanguage: ghLanguage ?? null,
  };
}

export function readProjectPage(data: unknown): AdminProject[] | null {
  if (!Array.isArray(data)) return null;
  const projects: AdminProject[] = [];
  for (const item of data) {
    const project = readProject(item);
    if (!project) return null;
    projects.push(project);
  }
  return projects;
}

export function readRefreshResults(data: unknown): RefreshItem[] | null {
  if (!Array.isArray(data)) return null;
  const items: RefreshItem[] = [];
  for (const item of data) {
    if (!isRecord(item) || !isNonEmptyString(item.id) || !isNonEmptyString(item.slug)) return null;
    if (typeof item.ok !== "boolean") return null;
    const error = optionalString(item.error);
    if (error === false) return null;
    items.push({ id: item.id, slug: item.slug, ok: item.ok, error: error ?? null });
  }
  return items;
}

export function refreshSummary(items: RefreshItem[]): string {
  if (items.length === 0) return "No projects were refreshed.";
  const failed = items.filter((item) => !item.ok).length;
  const updated = items.length - failed;
  if (failed === 0) {
    return updated === 1
      ? "Refreshed GitHub data for 1 project."
      : `Refreshed GitHub data for ${updated} projects.`;
  }
  return `Refreshed ${updated} of ${items.length} projects. ${failed} failed.`;
}

export async function loadProjectPage(
  listProjects: (page: number) => Promise<unknown>,
  page: number,
): Promise<Exclude<ProjectListState, { status: "loading" }>> {
  const current = normalizePage(page);
  try {
    const projects = readProjectPage(await listProjects(current));
    if (!projects) {
      return {
        status: "invalid",
        page: current,
        message: "The projects response was not a page of projects.",
      };
    }
    return {
      status: "ready",
      page: current,
      projects,
      hasNextPage: projects.length === PROJECT_PAGE_SIZE,
    };
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 401) {
      return { status: "unauthorized", page: current, message: SESSION_EXPIRED_MESSAGE };
    }
    return {
      status: "error",
      page: current,
      message: error instanceof Error && error.message.trim() ? error.message : "The request failed.",
    };
  }
}

export async function saveProject(
  client: {
    createProject: (form: FormData) => Promise<unknown>;
    updateProject: (id: string, form: FormData) => Promise<unknown>;
  },
  input: { intent: "create" } | { intent: "edit"; id: string },
  values: ProjectFormValues,
  file: File | null,
  imageError: string | null,
): Promise<SaveResult> {
  const fieldErrors = validateProjectForm(values, {
    requireImage: input.intent === "create" && !file,
    imageError,
  });
  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, kind: "validation", message: null, fieldErrors };
  }

  const form = buildProjectFormData(values, file);
  try {
    const payload =
      input.intent === "create"
        ? await client.createProject(form)
        : await client.updateProject(input.id, form);
    const project = readProject(payload);
    if (!project) {
      return {
        ok: false,
        kind: "error",
        message: "The server response did not include the saved project.",
        fieldErrors: {},
      };
    }
    return { ok: true, project };
  } catch (error) {
    return { ok: false, ...mutationFailure(error) };
  }
}

export function confirmedDeletion(target: { id: string } | null, confirmed: boolean): string | null {
  if (!confirmed || !target?.id.trim()) return null;
  return target.id;
}

export async function deleteProject(
  client: { deleteProject: (id: string) => Promise<unknown> },
  id: string,
): Promise<DeleteResult> {
  if (!id.trim()) return { ok: false, kind: "error", message: "Choose a project to delete." };
  try {
    await client.deleteProject(id);
    return { ok: true };
  } catch (error) {
    const failure = mutationFailure(error);
    return { ok: false, kind: failure.kind, message: failure.message };
  }
}

export async function refreshProjectCache(
  refresh: () => Promise<unknown>,
): Promise<RefreshResult> {
  try {
    const items = readRefreshResults(await refresh());
    if (!items) {
      return { ok: false, kind: "error", message: "The refresh response was not a list of project results." };
    }
    return { ok: true, items };
  } catch (error) {
    const failure = mutationFailure(error);
    return { ok: false, kind: failure.kind, message: failure.message };
  }
}

export function fieldErrorsFromMessage(message: string): ProjectFieldErrors {
  const errors: ProjectFieldErrors = {};
  for (const part of message.split(";")) {
    const text = part.trim();
    if (!text) continue;
    const missing = /^Missing required field:\s*([A-Za-z]+)$/.exec(text);
    if (missing && isProjectField(missing[1])) {
      errors[missing[1]] = text;
      continue;
    }
    const named = /^([A-Za-z]+):\s*(.+)$/.exec(text);
    if (named && isProjectField(named[1])) {
      errors[named[1]] = named[2];
      continue;
    }
    if (/image file is required/i.test(text)) errors.file = text;
    if (/^slug must be/i.test(text)) errors.slug = text;
  }
  return errors;
}

function normalizePage(page: number): number {
  return Number.isInteger(page) && page >= 1 ? page : 1;
}

function appendOptional(form: FormData, key: string, value: string) {
  const trimmed = value.trim();
  if (trimmed) form.set(key, trimmed);
}

function mutationFailure(error: unknown): {
  kind: "unauthorized" | "forbidden" | "error";
  message: string;
  fieldErrors: ProjectFieldErrors;
} {
  if (error instanceof ApiRequestError && error.status === 401) {
    return { kind: "unauthorized", message: SESSION_EXPIRED_MESSAGE, fieldErrors: {} };
  }
  const message = error instanceof Error && error.message.trim() ? error.message : "The request failed.";
  if (error instanceof ApiRequestError && error.status === 403) {
    return { kind: "forbidden", message, fieldErrors: fieldErrorsFromMessage(message) };
  }
  return { kind: "error", message, fieldErrors: fieldErrorsFromMessage(message) };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isProjectStatus(value: unknown): value is ProjectStatus {
  return PROJECT_STATUSES.some((status) => status.value === value);
}

function isProjectField(value: string): value is ProjectField {
  return (FIELD_NAMES as readonly string[]).includes(value);
}

function optionalString(value: unknown): string | null | undefined | false {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value === "string") return value;
  return false;
}

function optionalCount(value: unknown): number | null | undefined | false {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value === "number" && Number.isInteger(value) && value >= 0) return value;
  return false;
}
