const BASE = import.meta.env.VITE_API_BASE_URL;


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



export async function postForm<T>(path: string, form: FormData): Promise<T> {
  const response = await fetch(`${BASE}${path}`, {
    method: "POST",
    body:   form,
    // No Content-Type header - browser sets it automatically with the boundary
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