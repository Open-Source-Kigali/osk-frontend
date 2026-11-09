import { useEffect, useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router";
import { AlertCircle } from "lucide-react";
import AdminImagePreview, { adminFileInputClass } from "./AdminImagePreview";
import { apiGet, sessionForm, sessionSend } from "@/api";
import {
  beginPending,
  confirmedDeletion,
  controlsLocked,
  deleteEvent,
  EMPTY_EVENT_FORM,
  EVENT_MODES,
  EVENT_UNCHANGED_MESSAGE,
  eventResourcePath,
  formFromEvent,
  formatEventWhen,
  initialEventList,
  loadEventList,
  saveEvent,
  SESSION_EXPIRED_MESSAGE,
  type AdminEvent,
  type EventFieldErrors,
  type EventFormValues,
  type EventListState,
  type PendingAction,
} from "@/admin/events";
import { Button } from "@/components/UI";
import Loader from "@/components/UI/Loader";
import {
  IMAGE_UPLOAD_ACCEPT,
  IMAGE_UPLOAD_HELP_TEXT,
  validateImageFile,
} from "@/lib/imageUpload";

const eventsClient = {
  listEvents: () => apiGet<unknown>("/events"),
  createEvent: (form: FormData) => sessionForm<unknown>("/events", "POST", form),
  updateEvent: (id: string, form: FormData) =>
    sessionForm<unknown>(eventResourcePath(id), "PUT", form),
  deleteEvent: (id: string) => sessionSend<unknown>(eventResourcePath(id), "DELETE"),
};

const inputClass = (hasError: boolean) =>
  `w-full rounded-xl border px-4 py-3 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus-visible:ring-2 ${
    hasError
      ? "border-red-300 focus-visible:border-red-400 focus-visible:ring-red-100"
      : "border-gray-200 focus-visible:border-[#2b7fff] focus-visible:ring-[#2b7fff]/10"
  }`;

const AdminEventsPage = () => {
  const [list, setList] = useState<EventListState>(initialEventList);
  const [editor, setEditor] = useState<
    null | { intent: "create" } | { intent: "edit"; event: AdminEvent }
  >(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminEvent | null>(null);
  const [action, setAction] = useState<PendingAction | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const locked = controlsLocked(action);

  async function reload(keepVisible = false) {
    if (!keepVisible) setList(initialEventList());
    setList(await loadEventList(eventsClient.listEvents));
  }

  useEffect(() => {
    let active = true;
    void loadEventList(eventsClient.listEvents).then((next) => {
      if (active) setList(next);
    });
    return () => {
      active = false;
    };
  }, []);

  function openCreate() {
    if (locked) return;
    setNotice(null);
    setActionError(null);
    setEditor({ intent: "create" });
  }

  function openEdit(event: AdminEvent) {
    if (locked) return;
    setNotice(null);
    setActionError(null);
    setEditor({ intent: "edit", event });
  }

  async function onSave(values: EventFormValues, file: File | null) {
    if (!editor) return;
    const next = beginPending(action, "save");
    if (!next) return;
    setAction(next);
    setActionError(null);
    try {
      const imageError = file ? await imageProblem(file) : null;
      const result = await saveEvent(
        eventsClient,
        editor.intent === "create" ? { intent: "create" } : { intent: "edit", id: editor.event.id },
        values,
        file,
        imageError,
      );
      if (!result.ok) {
        const message =
          result.kind === "forbidden" && result.message
            ? `${result.message} ${EVENT_UNCHANGED_MESSAGE}`
            : result.message;
        setActionError(message);
        return { fieldErrors: result.fieldErrors, message };
      }
      setNotice(editor.intent === "create" ? "Event created." : "Event updated.");
      setEditor(null);
      await reload(true);
      return null;
    } finally {
      setAction(null);
    }
  }

  async function onConfirmDelete() {
    const id = confirmedDeletion(deleteTarget, true);
    if (!id) return;
    const next = beginPending(action, "delete");
    if (!next) return;
    setAction(next);
    setActionError(null);
    try {
      const result = await deleteEvent(eventsClient, id);
      if (!result.ok) {
        setActionError(
          result.kind === "forbidden" ? `${result.message} ${EVENT_UNCHANGED_MESSAGE}` : result.message,
        );
        return;
      }
      setNotice("Event deleted.");
      setDeleteTarget(null);
      if (editor?.intent === "edit" && editor.event.id === id) setEditor(null);
      await reload(true);
    } finally {
      setAction(null);
    }
  }

  return (
    <section className="flex flex-col gap-6" data-testid="admin-events">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-heading sm:text-3xl">Events</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-text-supporting sm:text-base">
            Create, update, and delete events. The public site reads the same event list.
          </p>
        </div>
        <Button type="button" onClick={openCreate} disabled={locked}>
          New event
        </Button>
      </div>

      {notice ? (
        <p role="status" className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800">
          {notice}
        </p>
      ) : null}

      {actionError && !editor && !deleteTarget ? (
        <StatusMessage message={actionError} unauthorized={actionError === SESSION_EXPIRED_MESSAGE} />
      ) : null}

      {list.status === "unauthorized" ? <StatusMessage message={list.message} unauthorized /> : null}
      {list.status === "error" || list.status === "invalid" ? (
        <StatusMessage message={list.message} unauthorized={false} />
      ) : null}

      {editor ? (
        <EventEditor
          intent={editor.intent}
          event={editor.intent === "edit" ? editor.event : null}
          locked={locked}
          serverMessage={actionError}
          onCancel={() => {
            if (locked) return;
            setEditor(null);
            setActionError(null);
          }}
          onDismiss={() => setActionError(null)}
          onSave={onSave}
        />
      ) : null}

      {list.status === "loading" ? (
        <div role="status" aria-live="polite">
          <Loader text="Loading events..." />
        </div>
      ) : null}

      {list.status === "ready" && list.events.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-sm text-text-supporting">
          No events yet. Create the first one.
        </div>
      ) : null}

      {list.status === "ready" && list.events.length > 0 ? (
        <ul className="grid grid-cols-1 gap-4">
          {list.events.map((event) => (
            <li key={event.id} className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                {event.imageUrl ? (
                  <img
                    src={event.imageUrl}
                    alt=""
                    className="h-24 w-full rounded-xl object-cover sm:h-20 sm:w-32"
                  />
                ) : null}
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-bold text-text-heading">{event.title}</h2>
                  <p className="mt-1 text-sm text-text-supporting">
                    {formatEventWhen(event.date)}
                    {event.endDate ? ` – ${formatEventWhen(event.endDate)}` : ""} · {event.location}
                  </p>
                  <p className="mt-1 text-sm text-text-body">
                    {event.category} · {event.mode ?? "Mode not set"}
                    {event.featured ? " · Featured" : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="secondary" size="sm" disabled={locked} onClick={() => openEdit(event)}>
                    Edit
                  </Button>
                  <Button type="button" variant="dark" size="sm" disabled={locked} onClick={() => setDeleteTarget(event)}>
                    Delete
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {list.status === "error" || list.status === "invalid" || list.status === "unauthorized" ? (
        <Button type="button" variant="secondary" onClick={() => void reload(false)}>
          Try again
        </Button>
      ) : null}

      <DeleteEventDialog
        event={deleteTarget}
        locked={locked}
        errorMessage={deleteTarget ? actionError : null}
        onCancel={() => {
          if (action === "delete") return;
          setDeleteTarget(null);
          setActionError(null);
        }}
        onConfirm={() => void onConfirmDelete()}
      />
    </section>
  );
};

function StatusMessage({ message, unauthorized }: { message: string; unauthorized: boolean }) {
  return (
    <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
      {message}{" "}
      {unauthorized ? (
        <Link to="/admin/login" className="font-semibold underline">
          Sign in again
        </Link>
      ) : null}
    </p>
  );
}

function EventEditor({
  intent,
  event,
  locked,
  serverMessage,
  onCancel,
  onDismiss,
  onSave,
}: {
  intent: "create" | "edit";
  event: AdminEvent | null;
  locked: boolean;
  serverMessage: string | null;
  onCancel: () => void;
  onDismiss: () => void;
  onSave: (values: EventFormValues, file: File | null) => Promise<{ fieldErrors: EventFieldErrors; message: string | null } | null | undefined>;
}) {
  const titleId = useId();
  const [values, setValues] = useState<EventFormValues>(event ? formFromEvent(event) : EMPTY_EVENT_FORM);
  const [file, setFile] = useState<File | null>(null);
  const [fieldErrors, setFieldErrors] = useState<EventFieldErrors>({});
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  function update<K extends keyof EventFormValues>(key: K, value: EventFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => ({ ...current, [key]: undefined }));
    onDismiss();
  }

  async function onSubmit(submitEvent: FormEvent<HTMLFormElement>) {
    submitEvent.preventDefault();
    if (locked) return;
    const result = await onSave(values, file);
    if (result) setFieldErrors(result.fieldErrors);
  }

  return (
    <form
      className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6"
      onSubmit={onSubmit}
      noValidate
      aria-labelledby={titleId}
      data-testid="admin-event-form"
    >
      <h2 id={titleId} className="text-xl font-bold text-text-heading">
        {intent === "create" ? "New event" : `Edit ${event?.title ?? "event"}`}
      </h2>
      {intent === "edit" ? (
        <p className="mt-2 text-sm leading-6 text-text-supporting">
          A blank tagline, time label, or registration link keeps the current value. Clear capacity, registered count, end date, or speakers to remove them.
        </p>
      ) : null}

      {serverMessage ? (
        <p role="alert" className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
          <span>
            {serverMessage}{" "}
            {serverMessage === SESSION_EXPIRED_MESSAGE ? (
              <Link to="/admin/login" className="font-semibold underline">
                Sign in again
              </Link>
            ) : null}
          </span>
        </p>
      ) : null}

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Title" name="title" error={fieldErrors.title} required className="sm:col-span-2">
          <input
            ref={titleRef}
            id="event-title"
            value={values.title}
            disabled={locked}
            aria-invalid={fieldErrors.title ? true : undefined}
            className={inputClass(Boolean(fieldErrors.title))}
            onChange={(input) => update("title", input.target.value)}
          />
        </Field>
        <Field label="Tagline" name="tagline" error={fieldErrors.tagline} className="sm:col-span-2">
          <input
            id="event-tagline"
            value={values.tagline}
            disabled={locked}
            className={inputClass(false)}
            onChange={(input) => update("tagline", input.target.value)}
          />
        </Field>
        <Field label="Description" name="description" error={fieldErrors.description} required className="sm:col-span-2">
          <textarea
            id="event-description"
            value={values.description}
            disabled={locked}
            rows={4}
            aria-invalid={fieldErrors.description ? true : undefined}
            className={inputClass(Boolean(fieldErrors.description))}
            onChange={(input) => update("description", input.target.value)}
          />
        </Field>
        <Field label="Category" name="category" error={fieldErrors.category} required>
          <input
            id="event-category"
            value={values.category}
            disabled={locked}
            aria-invalid={fieldErrors.category ? true : undefined}
            className={inputClass(Boolean(fieldErrors.category))}
            onChange={(input) => update("category", input.target.value)}
          />
        </Field>
        <Field label="Mode" name="mode" error={fieldErrors.mode} required>
          <select
            id="event-mode"
            value={values.mode}
            disabled={locked}
            className={inputClass(Boolean(fieldErrors.mode))}
            onChange={(input) => update("mode", input.target.value as EventFormValues["mode"])}
          >
            {EVENT_MODES.map((mode) => (
              <option key={mode.value} value={mode.value}>
                {mode.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Start" name="date" error={fieldErrors.date} required>
          <input
            id="event-date"
            type="datetime-local"
            value={values.date}
            disabled={locked}
            aria-invalid={fieldErrors.date ? true : undefined}
            className={inputClass(Boolean(fieldErrors.date))}
            onChange={(input) => update("date", input.target.value)}
          />
        </Field>
        <Field label="End" name="endDate" error={fieldErrors.endDate}>
          <input
            id="event-end-date"
            type="datetime-local"
            value={values.endDate}
            disabled={locked}
            aria-invalid={fieldErrors.endDate ? true : undefined}
            className={inputClass(Boolean(fieldErrors.endDate))}
            onChange={(input) => update("endDate", input.target.value)}
          />
        </Field>
        <Field label="Time label" name="timeLabel" error={fieldErrors.timeLabel}>
          <input
            id="event-time-label"
            value={values.timeLabel}
            disabled={locked}
            placeholder="6:00 PM – 8:00 PM"
            className={inputClass(false)}
            onChange={(input) => update("timeLabel", input.target.value)}
          />
        </Field>
        <Field label="Location" name="location" error={fieldErrors.location} required>
          <input
            id="event-location"
            value={values.location}
            disabled={locked}
            aria-invalid={fieldErrors.location ? true : undefined}
            className={inputClass(Boolean(fieldErrors.location))}
            onChange={(input) => update("location", input.target.value)}
          />
        </Field>
        <Field label="Capacity" name="capacity" error={fieldErrors.capacity}>
          <input
            id="event-capacity"
            inputMode="numeric"
            value={values.capacity}
            disabled={locked}
            aria-invalid={fieldErrors.capacity ? true : undefined}
            className={inputClass(Boolean(fieldErrors.capacity))}
            onChange={(input) => update("capacity", input.target.value)}
          />
        </Field>
        <Field label="Registered" name="registered" error={fieldErrors.registered}>
          <input
            id="event-registered"
            inputMode="numeric"
            value={values.registered}
            disabled={locked}
            aria-invalid={fieldErrors.registered ? true : undefined}
            className={inputClass(Boolean(fieldErrors.registered))}
            onChange={(input) => update("registered", input.target.value)}
          />
        </Field>
        <Field
          label="Speakers"
          name="speakers"
          error={fieldErrors.speakers}
          hint="Separate names with commas."
          className="sm:col-span-2"
        >
          <input
            id="event-speakers"
            value={values.speakers}
            disabled={locked}
            className={inputClass(false)}
            onChange={(input) => update("speakers", input.target.value)}
          />
        </Field>
        <Field label="Registration link" name="registerUrl" error={fieldErrors.registerUrl} className="sm:col-span-2">
          <input
            id="event-register-url"
            value={values.registerUrl}
            disabled={locked}
            className={inputClass(false)}
            onChange={(input) => update("registerUrl", input.target.value)}
          />
        </Field>
        <Field
          label="Image"
          name="file"
          error={fieldErrors.file}
          required={intent === "create"}
          hint={
            intent === "edit"
              ? `Choose a new image to replace the current one. ${IMAGE_UPLOAD_HELP_TEXT}`
              : IMAGE_UPLOAD_HELP_TEXT
          }
          className="sm:col-span-2"
        >
          <AdminImagePreview file={file} currentUrl={event?.imageUrl} />
          <input
            id="event-file"
            type="file"
            accept={IMAGE_UPLOAD_ACCEPT}
            disabled={locked}
            aria-invalid={fieldErrors.file ? true : undefined}
            className={adminFileInputClass}
            onChange={(input) => {
              const nextFile = input.target.files?.[0] ?? null;
              setFile(nextFile);
              setFieldErrors((current) => ({ ...current, file: undefined }));
              onDismiss();
            }}
          />
        </Field>
        <label className="flex items-center gap-2 text-sm font-semibold text-text-heading sm:col-span-2">
          <input
            type="checkbox"
            checked={values.featured}
            disabled={locked}
            className="h-4 w-4 accent-[#0ba3df]"
            onChange={(input) => update("featured", input.target.checked)}
          />
          Featured event
        </label>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button type="submit" loading={locked} disabled={locked}>
          {locked ? "Saving..." : intent === "create" ? "Create event" : "Save changes"}
        </Button>
        <Button type="button" variant="secondary" disabled={locked} onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  error,
  required,
  hint,
  className,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  required?: boolean;
  hint?: string;
  className?: string;
  children: ReactNode;
}) {
  const errorId = `event-${name}-error`;
  const hintId = `event-${name}-hint`;
  return (
    <div className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <label htmlFor={`event-${name === "endDate" ? "end-date" : name === "timeLabel" ? "time-label" : name === "registerUrl" ? "register-url" : name === "file" ? "file" : name}`} className="text-sm font-bold text-gray-700">
        {label}
        {required ? <span className="ml-0.5 text-red-500">*</span> : null}
      </label>
      {children}
      {hint ? (
        <p id={hintId} className="text-xs text-text-supporting">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="flex items-center gap-1 text-sm font-medium text-red-500">
          <AlertCircle size={11} aria-hidden="true" /> {error}
        </p>
      ) : null}
    </div>
  );
}

function DeleteEventDialog({
  event,
  locked,
  errorMessage,
  onCancel,
  onConfirm,
}: {
  event: AdminEvent | null;
  locked: boolean;
  errorMessage: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (event && !dialog.open) dialog.showModal();
    if (!event && dialog.open) dialog.close();
  }, [event]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={event ? titleId : undefined}
      className="fixed top-1/2 left-1/2 w-[min(100%-2rem,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-gray-200 bg-white p-6 backdrop:bg-black/40"
      onCancel={(dialogEvent) => {
        if (locked) dialogEvent.preventDefault();
      }}
      onClose={onCancel}
    >
      {event ? (
        <>
          <h2 id={titleId} className="text-xl font-bold text-text-heading">
            Delete {event.title}?
          </h2>
          <p className="mt-3 text-sm leading-6 text-text-supporting">
            This removes {event.title} from the event list.
          </p>
          {errorMessage ? (
            <p role="alert" className="mt-4 text-sm font-medium text-red-600">
              {errorMessage}
            </p>
          ) : null}
          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onCancel} disabled={locked} autoFocus>
              Keep event
            </Button>
            <Button type="button" variant="dark" onClick={onConfirm} disabled={locked} loading={locked}>
              {locked ? "Deleting..." : `Delete ${event.title}`}
            </Button>
          </div>
        </>
      ) : null}
    </dialog>
  );
}

async function imageProblem(file: File): Promise<string | null> {
  const result = await validateImageFile(file);
  return result.ok ? null : result.message;
}

export default AdminEventsPage;
