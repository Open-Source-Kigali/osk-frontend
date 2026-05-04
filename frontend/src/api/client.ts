import type { ApiResponse } from "@/types";

export const BASE_URL = "https://osk-backend.onrender.com/api";

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`);
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  const json: ApiResponse<T> = await res.json();
  if (!json.success) throw new Error(json.message || "Request failed");
  return json.data;
}
