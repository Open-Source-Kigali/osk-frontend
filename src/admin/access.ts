import type { AuthMe } from "../types/api.types.ts";
import { ApiRequestError } from "../api/http.ts";

export const ADMIN_HOME_PATH = "/admin";
export const ADMIN_LOGIN_PATH = "/admin/login";

const INTERNAL_ORIGIN = "https://admin.osk.local";

export const ADMIN_NAV = [
  { label: "Dashboard", to: "/admin", end: true },
  { label: "Events", to: "/admin/events", end: false },
  { label: "Projects", to: "/admin/projects", end: false },
  { label: "Partners", to: "/admin/partners", end: false },
  { label: "Members", to: "/admin/members", end: false },
  { label: "Partner applications", to: "/admin/partner-applications", end: false },
  { label: "Reviews", to: "/admin/reviews", end: false },
] as const;

export type LoginFieldErrors = {
  email?: string;
  password?: string;
};

export type LoginResult =
  | { ok: true; destination: string }
  | { ok: false; fieldErrors: LoginFieldErrors; message: string | null };

export type AdminGate =
  | { status: "loading" }
  | { status: "anonymous" }
  | { status: "authenticated"; session: AuthMe }
  | { status: "error"; message: string };

export type AdminScreen =
  | { kind: "loading" }
  | { kind: "redirect"; to: string }
  | { kind: "unavailable"; message: string }
  | { kind: "shell"; session: AuthMe };

export type SignOutResult =
  | { ok: true }
  | { ok: false; sessionEnded: boolean; message: string };

export function initialAdminGate(): AdminGate {
  return { status: "loading" };
}

/**
 * Accepts only same-app admin paths. Absolute URLs, protocol-relative URLs,
 * and the login route itself fall back to the admin home.
 */
export function resolveAdminDestination(raw: string | null | undefined): string {
  if (typeof raw !== "string") return ADMIN_HOME_PATH;
  const value = raw.trim();
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return ADMIN_HOME_PATH;
  }
  if (value.includes("://")) return ADMIN_HOME_PATH;

  let url: URL;
  try {
    url = new URL(value, INTERNAL_ORIGIN);
  } catch {
    return ADMIN_HOME_PATH;
  }

  if (url.origin !== INTERNAL_ORIGIN) return ADMIN_HOME_PATH;
  const path = url.pathname;
  if (path !== ADMIN_HOME_PATH && !path.startsWith(`${ADMIN_HOME_PATH}/`)) {
    return ADMIN_HOME_PATH;
  }
  if (path === ADMIN_LOGIN_PATH || path.startsWith(`${ADMIN_LOGIN_PATH}/`)) {
    return ADMIN_HOME_PATH;
  }
  return `${path}${url.search}`;
}

export function loginRedirectPath(returnTo: string): string {
  const next = resolveAdminDestination(returnTo);
  return `${ADMIN_LOGIN_PATH}?next=${encodeURIComponent(next)}`;
}

export function validateLoginInput(email: string, password: string): LoginFieldErrors {
  const errors: LoginFieldErrors = {};
  const trimmedEmail = email.trim();
  if (!trimmedEmail) errors.email = "Email is required";
  else if (!/\S+@\S+\.\S+/.test(trimmedEmail)) {
    errors.email = "Enter a valid email address";
  }
  if (!password) errors.password = "Password is required";
  return errors;
}

export async function performLogin(
  values: { email: string; password: string; next: string | null },
  login: (email: string, password: string) => Promise<AuthMe>,
): Promise<LoginResult> {
  const fieldErrors = validateLoginInput(values.email, values.password);
  if (fieldErrors.email || fieldErrors.password) {
    return { ok: false, fieldErrors, message: null };
  }

  try {
    await login(values.email.trim(), values.password);
    return { ok: true, destination: resolveAdminDestination(values.next) };
  } catch (error) {
    const message =
      error instanceof Error && error.message.trim()
        ? error.message
        : "Sign in failed. Try again.";
    return { ok: false, fieldErrors: {}, message };
  }
}

export async function resolveLoginEntry(
  getSession: () => Promise<AuthMe | null>,
): Promise<"form" | "redirect"> {
  try {
    const session = await getSession();
    return session ? "redirect" : "form";
  } catch {
    return "form";
  }
}

export function loginNotice(state: unknown): string | null {
  if (typeof state !== "object" || state === null || !("notice" in state)) {
    return null;
  }
  const notice = state.notice;
  return typeof notice === "string" && notice.trim() ? notice : null;
}

export async function checkAdminSession(
  getSession: () => Promise<AuthMe | null>,
): Promise<Exclude<AdminGate, { status: "loading" }>> {
  try {
    const session = await getSession();
    if (!session) return { status: "anonymous" };
    return { status: "authenticated", session };
  } catch (error) {
    const message =
      error instanceof Error && error.message.trim()
        ? error.message
        : "The session check failed.";
    return { status: "error", message };
  }
}

export function describeAdminScreen(gate: AdminGate, returnTo: string): AdminScreen {
  switch (gate.status) {
    case "loading":
      return { kind: "loading" };
    case "anonymous":
      return { kind: "redirect", to: loginRedirectPath(returnTo) };
    case "error":
      return { kind: "unavailable", message: gate.message };
    case "authenticated":
      return { kind: "shell", session: gate.session };
  }
}

export function showsProtectedContent(screen: AdminScreen): boolean {
  return screen.kind === "shell";
}

export async function endAdminSession(
  logout: () => Promise<void>,
): Promise<SignOutResult> {
  try {
    await logout();
    return { ok: true };
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 401) {
      return {
        ok: false,
        sessionEnded: true,
        message: "This session is no longer active. Sign in again.",
      };
    }
    const detail =
      error instanceof Error && error.message.trim()
        ? error.message
        : "The server did not confirm sign-out.";
    return {
      ok: false,
      sessionEnded: false,
      message: `${detail} Sign-out was not confirmed, so this page stays open.`,
    };
  }
}
