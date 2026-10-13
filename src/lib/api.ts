const BASE = import.meta.env.VITE_API_BASE_URL;

export async function parseJsonSafety(response: Response) {
  const text = await response.text();
  if (!text || text.trim() === "") {
    return null;
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(
      "Received an invalid response from the server. Please try again.",
    );
  }
}

//centralize response envlope and status validator
async function handleResponse<T>(response: Response): Promise<T> {
  const json = await parseJsonSafety(response);
  if (!response.ok) {
    const serverMessage = json?.message;
    const errorMessage =
      typeof serverMessage === "string" && serverMessage.length < 150
        ? serverMessage
        : `Request failed (HTTP ${response.status}). Please try again.`;
    throw new Error(errorMessage);
  }

  if (json === null) {
    if (response.status === 204) {
      return undefined as unknown as T;
    }
    throw new Error("Recieved an empty response from the server");
  }

  if (typeof json === "object" && json !== null && "success" in json) {
    if (!json.success) {
      throw new Error(json.message ?? "Operation failed. Please try again.");
    }
    return json.data;
  }
  return json as T;
}

export async function safetyFetchApi<T>(
  input: RequestInfo,
  init?: RequestInit,
): Promise<T> {
  try {
    const fetchApi = await fetch(input, init);
    return await handleResponse(fetchApi);
  } catch (error) {
    if (error instanceof TypeError && error?.message === "Failed to fetch") {
      throw new Error(
        "Network Error. Please check your connection and try again.",
      );
    }
    throw error;
  }
}
export async function post<T>(path: string, body: unknown): Promise<T> {
  return await safetyFetchApi(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function postForm<T>(path: string, form: FormData): Promise<T> {
  return await safetyFetchApi(`${BASE}${path}`, {
    method: "POST",
    body: form,
    // No Content-Type header — browser sets it automatically with the boundary
  });
}

export async function get<T>(path: string): Promise<T> {
  return await safetyFetchApi(`${BASE}${path}`);
}
