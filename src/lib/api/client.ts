import { getApiBase } from "../apiBase";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

interface Envelope<T> {
  success?: boolean;
  message?: string;
  data?: T;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${getApiBase()}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const body = (await res.json().catch(() => ({}))) as Envelope<T>;

  if (!res.ok || body.success === false) {
    throw new Error(body.message ?? `Request failed (${res.status})`);
  }

  // The API wraps payloads in { success, data }. Unwrap to the data when present.
  return (body.success !== undefined ? (body.data as T) : (body as T));
}

export const api = {
  get:    <T>(path: string)                => request<T>(path),
  post:   <T>(path: string, body: unknown) => request<T>(path, { method: "POST",   body: JSON.stringify(body) }),
  put:    <T>(path: string, body: unknown) => request<T>(path, { method: "PUT",    body: JSON.stringify(body) }),
  delete: <T>(path: string)                => request<T>(path, { method: "DELETE" }),
};
