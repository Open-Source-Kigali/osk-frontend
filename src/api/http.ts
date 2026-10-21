import type { AuthMe, AuthSession } from "../types/api.types.ts";

const CSRF_HEADER = "X-CSRF-Token";

export class ApiRequestError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
  }
}

type SendOptions = Omit<RequestInit, "credentials" | "headers"> & {
  headers?: HeadersInit;
  session?: boolean;
  csrf?: boolean;
};

export type ApiClient = {
  publicGet<T>(path: string): Promise<T>;
  publicPost<T>(path: string, body: unknown): Promise<T>;
  publicPostForm<T>(path: string, form: FormData): Promise<T>;
  login(email: string, password: string): Promise<AuthMe>;
  getSession(): Promise<AuthMe | null>;
  logout(): Promise<void>;
  sessionGet<T>(path: string): Promise<T>;
  sessionSend<T>(
    path: string,
    method: "POST" | "PUT" | "PATCH" | "DELETE",
    body?: unknown,
  ): Promise<T>;
  sessionForm<T>(
    path: string,
    method: "POST" | "PUT" | "PATCH",
    form: FormData,
  ): Promise<T>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function resolveBaseUrl(baseUrl: string | (() => string)): string {
  const raw = typeof baseUrl === "function" ? baseUrl() : baseUrl;
  const trimmed = raw.trim().replace(/\/$/, "");
  if (!trimmed) {
    throw new ApiRequestError("VITE_API_BASE_URL is not configured", 0);
  }
  return trimmed;
}

function requestUrl(baseUrl: string, path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${normalized}`;
}

async function readEnvelope<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return null as T;
  }

  const text = await response.text();
  if (!text) {
    throw new ApiRequestError(
      `Request failed (${response.status})`,
      response.status,
    );
  }

  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    throw new ApiRequestError(
      `Request failed (${response.status})`,
      response.status,
    );
  }

  if (isRecord(body) && body.success === true) {
    return body.data as T;
  }

  const message =
    isRecord(body) && typeof body.message === "string" && body.message.trim()
      ? body.message
      : `Request failed (${response.status})`;
  throw new ApiRequestError(message, response.status);
}

/**
 * Cookie session plus an in-memory CSRF token.
 * The session cookie is HttpOnly. This client never reads it or writes storage.
 * GET /auth/csrf rotates the server token, so refreshes are single-flighted
 * and a failed mutation is not retried with a newly rotated token.
 */
export function createApiClient(options: {
  baseUrl: string | (() => string);
  fetch?: typeof fetch;
}): ApiClient {
  const fetchImpl = options.fetch ?? globalThis.fetch.bind(globalThis);
  let csrfToken: string | null = null;
  let csrfRequest: Promise<string> | null = null;

  function clearCsrfToken() {
    csrfToken = null;
  }

  async function send<T>(path: string, request: SendOptions = {}): Promise<T> {
    const { session = false, csrf = false, headers: inputHeaders, ...rest } =
      request;
    const headers = new Headers(inputHeaders);
    headers.delete("x-api-key");
    headers.delete("origin");

    if (typeof FormData !== "undefined" && rest.body instanceof FormData) {
      headers.delete("content-type");
    }

    if (csrf) {
      headers.set(CSRF_HEADER, await ensureCsrfToken());
    }

    const response = await fetchImpl(
      requestUrl(resolveBaseUrl(options.baseUrl), path),
      {
        ...rest,
        headers,
        credentials: session || csrf ? "include" : "same-origin",
      },
    );

    try {
      return await readEnvelope<T>(response);
    } catch (error) {
      if (error instanceof ApiRequestError && (session || csrf)) {
        if (error.status === 401 || (csrf && error.status === 403)) {
          clearCsrfToken();
        }
      }
      throw error;
    }
  }

  async function fetchCsrfToken(): Promise<string> {
    const data = await send<{ csrfToken?: unknown }>("/auth/csrf", {
      method: "GET",
      session: true,
    });
    if (typeof data?.csrfToken !== "string" || data.csrfToken.length === 0) {
      throw new ApiRequestError("CSRF token was not returned", 500);
    }
    csrfToken = data.csrfToken;
    return data.csrfToken;
  }

  function ensureCsrfToken(): Promise<string> {
    if (csrfToken) return Promise.resolve(csrfToken);
    if (!csrfRequest) {
      csrfRequest = fetchCsrfToken().finally(() => {
        csrfRequest = null;
      });
    }
    return csrfRequest;
  }

  async function publicGet<T>(path: string): Promise<T> {
    return send<T>(path, { method: "GET" });
  }

  async function publicPost<T>(path: string, body: unknown): Promise<T> {
    return send<T>(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }

  async function publicPostForm<T>(path: string, form: FormData): Promise<T> {
    return send<T>(path, { method: "POST", body: form });
  }

  async function login(email: string, password: string): Promise<AuthMe> {
    const data = await send<AuthSession>("/auth/login", {
      method: "POST",
      session: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (typeof data.csrfToken !== "string" || data.csrfToken.length === 0) {
      throw new ApiRequestError("Login did not return a CSRF token", 500);
    }
    csrfToken = data.csrfToken;
    return { user: data.user, expiresAt: data.expiresAt };
  }

  async function getSession(): Promise<AuthMe | null> {
    try {
      return await send<AuthMe>("/auth/me", { method: "GET", session: true });
    } catch (error) {
      if (error instanceof ApiRequestError && error.status === 401) {
        return null;
      }
      throw error;
    }
  }

  async function logout(): Promise<void> {
    await send<null>("/auth/logout", { method: "POST", session: true, csrf: true });
    clearCsrfToken();
  }

  async function sessionGet<T>(path: string): Promise<T> {
    return send<T>(path, { method: "GET", session: true });
  }

  async function sessionSend<T>(
    path: string,
    method: "POST" | "PUT" | "PATCH" | "DELETE",
    body?: unknown,
  ): Promise<T> {
    const headers = new Headers();
    let payload: string | undefined;
    if (body !== undefined) {
      headers.set("Content-Type", "application/json");
      payload = JSON.stringify(body);
    }
    return send<T>(path, {
      method,
      session: true,
      csrf: true,
      headers,
      body: payload,
    });
  }

  async function sessionForm<T>(
    path: string,
    method: "POST" | "PUT" | "PATCH",
    form: FormData,
  ): Promise<T> {
    return send<T>(path, {
      method,
      session: true,
      csrf: true,
      body: form,
    });
  }

  return {
    publicGet,
    publicPost,
    publicPostForm,
    login,
    getSession,
    logout,
    sessionGet,
    sessionSend,
    sessionForm,
  };
}
