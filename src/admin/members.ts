import { ApiRequestError } from "../api/http.ts";

/**
 * GET /members is public and returns the full list.
 * PUT and DELETE /members/:id are admin writes and use JSON, not multipart.
 * POST /members is public self-registration. This module does not call it.
 *
 * Update is partial, but every included string must still be non-empty and
 * codingLevel must stay one of the three enum values. The controller drops
 * empty strings after validation. None of the member fields can be cleared.
 */

export const CODING_LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
] as const;

export type CodingLevel = (typeof CODING_LEVELS)[number]["value"];

export const SESSION_EXPIRED_MESSAGE = "Your admin session is no longer active.";
export const MEMBER_UNCHANGED_MESSAGE = "The member was not changed.";

export const UNCLEARABLE_MEMBER_FIELDS = [
  "name",
  "email",
  "githubUsername",
  "orgName",
  "joinReason",
  "codingLevel",
] as const;

const FIELD_NAMES = [
  "name",
  "email",
  "githubUsername",
  "orgName",
  "joinReason",
  "codingLevel",
] as const;

export type MemberField = (typeof FIELD_NAMES)[number];
export type MemberFieldErrors = Partial<Record<MemberField, string>>;

export type MemberFormValues = {
  name: string;
  email: string;
  githubUsername: string;
  orgName: string;
  joinReason: string;
  codingLevel: CodingLevel;
};

export type MemberUpdatePayload = {
  name?: string;
  email?: string;
  githubUsername?: string;
  orgName?: string;
  joinReason?: string;
  codingLevel?: CodingLevel;
};

export type AdminMember = {
  id: string;
  name: string;
  email: string;
  githubUsername: string;
  orgName: string;
  joinReason: string;
  codingLevel: CodingLevel;
};

export type MemberListState =
  | { status: "loading" }
  | { status: "ready"; members: AdminMember[] }
  | { status: "invalid"; message: string }
  | { status: "error"; message: string }
  | { status: "unauthorized"; message: string };

export type PendingAction = "save" | "delete";

export type SaveResult =
  | { ok: true; member: AdminMember }
  | {
      ok: false;
      kind: "validation" | "unauthorized" | "forbidden" | "error";
      message: string | null;
      fieldErrors: MemberFieldErrors;
    };

export type DeleteResult =
  | { ok: true }
  | { ok: false; kind: "unauthorized" | "forbidden" | "error"; message: string };

export const EMPTY_MEMBER_FORM: MemberFormValues = {
  name: "",
  email: "",
  githubUsername: "",
  orgName: "",
  joinReason: "",
  codingLevel: "beginner",
};

export function initialMemberList(): MemberListState {
  return { status: "loading" };
}

export function controlsLocked(action: PendingAction | null): boolean {
  return action !== null;
}

export function beginPending(current: PendingAction | null, next: PendingAction): PendingAction | null {
  if (current) return null;
  return next;
}

export function memberResourcePath(id: string): string {
  return `/members/${encodeURIComponent(id)}`;
}

export function formFromMember(member: AdminMember): MemberFormValues {
  return {
    name: member.name,
    email: member.email,
    githubUsername: member.githubUsername,
    orgName: member.orgName,
    joinReason: member.joinReason,
    codingLevel: member.codingLevel,
  };
}

export function validateMemberForm(values: MemberFormValues): MemberFieldErrors {
  const errors: MemberFieldErrors = {};
  if (!values.name.trim()) errors.name = "Name is required";
  const email = values.email.trim();
  if (!email) errors.email = "Email is required";
  else if (!isEmail(email)) errors.email = "Email format is invalid";
  if (!values.githubUsername.trim()) errors.githubUsername = "GitHub username is required";
  if (!values.orgName.trim()) errors.orgName = "Organization name is required";
  if (!values.joinReason.trim()) errors.joinReason = "Join reason is required";
  if (!isCodingLevel(values.codingLevel)) errors.codingLevel = "Coding level must be beginner, intermediate, or advanced";
  return errors;
}

export function buildMemberPayload(values: MemberFormValues): MemberUpdatePayload {
  const payload: MemberUpdatePayload = {};
  const name = values.name.trim();
  const email = values.email.trim();
  const githubUsername = values.githubUsername.trim();
  const orgName = values.orgName.trim();
  const joinReason = values.joinReason.trim();
  if (name) payload.name = name;
  if (email) payload.email = email;
  if (githubUsername) payload.githubUsername = githubUsername;
  if (orgName) payload.orgName = orgName;
  if (joinReason) payload.joinReason = joinReason;
  if (isCodingLevel(values.codingLevel)) payload.codingLevel = values.codingLevel;
  return payload;
}

export function readMember(data: unknown): AdminMember | null {
  if (!isRecord(data)) return null;
  if (!isNonEmptyString(data.id) || !isNonEmptyString(data.name) || !isNonEmptyString(data.email)) return null;
  if (!isNonEmptyString(data.githubUsername) || !isNonEmptyString(data.orgName)) return null;
  if (!isNonEmptyString(data.joinReason) || !isCodingLevel(data.codingLevel)) return null;
  if ("createdAt" in data && data.createdAt !== undefined && typeof data.createdAt !== "string") return null;
  if ("updatedAt" in data && data.updatedAt !== undefined && typeof data.updatedAt !== "string") return null;
  return {
    id: data.id,
    name: data.name,
    email: data.email,
    githubUsername: data.githubUsername,
    orgName: data.orgName,
    joinReason: data.joinReason,
    codingLevel: data.codingLevel,
  };
}

export function readMemberList(data: unknown): AdminMember[] | null {
  if (!Array.isArray(data)) return null;
  const members: AdminMember[] = [];
  for (const item of data) {
    const member = readMember(item);
    if (!member) return null;
    members.push(member);
  }
  return members;
}

export async function loadMemberList(
  listMembers: () => Promise<unknown>,
): Promise<Exclude<MemberListState, { status: "loading" }>> {
  try {
    const members = readMemberList(await listMembers());
    if (!members) {
      return { status: "invalid", message: "The members response was not a list of members." };
    }
    return { status: "ready", members };
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

export async function saveMember(
  client: { updateMember: (id: string, payload: MemberUpdatePayload) => Promise<unknown> },
  id: string,
  values: MemberFormValues,
): Promise<SaveResult> {
  const fieldErrors = validateMemberForm(values);
  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, kind: "validation", message: null, fieldErrors };
  }
  if (!id.trim()) {
    return { ok: false, kind: "error", message: "Choose a member to update.", fieldErrors: {} };
  }

  try {
    const member = readMember(await client.updateMember(id, buildMemberPayload(values)));
    if (!member) {
      return {
        ok: false,
        kind: "error",
        message: "The server response did not include the saved member.",
        fieldErrors: {},
      };
    }
    return { ok: true, member };
  } catch (error) {
    return { ok: false, ...mutationFailure(error) };
  }
}

export function confirmedDeletion(target: { id: string } | null, confirmed: boolean): string | null {
  if (!confirmed || !target?.id.trim()) return null;
  return target.id;
}

export async function deleteMember(
  client: { deleteMember: (id: string) => Promise<unknown> },
  id: string,
): Promise<DeleteResult> {
  if (!id.trim()) return { ok: false, kind: "error", message: "Choose a member to delete." };
  try {
    await client.deleteMember(id);
    return { ok: true };
  } catch (error) {
    const failure = mutationFailure(error);
    return { ok: false, kind: failure.kind, message: failure.message };
  }
}

export function fieldErrorsFromMessage(message: string): MemberFieldErrors {
  const errors: MemberFieldErrors = {};
  for (const part of message.split(";")) {
    const text = part.trim();
    if (!text) continue;
    const missing = /^Missing required field:\s*([A-Za-z]+)$/.exec(text);
    if (missing && isMemberField(missing[1])) {
      errors[missing[1]] = text;
      continue;
    }
    const named = /^([A-Za-z]+):\s*(.+)$/.exec(text);
    if (named && isMemberField(named[1])) errors[named[1]] = named[2];
  }
  return errors;
}

function mutationFailure(error: unknown): {
  kind: "unauthorized" | "forbidden" | "error";
  message: string;
  fieldErrors: MemberFieldErrors;
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

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isCodingLevel(value: unknown): value is CodingLevel {
  return CODING_LEVELS.some((level) => level.value === value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isMemberField(value: string): value is MemberField {
  return (FIELD_NAMES as readonly string[]).includes(value);
}
