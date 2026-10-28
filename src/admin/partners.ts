import { ApiRequestError } from "../api/http.ts";

/**
 * Admin partner writes follow the backend partner schema.
 * POST and PUT /partners are multipart. The logo field is `file`.
 * GET /partners is public and returns the full list.
 *
 * Update is partial, but every included string must still be non-empty.
 * The controller drops empty strings after validation, and a logo changes
 * only when a new file is uploaded. None of the partner fields can be cleared.
 */

export const SESSION_EXPIRED_MESSAGE = "Your admin session is no longer active.";
export const PARTNER_UNCHANGED_MESSAGE = "The partner was not changed.";

export const UNCLEARABLE_PARTNER_FIELDS = [
  "name",
  "websiteUrl",
  "description",
  "email",
  "partnershipReason",
  "logo",
] as const;

const FIELD_NAMES = [
  "name",
  "websiteUrl",
  "description",
  "email",
  "partnershipReason",
  "file",
] as const;

export type PartnerField = (typeof FIELD_NAMES)[number];
export type PartnerFieldErrors = Partial<Record<PartnerField, string>>;

export type PartnerFormValues = {
  name: string;
  websiteUrl: string;
  description: string;
  email: string;
  partnershipReason: string;
};

export type AdminPartner = {
  id: string;
  name: string;
  websiteUrl: string;
  logoUrl: string;
  description: string;
  email: string;
  partnershipReason: string;
};

export type PartnerListState =
  | { status: "loading" }
  | { status: "ready"; partners: AdminPartner[] }
  | { status: "invalid"; message: string }
  | { status: "error"; message: string }
  | { status: "unauthorized"; message: string };

export type PendingAction = "save" | "delete";

export type SaveResult =
  | { ok: true; partner: AdminPartner }
  | {
      ok: false;
      kind: "validation" | "unauthorized" | "forbidden" | "error";
      message: string | null;
      fieldErrors: PartnerFieldErrors;
    };

export type DeleteResult =
  | { ok: true }
  | { ok: false; kind: "unauthorized" | "forbidden" | "error"; message: string };

export const EMPTY_PARTNER_FORM: PartnerFormValues = {
  name: "",
  websiteUrl: "",
  description: "",
  email: "",
  partnershipReason: "",
};

export function initialPartnerList(): PartnerListState {
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

export function partnerResourcePath(id: string): string {
  return `/partners/${encodeURIComponent(id)}`;
}

export function formFromPartner(partner: AdminPartner): PartnerFormValues {
  return {
    name: partner.name,
    websiteUrl: partner.websiteUrl,
    description: partner.description,
    email: partner.email,
    partnershipReason: partner.partnershipReason,
  };
}

export function validatePartnerForm(
  values: PartnerFormValues,
  options: { requireLogo: boolean; imageError: string | null },
): PartnerFieldErrors {
  const errors: PartnerFieldErrors = {};
  if (!values.name.trim()) errors.name = "Name is required";
  const website = values.websiteUrl.trim();
  if (!website) errors.websiteUrl = "Website URL is required";
  else if (!isWebsiteUrl(website)) errors.websiteUrl = "Website URL must be a valid URL";
  if (!values.description.trim()) errors.description = "Description is required";
  const email = values.email.trim();
  if (!email) errors.email = "Email is required";
  else if (!isEmail(email)) errors.email = "Email format is invalid";
  if (!values.partnershipReason.trim()) errors.partnershipReason = "Partnership reason is required";
  if (options.imageError) errors.file = options.imageError;
  else if (options.requireLogo) errors.file = "Logo file is required";
  return errors;
}

export function buildPartnerFormData(values: PartnerFormValues, file: File | null): FormData {
  const form = new FormData();
  appendRequired(form, "name", values.name);
  appendRequired(form, "websiteUrl", values.websiteUrl);
  appendRequired(form, "description", values.description);
  appendRequired(form, "email", values.email);
  appendRequired(form, "partnershipReason", values.partnershipReason);
  if (file) form.set("file", file);
  return form;
}

export function readPartner(data: unknown): AdminPartner | null {
  if (!isRecord(data)) return null;
  if (!isNonEmptyString(data.id) || !isNonEmptyString(data.name)) return null;
  if (!isNonEmptyString(data.websiteUrl) || !isNonEmptyString(data.logoUrl)) return null;
  if (!isNonEmptyString(data.description) || !isNonEmptyString(data.email)) return null;
  if (!isNonEmptyString(data.partnershipReason)) return null;
  if ("logoPublicId" in data && data.logoPublicId !== undefined && typeof data.logoPublicId !== "string") {
    return null;
  }
  return {
    id: data.id,
    name: data.name,
    websiteUrl: data.websiteUrl,
    logoUrl: data.logoUrl,
    description: data.description,
    email: data.email,
    partnershipReason: data.partnershipReason,
  };
}

export function readPartnerList(data: unknown): AdminPartner[] | null {
  if (!Array.isArray(data)) return null;
  const partners: AdminPartner[] = [];
  for (const item of data) {
    const partner = readPartner(item);
    if (!partner) return null;
    partners.push(partner);
  }
  return partners;
}

export async function loadPartnerList(
  listPartners: () => Promise<unknown>,
): Promise<Exclude<PartnerListState, { status: "loading" }>> {
  try {
    const partners = readPartnerList(await listPartners());
    if (!partners) {
      return { status: "invalid", message: "The partners response was not a list of partners." };
    }
    return { status: "ready", partners };
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 401) {
      return { status: "unauthorized", message: SESSION_EXPIRED_MESSAGE };
    }
    return {
      status: "error",
      message: error instanceof Error && error.message.trim() ? error.message : "The request failed.",
    };
  }
}

export async function savePartner(
  client: {
    createPartner: (form: FormData) => Promise<unknown>;
    updatePartner: (id: string, form: FormData) => Promise<unknown>;
  },
  input: { intent: "create" } | { intent: "edit"; id: string },
  values: PartnerFormValues,
  file: File | null,
  imageError: string | null,
): Promise<SaveResult> {
  const fieldErrors = validatePartnerForm(values, {
    requireLogo: input.intent === "create" && !file,
    imageError,
  });
  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, kind: "validation", message: null, fieldErrors };
  }

  const form = buildPartnerFormData(values, file);
  try {
    const payload =
      input.intent === "create"
        ? await client.createPartner(form)
        : await client.updatePartner(input.id, form);
    const partner = readPartner(payload);
    if (!partner) {
      return {
        ok: false,
        kind: "error",
        message: "The server response did not include the saved partner.",
        fieldErrors: {},
      };
    }
    return { ok: true, partner };
  } catch (error) {
    return { ok: false, ...mutationFailure(error) };
  }
}

export function confirmedDeletion(target: { id: string } | null, confirmed: boolean): string | null {
  if (!confirmed || !target?.id.trim()) return null;
  return target.id;
}

export async function deletePartner(
  client: { deletePartner: (id: string) => Promise<unknown> },
  id: string,
): Promise<DeleteResult> {
  if (!id.trim()) return { ok: false, kind: "error", message: "Choose a partner to delete." };
  try {
    await client.deletePartner(id);
    return { ok: true };
  } catch (error) {
    const failure = mutationFailure(error);
    return { ok: false, kind: failure.kind, message: failure.message };
  }
}

export function fieldErrorsFromMessage(message: string): PartnerFieldErrors {
  const errors: PartnerFieldErrors = {};
  for (const part of message.split(";")) {
    const text = part.trim();
    if (!text) continue;
    const missing = /^Missing required field:\s*([A-Za-z]+)$/.exec(text);
    if (missing && isPartnerField(missing[1])) {
      errors[missing[1]] = text;
      continue;
    }
    const named = /^([A-Za-z]+):\s*(.+)$/.exec(text);
    if (named && isPartnerField(named[1])) {
      errors[named[1]] = named[2];
      continue;
    }
    if (/logo file is required/i.test(text)) errors.file = text;
  }
  return errors;
}

function appendRequired(form: FormData, key: string, value: string) {
  const trimmed = value.trim();
  if (trimmed) form.set(key, trimmed);
}

function mutationFailure(error: unknown): {
  kind: "unauthorized" | "forbidden" | "error";
  message: string;
  fieldErrors: PartnerFieldErrors;
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

function isWebsiteUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isPartnerField(value: string): value is PartnerField {
  return (FIELD_NAMES as readonly string[]).includes(value);
}
