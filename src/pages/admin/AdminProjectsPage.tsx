import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router";
import { AlertCircle } from "lucide-react";
import { apiGet, sessionForm, sessionSend } from "@/api";
import {
  beginPending,
  confirmedDeletion,
  controlsLocked,
  deleteProject,
  EMPTY_PROJECT_FORM,
  formFromProject,
  initialProjectList,
  loadProjectPage,
  pageAfterSave,
  pageToReloadAfterDelete,
  PROJECT_STATUSES,
  PROJECT_UNCHANGED_MESSAGE,
  projectResourcePath,
  projectsListPath,
  refreshProjectCache,
  refreshSummary,
  saveProject,
  SESSION_EXPIRED_MESSAGE,
  type AdminProject,
  type PendingAction,
  type ProjectFieldErrors,
  type ProjectFormValues,
  type ProjectListState,
  type RefreshItem,
} from "@/admin/projects";
import { Button } from "@/components/UI";
import Loader from "@/components/UI/Loader";
import {
  IMAGE_UPLOAD_ACCEPT,
  IMAGE_UPLOAD_HELP_TEXT,
  validateImageFile,
} from "@/lib/imageUpload";

const projectsClient = {
  listProjects: (page: number) => apiGet<unknown>(projectsListPath(page)),
  createProject: (form: FormData) => sessionForm<unknown>("/projects", "POST", form),
  updateProject: (id: string, form: FormData) =>
    sessionForm<unknown>(projectResourcePath(id), "PUT", form),
  deleteProject: (id: string) => sessionSend<unknown>(projectResourcePath(id), "DELETE"),
  refreshProjects: () => sessionSend<unknown>("/projects/refresh", "POST"),
};

const inputClass = (hasError: boolean) =>
  `w-full rounded-xl border px-4 py-3 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus-visible:ring-2 ${
    hasError
      ? "border-red-300 focus-visible:border-red-400 focus-visible:ring-red-100"
      : "border-gray-200 focus-visible:border-[#2b7fff] focus-visible:ring-[#2b7fff]/10"
  }`;

const AdminProjectsPage = () => {
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [list, setList] = useState<ProjectListState>(initialProjectList(1));
  const [editor, setEditor] = useState<
    null | { intent: "create" } | { intent: "edit"; project: AdminProject }
  >(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminProject | null>(null);
  const [refreshOpen, setRefreshOpen] = useState(false);
  const [refreshFailures, setRefreshFailures] = useState<RefreshItem[]>([]);
  const [action, setAction] = useState<PendingAction | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const locked = controlsLocked(action);

  function showPage(nextPage: number) {
    setList(initialProjectList(nextPage));
    if (nextPage === page) setReloadKey((current) => current + 1);
    else setPage(nextPage);
  }

  useEffect(() => {
    let active = true;
    void loadProjectPage(projectsClient.listProjects, page).then((next) => {
      if (active) setList(next);
    });
    return () => {
      active = false;
    };
  }, [page, reloadKey]);

  function openCreate() {
    if (locked) return;
    setNotice(null);
    setActionError(null);
    setRefreshFailures([]);
    setEditor({ intent: "create" });
  }

  function openEdit(project: AdminProject) {
    if (locked) return;
    setNotice(null);
    setActionError(null);
    setRefreshFailures([]);
    setEditor({ intent: "edit", project });
  }

  async function onSave(values: ProjectFormValues, file: File | null) {
    if (!editor) return;
    const next = beginPending(action, "save");
    if (!next) return;
    setAction(next);
    setActionError(null);
    try {
      const imageError = file ? await imageProblem(file) : null;
      const result = await saveProject(
        projectsClient,
        editor.intent === "create" ? { intent: "create" } : { intent: "edit", id: editor.project.id },
        values,
        file,
        imageError,
      );
      if (!result.ok) {
        const message =
          result.kind === "forbidden" && result.message
            ? `${result.message} ${PROJECT_UNCHANGED_MESSAGE}`
            : result.message;
        setActionError(message);
        return { fieldErrors: result.fieldErrors, message };
      }
      setEditor(null);
      setNotice(editor.intent === "create" ? "Project created." : "Project updated.");
      showPage(pageAfterSave(editor.intent, page));
      return null;
    } finally {
      setAction(null);
    }
  }

  async function onConfirmDelete() {
    const id = confirmedDeletion(deleteTarget, true);
    const itemsOnPage = list.status === "ready" ? list.projects.length : 0;
    if (!id) return;
    const next = beginPending(action, "delete");
    if (!next) return;
    setAction(next);
    setActionError(null);
    try {
      const result = await deleteProject(projectsClient, id);
      if (!result.ok) {
        const unchanged = result.kind === "forbidden" ? ` ${PROJECT_UNCHANGED_MESSAGE}` : "";
        setActionError(`${result.message}${unchanged}`);
        return;
      }
      setDeleteTarget(null);
      setNotice("Project deleted.");
      showPage(pageToReloadAfterDelete(page, itemsOnPage));
    } finally {
      setAction(null);
    }
  }

  async function onConfirmRefresh() {
    const next = beginPending(action, "refresh");
    if (!next) return;
    setAction(next);
    setActionError(null);
    setRefreshFailures([]);
    try {
      const result = await refreshProjectCache(projectsClient.refreshProjects);
      if (!result.ok) {
        const unchanged = result.kind === "forbidden" ? ` ${PROJECT_UNCHANGED_MESSAGE}` : "";
        setActionError(`${result.message}${unchanged}`);
        return;
      }
      setRefreshOpen(false);
      setNotice(refreshSummary(result.items));
      setRefreshFailures(result.items.filter((item) => !item.ok));
      showPage(page);
    } finally {
      setAction(null);
    }
  }

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-heading sm:text-3xl">Projects</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-text-supporting sm:text-base">
            Each page shows up to 10 projects. The list does not include a total count.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="secondary"
            className="w-full sm:w-auto"
            onClick={() => {
              if (locked) return;
              setNotice(null);
              setActionError(null);
              setRefreshOpen(true);
            }}
            disabled={locked}
          >
            Refresh GitHub data
          </Button>
          <Button type="button" className="w-full sm:w-auto" onClick={openCreate} disabled={locked}>
            New project
          </Button>
        </div>
      </div>

      <StatusMessage message={notice} tone="success" onDismiss={() => setNotice(null)} />
      {actionError && !editor && !deleteTarget && !refreshOpen ? (
        <StatusMessage message={actionError} tone="error" onDismiss={() => setActionError(null)} />
      ) : null}
      {refreshFailures.length > 0 ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900" role="status">
          <p className="font-medium">GitHub refresh failed for:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {refreshFailures.map((item) => (
              <li key={item.id}>
                {item.slug}
                {item.error ? `: ${item.error}` : ""}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {editor ? (
        <ProjectEditor
          intent={editor.intent}
          initialValues={editor.intent === "edit" ? formFromProject(editor.project) : EMPTY_PROJECT_FORM}
          serverMessage={actionError}
          pending={action === "save"}
          locked={locked}
          onDismiss={() => setActionError(null)}
          onCancel={() => {
            if (action === "save") return;
            setEditor(null);
            setActionError(null);
          }}
          onSubmit={onSave}
        />
      ) : null}

      <ProjectList
        list={list}
        locked={locked}
        onEdit={openEdit}
        onDelete={(project) => {
          if (locked) return;
          setNotice(null);
          setActionError(null);
          setDeleteTarget(project);
        }}
        onPrevious={() => showPage(page - 1)}
        onNext={() => showPage(page + 1)}
      />

      <DeleteProjectDialog
        project={deleteTarget}
        pending={action === "delete"}
        onCancel={() => {
          if (action === "delete") return;
          setDeleteTarget(null);
        }}
        onConfirm={() => void onConfirmDelete()}
      />
      <RefreshDialog
        open={refreshOpen}
        pending={action === "refresh"}
        onCancel={() => {
          if (action === "refresh") return;
          setRefreshOpen(false);
        }}
        onConfirm={() => void onConfirmRefresh()}
      />
    </section>
  );
};

function ProjectList({
  list,
  locked,
  onEdit,
  onDelete,
  onPrevious,
  onNext,
}: {
  list: ProjectListState;
  locked: boolean;
  onEdit: (project: AdminProject) => void;
  onDelete: (project: AdminProject) => void;
  onPrevious: () => void;
  onNext: () => void;
}) {
  if (list.status === "loading") {
    return (
      <div className="flex min-h-40 items-center justify-center" role="status">
        <Loader />
        <span className="sr-only">Loading projects, page {list.page}</span>
      </div>
    );
  }

  if (list.status === "unauthorized" || list.status === "error" || list.status === "invalid") {
    return <StatusMessage message={list.message} tone="error" />;
  }

  return (
    <div className="flex flex-col gap-4">
      {list.projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center">
          <p className="text-base font-medium text-gray-900">
            {list.page === 1 ? "No projects yet" : "This page has no projects"}
          </p>
        </div>
      ) : (
        <ul className="grid gap-4">
          {list.projects.map((project) => (
            <li key={project.id} className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                {project.imageUrl ? (
                  <img src={project.imageUrl} alt="" className="h-24 w-full rounded-xl object-cover sm:h-20 sm:w-32" />
                ) : null}
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-lg font-bold text-text-heading">{project.slug}</h2>
                  <p className="mt-1 text-sm text-text-supporting">{project.tagline}</p>
                  <p className="mt-1 text-sm text-text-body">
                    {project.repoOwner}/{project.repoName}
                    {" · "}
                    {project.category}
                    {" · "}
                    {statusLabel(project.status)}
                    {project.featured ? " · Featured" : ""}
                    {project.ghLanguage ? ` · ${project.ghLanguage}` : ""}
                    {project.ghStars !== null ? ` · ${project.ghStars} stars` : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="secondary" size="sm" onClick={() => onEdit(project)} disabled={locked}>
                    Edit
                  </Button>
                  <Button type="button" variant="dark" size="sm" onClick={() => onDelete(project)} disabled={locked}>
                    Delete
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <nav className="flex items-center justify-between gap-3" aria-label="Project pages">
        <Button type="button" variant="secondary" onClick={onPrevious} disabled={locked || list.page <= 1}>
          Previous page
        </Button>
        <p className="text-sm text-gray-600" aria-live="polite">
          Page {list.page}
        </p>
        <Button type="button" variant="secondary" onClick={onNext} disabled={locked || !list.hasNextPage}>
          Next page
        </Button>
      </nav>
    </div>
  );
}

function ProjectEditor({
  intent,
  initialValues,
  serverMessage,
  pending,
  locked,
  onDismiss,
  onCancel,
  onSubmit,
}: {
  intent: "create" | "edit";
  initialValues: ProjectFormValues;
  serverMessage: string | null;
  pending: boolean;
  locked: boolean;
  onDismiss: () => void;
  onCancel: () => void;
  onSubmit: (
    values: ProjectFormValues,
    file: File | null,
  ) => Promise<{ fieldErrors: ProjectFieldErrors; message: string | null } | null | undefined>;
}) {
  const titleRef = useRef<HTMLInputElement>(null);
  const [values, setValues] = useState(initialValues);
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<ProjectFieldErrors>({});
  const formId = useId();

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  function update<K extends keyof ProjectFormValues>(key: K, value: ProjectFormValues[K]) {
    onDismiss();
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  async function onFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (locked) return;
    const result = await onSubmit(values, file);
    if (result) setErrors(result.fieldErrors);
  }

  const legend = intent === "create" ? "New project" : "Edit project";

  return (
    <form onSubmit={(event) => void onFormSubmit(event)} className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6" noValidate>
      <fieldset className="grid gap-4 sm:grid-cols-2" disabled={locked}>
        <legend className="col-span-full mb-2 text-lg font-semibold text-gray-900">{legend}</legend>
        <Field id={`${formId}-slug`} label="Slug" error={errors.slug}>
          <input
            ref={titleRef}
            id={`${formId}-slug`}
            className={inputClass(Boolean(errors.slug))}
            value={values.slug}
            autoComplete="off"
            onChange={(event) => update("slug", event.target.value)}
          />
        </Field>
        <Field id={`${formId}-category`} label="Category" error={errors.category}>
          <input
            id={`${formId}-category`}
            className={inputClass(Boolean(errors.category))}
            value={values.category}
            onChange={(event) => update("category", event.target.value)}
          />
        </Field>
        <Field id={`${formId}-owner`} label="Repository owner" error={errors.repoOwner}>
          <input
            id={`${formId}-owner`}
            className={inputClass(Boolean(errors.repoOwner))}
            value={values.repoOwner}
            autoComplete="off"
            onChange={(event) => update("repoOwner", event.target.value)}
          />
        </Field>
        <Field id={`${formId}-repo`} label="Repository name" error={errors.repoName}>
          <input
            id={`${formId}-repo`}
            className={inputClass(Boolean(errors.repoName))}
            value={values.repoName}
            autoComplete="off"
            onChange={(event) => update("repoName", event.target.value)}
          />
        </Field>
        <Field id={`${formId}-tagline`} label="Tagline" error={errors.tagline} className="sm:col-span-2">
          <input
            id={`${formId}-tagline`}
            className={inputClass(Boolean(errors.tagline))}
            value={values.tagline}
            onChange={(event) => update("tagline", event.target.value)}
          />
        </Field>
        <Field id={`${formId}-status`} label="Status" error={errors.status}>
          <select
            id={`${formId}-status`}
            className={inputClass(Boolean(errors.status))}
            value={values.status}
            onChange={(event) => update("status", event.target.value as ProjectFormValues["status"])}
          >
            {PROJECT_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </Field>
        <Field id={`${formId}-maintainer`} label="Maintainer" error={errors.maintainer}>
          <input
            id={`${formId}-maintainer`}
            className={inputClass(Boolean(errors.maintainer))}
            value={values.maintainer}
            onChange={(event) => update("maintainer", event.target.value)}
          />
        </Field>
        <Field id={`${formId}-color`} label="Language color" error={errors.langColor}>
          <input
            id={`${formId}-color`}
            className={inputClass(Boolean(errors.langColor))}
            value={values.langColor}
            placeholder="#3178c6"
            onChange={(event) => update("langColor", event.target.value)}
          />
        </Field>
        <div className="flex items-center gap-3 sm:col-span-2">
          <input
            id={`${formId}-featured`}
            type="checkbox"
            className="size-4 rounded border-gray-300"
            checked={values.featured}
            onChange={(event) => update("featured", event.target.checked)}
          />
          <label htmlFor={`${formId}-featured`} className="text-sm font-medium text-gray-800">
            Featured
          </label>
        </div>
        <Field
          id={`${formId}-file`}
          label={intent === "create" ? "Image" : "Replace image"}
          error={errors.file}
          hint={IMAGE_UPLOAD_HELP_TEXT}
          className="sm:col-span-2"
        >
          <input
            id={`${formId}-file`}
            type="file"
            accept={IMAGE_UPLOAD_ACCEPT}
            className="block w-full text-sm text-gray-700 file:mr-4 file:rounded-full file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:text-sm file:font-medium"
            onChange={(event) => {
              onDismiss();
              setFile(event.target.files?.[0] ?? null);
              setErrors((current) => ({ ...current, file: undefined }));
            }}
          />
        </Field>
      </fieldset>
      {serverMessage ? <p className="mt-4 text-sm text-red-700">{serverMessage}</p> : null}
      <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={locked}>
          Cancel
        </Button>
        <Button type="submit" loading={pending} disabled={locked}>
          {intent === "create" ? "Create project" : "Save project"}
        </Button>
      </div>
    </form>
  );
}

function DeleteProjectDialog({
  project,
  pending,
  onCancel,
  onConfirm,
}: {
  project: AdminProject | null;
  pending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (project && !dialog.open) dialog.showModal();
    if (!project && dialog.open) dialog.close();
  }, [project]);

  return (
    <dialog
      ref={dialogRef}
      className="w-[min(100%,32rem)] rounded-2xl border border-gray-200 p-6 backdrop:bg-black/40"
      onCancel={(event) => {
        if (pending) event.preventDefault();
        else onCancel();
      }}
      onClose={onCancel}
    >
      <h2 className="text-lg font-semibold text-gray-900">Delete {project?.slug ?? "this project"}?</h2>
      <p className="mt-2 text-sm leading-6 text-gray-600">
        This permanently removes {project?.slug ?? "the project"}
        {project ? ` (${project.repoOwner}/${project.repoName})` : ""}.
      </p>
      <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={pending}>
          Keep project
        </Button>
        <Button type="button" loading={pending} disabled={pending} onClick={onConfirm}>
          Delete {project?.slug ?? "project"}
        </Button>
      </div>
    </dialog>
  );
}

function RefreshDialog({
  open,
  pending,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  pending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="w-[min(100%,32rem)] rounded-2xl border border-gray-200 p-6 backdrop:bg-black/40"
      onCancel={(event) => {
        if (pending) event.preventDefault();
        else onCancel();
      }}
      onClose={onCancel}
    >
      <h2 className="text-lg font-semibold text-gray-900">Refresh GitHub data?</h2>
      <p className="mt-2 text-sm leading-6 text-gray-600">
        This updates the cached GitHub description, language, topics, stars, forks, issues, contributors, pull requests, and last push time for every project. It does not change slugs, taglines, categories, or images.
      </p>
      <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={pending}>
          Keep cached data
        </Button>
        <Button type="button" loading={pending} disabled={pending} onClick={onConfirm}>
          Refresh GitHub data
        </Button>
      </div>
    </dialog>
  );
}

function Field({
  id,
  label,
  error,
  hint,
  className,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}) {
  const errorId = `${id}-error`;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-gray-800">
        {label}
      </label>
      {children}
      {hint ? <p className="mt-1 text-xs text-gray-500">{hint}</p> : null}
      {error ? (
        <p id={errorId} className="mt-1 text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function StatusMessage({
  message,
  tone,
  onDismiss,
}: {
  message: string | null;
  tone: "success" | "error";
  onDismiss?: () => void;
}) {
  if (!message) return null;
  const error = tone === "error";
  return (
    <div
      className={`flex items-start justify-between gap-3 rounded-2xl border px-4 py-3 text-sm ${
        error ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"
      }`}
      role={error ? "alert" : "status"}
    >
      <p>
        {error ? <AlertCircle className="mr-2 inline size-4" aria-hidden="true" /> : null}
        {message}{" "}
        {message === SESSION_EXPIRED_MESSAGE ? (
          <Link to="/admin/login" className="font-medium underline">
            Sign in again
          </Link>
        ) : null}
      </p>
      {onDismiss ? (
        <button type="button" className="font-medium underline" onClick={onDismiss}>
          Dismiss
        </button>
      ) : null}
    </div>
  );
}

function statusLabel(status: AdminProject["status"]): string {
  return PROJECT_STATUSES.find((item) => item.value === status)?.label ?? status;
}

async function imageProblem(file: File): Promise<string | null> {
  const result = await validateImageFile(file);
  return result.ok ? null : result.message;
}

export default AdminProjectsPage;
