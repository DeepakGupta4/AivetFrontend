// Single source of truth for the backend API base URL (always ends with /api).
//
// Priority:
//   1. NEXT_PUBLIC_API_URL  — set this in the host (Vercel) to override.
//   2. Known production backend, when the app is served from a non-localhost
//      host (so it works on Vercel even if the env var wasn't set).
//   3. Local dev default.
//
// Called at runtime (not module load) so the browser host check is accurate.
const PROD_API_BASE = "https://aivet-backend.vercel.app/api";

export function getApiBase(): string {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host !== "localhost" && host !== "127.0.0.1") return PROD_API_BASE;
  }
  return "http://localhost:8000/api";
}
