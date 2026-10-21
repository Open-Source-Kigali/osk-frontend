import { createApiClient } from "./http";

export { ApiRequestError } from "./http";

function readBaseUrl(): string {
  const raw = import.meta.env.VITE_API_BASE_URL;
  return typeof raw === "string" ? raw : "";
}

export const BASE_URL = readBaseUrl();

const api = createApiClient({ baseUrl: readBaseUrl });

export const apiGet = api.publicGet;
export const post = api.publicPost;
export const postForm = api.publicPostForm;
export const login = api.login;
export const getSession = api.getSession;
export const logout = api.logout;
export const sessionGet = api.sessionGet;
export const sessionSend = api.sessionSend;
export const sessionForm = api.sessionForm;
