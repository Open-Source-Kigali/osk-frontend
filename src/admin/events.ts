import { ApiRequestError } from "../api/http.ts";

/**
 * Admin event writes follow the backend event schema.
 * POST and PUT /events are multipart. The image field is `file`.
 * GET /events is public and returns the full list, so the admin list uses that response.
 */

export const EVENT_MODES = [
  { value: "in-person", label: "In person" },
  { value: "virtual", label: "Virtual" },
  { value: "hybrid", label: "Hybrid" },
] as const;

export type EventMode = (typeof EVENT_MODES)[number]["value"];

export const SESSION_EXPIRED_MESSAGE = "Your admin session is no longer active.";
export const EVENT_UNCHANGED_MESSAGE = "The event was not changed.";

const FIELD_NAMES = [
  "title",
  "tagline",
  "description",
  "category",
  "mode",
  "capacity",
  "registered",
  "date",
  "endDate",
  "timeLabel",
  "location",
  "speakers",
  "registerUrl",
  "file",
] as const;

export type EventField = (typeof FIELD_NAMES)[number];
export type EventFieldErrors = Partial<Record<EventField, string>>;

export type EventFormValues = {
  title: string;
  tagline: string;
  description: string;
  category: string;
  mode: EventMode;
  featured: boolean;
  capacity: string;
  registered: string;
  date: string;
  endDate: string;
  timeLabel: string;
  location: string;
  speakers: string;
  registerUrl: string;
};

export type AdminEvent = {
  id: string;
  title: string;
  tagline: string | null;
  imageUrl: string | null;
  description: string;
  category: string;
  mode: EventMode | null;
  featured: boolean;
  capacity: number | null;
  registered: number | null;
  date: string;
  endDate: string | null;
  timeLabel: string | null;
  location: string;
  speakers: string[];
  registerUrl: string | null;
};

export type EventListState =
  | { status: "loading" }
  | { status: "ready"; events: AdminEvent[] }
  | { status: "invalid"; message: string }
  | { status: "error"; message: string }
  | { status: "unauthorized"; message: string };

export type PendingAction = "save" | "delete";

export type SaveResult =
  | { ok: true; event: AdminEvent }
  | {
      ok: false;
      kind: "validation" | "unauthorized" | "forbidden" | "error";
      message: string | null;
      fieldErrors: EventFieldErrors;
    };

export type DeleteResult =
  | { ok: true }
  | { ok: false; kind: "unauthorized" | "forbidden" | "error"; message: string };

export type EventsClient = {
  listEvents: () => Promise<unknown>;
  createEvent: (form: FormData) => Promise<unknown>;
  updateEvent: (id: string, form: FormData) => Promise<unknown>;
  deleteEvent: (id: string) => Promise<unknown>;
};

export const EMPTY_EVENT_FORM: EventFormValues = {
  title: "",
  tagline: "",
  description: "",
  category: "",
  mode: "in-person",
  featured: false,
  capacity: "",
  registered: "",
  date: "",
  endDate: "",
  timeLabel: "",
  location: "",
  speakers: "",
  registerUrl: "",
};

export function initialEventList(): EventListState {
  return { status: "loading" };
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

export function eventResourcePath(id: string): string {
  return `/events/${encodeURIComponent(id)}`;
}

export function formFromEvent(event: AdminEvent): EventFormValues {
  return {
    title: event.title,
    tagline: event.tagline ?? "",
    description: event.description,
    category: event.category,
    mode: event.mode ?? "in-person",
    featured: event.featured,
    capacity: event.capacity === null ? "" : String(event.capacity),
    registered: event.registered === null ? "" : String(event.registered),
    date: toDateTimeLocal(event.date),
    endDate: event.endDate ? toDateTimeLocal(event.endDate) : "",
    timeLabel: event.timeLabel ?? "",
    location: event.location,
    speakers: event.speakers.join(", "),
    registerUrl: event.registerUrl ?? "",
  };
}

export function validateEventForm(
  values: EventFormValues,
  options: { requireImage: boolean; imageError: string | null },
): EventFieldErrors {
  const errors: EventFieldErrors = {};
  if (!values.title.trim()) errors.title = "Title is required";
  if (!values.description.trim()) errors.description = "Description is required";
  if (!values.category.trim()) errors.category = "Category is required";
  if (!values.location.trim()) errors.location = "Location is required";
  if (!EVENT_MODES.some((mode) => mode.value === values.mode)) {
    errors.mode = "Mode must be in-person, virtual, or hybrid";
  }

  const date = parseDateTimeLocal(values.date);
  if (!values.date.trim()) errors.date = "Date is required";
  else if (!date) errors.date = "Date must be a valid ISO date string";

  const endDate = values.endDate.trim() ? parseDateTimeLocal(values.endDate) : null;
  if (values.endDate.trim() && !endDate) {
    errors.endDate = "End date must be a valid ISO date string";
  } else if (date && endDate && endDate.getTime() < date.getTime()) {
    errors.endDate = "End date must be on or after the start date";
  }

  const capacity = parseOptionalCount(values.capacity);
  const registered = parseOptionalCount(values.registered);
  if (capacity === "invalid") errors.capacity = "Capacity must be a whole number of 0 or more";
  if (registered === "invalid") {
    errors.registered = "Registered count must be a whole number of 0 or more";
  }
  if (
    typeof capacity === "number" &&
    typeof registered === "number" &&
    registered > capacity
  ) {
    errors.registered = "Registered count cannot exceed capacity";
  }

  if (options.imageError) errors.file = options.imageError;
  else if (options.requireImage) errors.file = "Image file is required";

  return errors;
}

export function buildEventFormData(
  values: EventFormValues,
  file: File | null,
  intent: "create" | "edit",
): FormData {
  const form = new FormData();
  form.set("title", values.title.trim());
  form.set("description", values.description.trim());
  form.set("category", values.category.trim());
  form.set("location", values.location.trim());
  form.set("mode", values.mode);
  form.set("featured", values.featured ? "true" : "false");
  form.set("date", parseDateTimeLocal(values.date)?.toISOString() ?? values.date.trim());
  form.set("speakers", JSON.stringify(speakerNames(values.speakers)));

  const endDate = values.endDate.trim() ? parseDateTimeLocal(values.endDate) : null;
  if (endDate) form.set("endDate", endDate.toISOString());
  else if (intent === "edit") form.set("endDate", "");

  appendOptional(form, "tagline", values.tagline);
  appendOptional(form, "timeLabel", values.timeLabel);
  appendOptional(form, "registerUrl", values.registerUrl);
  appendCount(form, "capacity", values.capacity, intent);
  appendCount(form, "registered", values.registered, intent);
  if (file) form.set("file", file);
  return form;
}

export function readEvent(data: unknown): AdminEvent | null {
  if (!isRecord(data)) return null;
  if (!isNonEmptyString(data.id) || !isNonEmptyString(data.title)) return null;
  if (typeof data.description !== "string" || typeof data.category !== "string") return null;
  if (typeof data.location !== "string" || typeof data.featured !== "boolean") return null;
  if (typeof data.date !== "string" || Number.isNaN(new Date(data.date).getTime())) return null;

  const endDate = optionalDate(data.endDate);
  const tagline = optionalString(data.tagline);
  const timeLabel = optionalString(data.timeLabel);
  const registerUrl = optionalString(data.registerUrl);
  const imageUrl = optionalString(data.imageUrl);
  const capacity = optionalCount(data.capacity);
  const registered = optionalCount(data.registered);
  const speakers = optionalSpeakers(data.speakers);
  if (
    endDate === false ||
    tagline === false ||
    timeLabel === false ||
    registerUrl === false ||
    imageUrl === false ||
    capacity === false ||
    registered === false ||
    speakers === false
  ) {
    return null;
  }

  const mode = data.mode === undefined || data.mode === null ? null : data.mode;
  if (mode !== null && !isEventMode(mode)) return null;

  return {
    id: data.id,
    title: data.title,
    tagline: tagline ?? null,
    imageUrl: imageUrl ?? null,
    description: data.description,
    category: data.category,
    mode,
    featured: data.featured,
    capacity: capacity ?? null,
    registered: registered ?? null,
    date: data.date,
    endDate: endDate ?? null,
    timeLabel: timeLabel ?? null,
    location: data.location,
    speakers: speakers ?? [],
    registerUrl: registerUrl ?? null,
  };
}

export function readEventList(data: unknown): AdminEvent[] | null {
  if (!Array.isArray(data)) return null;
  const events: AdminEvent[] = [];
  for (const item of data) {
    const event = readEvent(item);
    if (!event) return null;
    events.push(event);
  }
  return events;
}

export async function loadEventList(
  listEvents: () => Promise<unknown>,
): Promise<Exclude<EventListState, { status: "loading" }>> {
  try {
    const events = readEventList(await listEvents());
    if (!events) {
      return {
        status: "invalid",
        message: "The events response was not a list of events.",
      };
    }
    return { status: "ready", events };
  } catch (error) {
    return failureState(error);
  }
}

export async function saveEvent(
  client: Pick<EventsClient, "createEvent" | "updateEvent">,
  input: { intent: "create" } | { intent: "edit"; id: string },
  values: EventFormValues,
  file: File | null,
  imageError: string | null,
): Promise<SaveResult> {
  const fieldErrors = validateEventForm(values, {
    requireImage: input.intent === "create" && !file,
    imageError,
  });
  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, kind: "validation", message: null, fieldErrors };
  }

  const form = buildEventFormData(values, file, input.intent);
  try {
    const payload =
      input.intent === "create"
        ? await client.createEvent(form)
        : await client.updateEvent(input.id, form);
    const event = readEvent(payload);
    if (!event) {
      return {
        ok: false,
        kind: "error",
        message: "The server response did not include the saved event.",
        fieldErrors: {},
      };
    }
    return { ok: true, event };
  } catch (error) {
    return { ok: false, ...mutationFailure(error) };
  }
}

export function confirmedDeletion(target: { id: string } | null, confirmed: boolean): string | null {
  if (!confirmed || !target?.id.trim()) return null;
  return target.id;
}

export async function deleteEvent(
  client: Pick<EventsClient, "deleteEvent">,
  id: string,
): Promise<DeleteResult> {
  if (!id.trim()) {
    return { ok: false, kind: "error", message: "Choose an event to delete." };
  }
  try {
    await client.deleteEvent(id);
    return { ok: true };
  } catch (error) {
    const failure = mutationFailure(error);
    return { ok: false, kind: failure.kind, message: failure.message };
  }
}

export function fieldErrorsFromMessage(message: string): EventFieldErrors {
  const errors: EventFieldErrors = {};
  for (const part of message.split(";")) {
    const text = part.trim();
    if (!text) continue;
    const missing = /^Missing required field:\s*([A-Za-z]+)$/.exec(text);
    if (missing && isEventField(missing[1])) {
      errors[missing[1]] = text;
      continue;
    }
    const named = /^([A-Za-z]+):\s*(.+)$/.exec(text);
    if (named && isEventField(named[1])) {
      errors[named[1]] = named[2];
      continue;
    }
    if (/image file is required/i.test(text)) errors.file = text;
    if (/registered cannot exceed capacity/i.test(text)) errors.registered = text;
  }
  return errors;
}

export function formatEventWhen(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function appendOptional(form: FormData, key: string, value: string) {
  const trimmed = value.trim();
  if (trimmed) form.set(key, trimmed);
}

function appendCount(
  form: FormData,
  key: string,
  value: string,
  intent: "create" | "edit",
) {
  const trimmed = value.trim();
  if (trimmed) form.set(key, trimmed);
  else if (intent === "edit") form.set(key, "");
}

function speakerNames(value: string): string[] {
  return value
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);
}

function parseOptionalCount(value: string): number | null | "invalid" {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!/^\d+$/.test(trimmed)) return "invalid";
  return Number(trimmed);
}

function parseDateTimeLocal(value: string): Date | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function toDateTimeLocal(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function failureState(error: unknown): Exclude<EventListState, { status: "loading" | "ready" | "invalid" }> {
  if (error instanceof ApiRequestError && error.status === 401) {
    return { status: "unauthorized", message: SESSION_EXPIRED_MESSAGE };
  }
  return {
    status: "error",
    message: error instanceof Error && error.message.trim() ? error.message : "The request failed.",
  };
}

function mutationFailure(error: unknown): {
  kind: "unauthorized" | "forbidden" | "error";
  message: string;
  fieldErrors: EventFieldErrors;
} {
  if (error instanceof ApiRequestError && error.status === 401) {
    return { kind: "unauthorized", message: SESSION_EXPIRED_MESSAGE, fieldErrors: {} };
  }
  const message =
    error instanceof Error && error.message.trim() ? error.message : "The request failed.";
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

function optionalString(value: unknown): string | null | undefined | false {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value === "string") return value;
  return false;
}

function optionalDate(value: unknown): string | null | undefined | false {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value === "string" && !Number.isNaN(new Date(value).getTime())) return value;
  return false;
}

function optionalCount(value: unknown): number | null | undefined | false {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value === "number" && Number.isInteger(value) && value >= 0) return value;
  return false;
}

function optionalSpeakers(value: unknown): string[] | null | undefined | false {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (Array.isArray(value) && value.every((item) => typeof item === "string")) return value;
  return false;
}

function isEventMode(value: unknown): value is EventMode {
  return EVENT_MODES.some((mode) => mode.value === value);
}

function isEventField(value: string): value is EventField {
  return (FIELD_NAMES as readonly string[]).includes(value);
}
