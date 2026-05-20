import { getApiBase } from "../apiBase";

/**
 * Download a project's PDF report. Fetches the binary with the auth header and
 * triggers a browser download (the JSON client can't handle binary responses).
 */
export async function downloadReportPdf(projectId: string, filename: string): Promise<void> {
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  const res = await fetch(`${getApiBase()}/reports/projects/${projectId}/pdf`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    const msg = await res.json().catch(() => ({ message: "Report failed" }));
    throw new Error(msg.message ?? `Report failed (${res.status})`);
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
