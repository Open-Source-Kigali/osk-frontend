// src/lib/api.ts

const BASE = "https://osk-backend.onrender.com/api";

export async function post<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${BASE}${path}`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(body),
  });

  const json = await response.json();

  if (!json.success) {
    throw new Error(json.message ?? "Something went wrong. Please try again.");
  }

  return json.data;
}

// ── Multipart form data — used when the request includes a file upload ─────────
// We do NOT set Content-Type manually here.
// When you pass a FormData object to fetch, the browser sets it automatically
// including the correct boundary string. Setting it manually breaks the upload.

export async function postForm<T>(path: string, form: FormData): Promise<T> {
  const response = await fetch(`${BASE}${path}`, {
    method: "POST",
    body:   form,
    // No Content-Type header — browser sets it automatically with the boundary
  });

  const json = await response.json();

  if (!json.success) {
    throw new Error(json.message ?? "Something went wrong. Please try again.");
  }

  return json.data;
}

export async function get<T>(path: string): Promise<T> {
  const response = await fetch(`${BASE}${path}`);
  const json = await response.json();

  if (!json.success) {
    throw new Error(json.message ?? "Something went wrong.");
  }

  return json.data;
}