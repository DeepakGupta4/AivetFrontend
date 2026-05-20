"use client";

import { useState } from "react";
import Link from "next/link";
import Topbar from "@/components/shared/Topbar";
import { useAuthStore } from "@/lib/stores/authStore";
import { useDashboard } from "@/lib/hooks/useDashboard";
import { downloadReportPdf } from "@/lib/api/reports";
import { useTier } from "@/lib/hooks/useTier";
import LockedFeature from "@/components/shared/LockedFeature";
import {
  FileText, Download, Loader2, CheckCircle2, AlertCircle, BarChart3, Link2, Users2, Zap,
} from "lucide-react";

const LIME = "#C9F31D";
const card: React.CSSProperties = { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 };

const INCLUDES = [
  { icon: BarChart3, label: "Visibility snapshot", desc: "Overall score + all five sub-scores" },
  { icon: Zap,       label: "Recent prompt runs", desc: "Latest runs and which engines responded" },
  { icon: Users2,    label: "Brand & project details", desc: "Domain, industry and tracking config" },
  { icon: Link2,     label: "Score factor breakdown", desc: "Mentions, ranking, sentiment, citations" },
];

export default function ReportsPage() {
  const project   = useAuthStore((s) => s.project);
  const projectId = useAuthStore((s) => s.projectId);
  const { allows, resolved: tierResolved } = useTier();
  const { data } = useDashboard(30);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleDownload() {
    if (!projectId) return;
    setBusy(true); setError(null); setDone(false);
    try {
      const name = `aivet-${(project?.domain ?? "report").replace(/[^a-z0-9]/gi, "-")}.pdf`;
      await downloadReportPdf(projectId, name);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate report");
    } finally {
      setBusy(false);
    }
  }

  if (tierResolved && !allows("reports")) {
    return <LockedFeature title="Reports" feature="reports" subtitle={project ? `${project.name} · ${project.domain}` : undefined} />;
  }

  return (
    <div style={{ background: "#0E0F11", minHeight: "100vh" }}>
      <Topbar title="Reports" subtitle={project ? `${project.name} · ${project.domain}` : "Export visibility reports"} />

      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>

        {!projectId && (
          <div style={{ ...card, padding: 40, textAlign: "center" }}>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", margin: 0 }}>Select or add a brand from the sidebar to export reports.</p>
          </div>
        )}

        {projectId && (
          <>
            {error && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", fontSize: 12, color: "rgba(255,255,255,0.65)" }}>
                <AlertCircle size={14} style={{ color: "#EF4444" }} /> {error}
              </div>
            )}
            {done && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", borderRadius: 10, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
                <CheckCircle2 size={14} style={{ color: "#22C55E" }} /> Report downloaded.
              </div>
            )}

            {/* Generate card */}
            <div style={{ ...card, padding: 24, display: "flex", alignItems: "center", gap: 20 }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, flexShrink: 0, background: "rgba(201,243,29,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <FileText size={26} style={{ color: LIME }} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff", margin: "0 0 4px" }}>AI Visibility Report</h3>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: 0 }}>
                  A PDF snapshot of {project?.brandName}&apos;s current AI visibility — score{data ? ` (currently ${data.currentScore})` : ""}, factors, and recent runs.
                </p>
              </div>
              <button
                onClick={handleDownload}
                disabled={busy}
                className="btn-lime"
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 20px", fontSize: 13.5, cursor: busy ? "not-allowed" : "pointer", opacity: busy ? 0.7 : 1 }}
              >
                {busy ? <><Loader2 size={16} className="auth-spin" /> Generating…</> : <><Download size={16} /> Download PDF</>}
              </button>
            </div>

            {/* What's included */}
            <div style={{ ...card, padding: 22 }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: "#fff", margin: "0 0 16px" }}>What&apos;s included</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
                {INCLUDES.map(({ icon: Icon, label, desc }) => (
                  <div key={label} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 16px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon size={16} style={{ color: LIME }} />
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#fff", margin: 0 }}>{label}</p>
                      <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.45)", margin: "2px 0 0", lineHeight: 1.5 }}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.35)", margin: "16px 0 0" }}>
                Tip: data comes from your campaigns — <Link href="/prompts" style={{ color: LIME, textDecoration: "none" }}>run one</Link> for a richer report.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
