import { safetyFetchApi } from "@/lib/api";

export const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function apiGet<T>(path: string): Promise<T> {
  return await safetyFetchApi(`${BASE_URL}${path}`);
}
