"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import Topbar from "@/components/shared/Topbar";
import CompetitorChart from "@/components/charts/CompetitorChart";
import { useAuthStore } from "@/lib/stores/authStore";
import { visibilityApi, type CompetitorAnalysis } from "@/lib/api/visibility";
import { projectsApi, type CompetitorEntry } from "@/lib/api/projects";
import { engineColors, getScoreBand } from "@/lib/colors";
import { useTier } from "@/lib/hooks/useTier";
import LockedFeature from "@/components/shared/LockedFeature";
import {
  Plus, Trophy, Eye, Users, Trash2, X, Loader2, AlertCircle, RefreshCw, ArrowRight,
} from "lucide-react";

const LIME = "#C9F31D";
const card: React.CSSProperties = { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 };
const MODEL_LABEL: Record<string, string> = { chatgpt: "ChatGPT", gemini: "Gemini", claude: "Claude", perplexity: "Perplexity", google_ai_overview: "Google AI" };
const labelFor = (m: string) => MODEL_LABEL[m] ?? m.charAt(0).toUpperCase() + m.slice(1);

function cleanDomain(raw: string) {
  return raw.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "");
}

// ── Add competitor modal ─────────────────────────────────────────────────────
function AddCompetitorModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (b: string, d: string) => Promise<void> }) {
  const [brandName, setBrandName] = useState("");
  const [domain, setDomain] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!brandName.trim()) return setErr("Competitor name is required");
    setBusy(true); setErr(null);
    try { await onSubmit(brandName.trim(), cleanDomain(domain)); }
    catch (e2) { setErr(e2 instanceof Error ? e2.message : "Failed"); setBusy(false); }
  }

  const node = (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} className="animate-fade-in" style={{ width: "100%", maxWidth: 420, background: "#141517", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "#fff", margin: 0 }}>Add competitor</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}><X size={18} style={{ color: "rgba(255,255,255,0.45)" }} /></button>
        </div>
        <form onSubmit={submit} style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
          {err && <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "10px 12px", borderRadius: 10, fontSize: 12.5, background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.25)", color: "#EF4444" }}><AlertCircle size={15} />{err}</div>}
          <div>
            <label style={{ display: "block", fontSize: 12, color: "rgba(255,255,255,0.6)", marginBottom: 7 }}>Brand name</label>
            <input className="auth-input" style={{ padding: "11px 13px" }} value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="RivalCo" autoFocus />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, color: "rgba(255,255,255,0.6)", marginBottom: 7 }}>Domain <span style={{ color: "rgba(255,255,255,0.3)" }}>(optional)</span></label>
            <input className="auth-input" style={{ padding: "11px 13px" }} value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="rivalco.com" />
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button type="button" onClick={onClose} className="btn-ghost" style={{ flex: 1, padding: "11px", fontSize: 13, cursor: "pointer" }}>Cancel</button>
            <button type="submit" disabled={busy} className="btn-lime" style={{ flex: 1, padding: "11px", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, cursor: busy ? "not-allowed" : "pointer" }}>
              {busy ? <><Loader2 size={15} className="auth-spin" /> Adding…</> : "Add competitor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
  if (typeof document === "undefined") return null;
  return createPortal(node, document.body);
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function CompetitorsPage() {
  const project   = useAuthStore((s) => s.project);
  const projectId = useAuthStore((s) => s.projectId);
  const { allows, resolved: tierResolved } = useTier();

  const [days, setDays]       = useState(30);
  const [data, setData]       = useState<CompetitorAnalysis | null>(null);
  const [comps, setComps]     = useState<CompetitorEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [notice, setNotice]   = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!projectId) { setLoading(false); return; }
    setLoading(true); setError(null);
    try {
      const [a, c] = await Promise.all([
        visibilityApi.getCompetitorAnalysis(projectId, days),
        projectsApi.listCompetitors(projectId).catch(() => [] as CompetitorEntry[]),
      ]);
      setData(a); setComps(c);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load competitors");
    } finally {
      setLoading(false);
    }
  }, [projectId, days]);

  useEffect(() => { load(); }, [load]);

  async function handleAdd(brandName: string, domain: string) {
    if (!projectId) return;
    await projectsApi.addCompetitor(projectId, { brandName, domain });
    setShowAdd(false);
    setNotice(`Added ${brandName}. Run a campaign to start tracking its visibility vs yours.`);
    await load();
  }

  async function handleRemove(name: string) {
    if (!projectId) return;
    const match = comps.find((c) => c.brandName.toLowerCase() === name.toLowerCase());
    if (!match?._id) return;
    setComps((prev) => prev.filter((c) => c._id !== match._id));
    await projectsApi.removeCompetitor(projectId, match._id).catch(() => {});
    await load();
  }

  const entities = data?.entities ?? [];
  const models = data?.models ?? [];
  const own = entities.find((e) => e.isOwn);
  const topRival = entities.filter((e) => !e.isOwn).sort((a, b) => b.score - a.score)[0];
  const gap = own && topRival ? topRival.score - own.score : 0;

  const stats = [
    { label: "Competitors Tracked", value: String(comps.length), icon: Users, color: LIME },
    { label: "Your Share", value: own ? `${own.score}%` : "—", icon: Trophy, color: "#22C55E" },
    { label: "Gap to Leader", value: gap > 0 ? `-${gap}%` : "Leading", icon: Eye, color: gap > 0 ? "#EF4444" : "#22C55E" },
    { label: "Total Mentions", value: String(entities.reduce((s, e) => s + e.mentions, 0)), icon: Eye, color: "#22B8CF" },
  ];

  const shareData = entities.map((e) => ({ brand: e.name, score: e.score, color: e.isOwn ? LIME : getScoreBand(e.score).color }));

  if (tierResolved && !allows("competitors")) {
    return <LockedFeature title="Competitor Analysis" feature="competitors" subtitle={project ? `${project.name} · ${project.domain}` : undefined} />;
  }

  return (
    <div style={{ background: "#0E0F11", minHeight: "100vh" }}>
      <Topbar title="Competitor Analysis" subtitle={project ? `${project.name} · ${project.domain}` : "Track visibility share across AI models"} days={days} onDaysChange={setDays} />

      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>

        {!projectId && (
          <div style={{ ...card, padding: 40, textAlign: "center" }}>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", margin: 0 }}>Select or add a brand from the sidebar to analyze competitors.</p>
          </div>
        )}

        {projectId && (
          <>
            {error && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "rgba(255,255,255,0.65)" }}><AlertCircle size={14} style={{ color: "#EF4444" }} /> {error}</span>
                <button onClick={load} style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 7, border: "none", cursor: "pointer", background: "rgba(239,68,68,0.12)", color: "#EF4444", fontSize: 11, fontWeight: 600 }}><RefreshCw size={11} /> Retry</button>
              </div>
            )}
            {notice && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 14px", borderRadius: 10, background: "rgba(201,243,29,0.07)", border: "1px solid rgba(201,243,29,0.22)" }}>
                <span style={{ fontSize: 12.5, color: "rgba(255,255,255,0.75)", flex: 1 }}>{notice}</span>
                <Link href="/prompts" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11.5, fontWeight: 600, color: LIME, textDecoration: "none" }}>Campaigns <ArrowRight size={12} /></Link>
              </div>
            )}

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              {stats.map(({ label, value, icon: Icon, color }) => (
                <div key={label} style={{ ...card, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, background: `${color}15`, border: `1px solid ${color}25`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={16} style={{ color }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", lineHeight: 1, letterSpacing: "-0.5px" }}>{loading ? "—" : value}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.38)", marginTop: 3 }}>{label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Header action */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.50)", margin: 0 }}>
                Tracking <span style={{ color: "#fff", fontWeight: 600 }}>{comps.length} competitors</span> across <span style={{ color: "#fff", fontWeight: 600 }}>{models.length || 4} AI models</span>
              </p>
              <button onClick={() => setShowAdd(true)} className="btn-lime" style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", fontSize: 13, cursor: "pointer" }}>
                <Plus size={14} /> Add Competitor
              </button>
            </div>

            {entities.length <= 1 && !loading ? (
              <div style={{ ...card, padding: 40, textAlign: "center" }}>
                <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.6)", margin: "0 0 14px" }}>
                  No competitors tracked yet. Add competitors, then run a campaign to compare visibility across AI engines.
                </p>
                <button onClick={() => setShowAdd(true)} className="btn-lime" style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 16px", fontSize: 12.5, cursor: "pointer" }}>
                  <Plus size={15} /> Add Competitor
                </button>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 16, alignItems: "start" }}>
                <CompetitorChart data={shareData} brandName={data?.brandName ?? ""} />

                <div style={{ ...card, overflow: "hidden" }}>
                  <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                    <h3 style={{ fontSize: 13, fontWeight: 700, color: "#fff", margin: 0 }}>Share of Voice Breakdown</h3>
                  </div>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                          {["#", "Brand", "Share", "Mentions", ...models.map(labelFor), ""].map((h, i) => (
                            <th key={i} style={{ padding: "9px 16px", textAlign: "left", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", color: "rgba(255,255,255,0.28)", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {entities.map((e, i) => {
                          const band = getScoreBand(e.score);
                          return (
                            <tr key={e.name} style={{ borderBottom: i < entities.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", background: e.isOwn ? "rgba(201,243,29,0.03)" : "transparent" }}>
                              <td style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
                                <span style={{ fontSize: 12, fontWeight: 700, color: i === 0 ? LIME : "rgba(255,255,255,0.28)" }}>{i === 0 ? "🥇" : `#${i + 1}`}</span>
                              </td>
                              <td style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                  <span style={{ fontSize: 13, fontWeight: 700, color: e.isOwn ? LIME : "#fff" }}>{e.name}</span>
                                  {e.isOwn && <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 6px", borderRadius: 20, background: "rgba(201,243,29,0.15)", color: LIME }}>YOU</span>}
                                </div>
                              </td>
                              <td style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  <div style={{ width: 52, height: 5, borderRadius: 3, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                                    <div style={{ height: "100%", borderRadius: 3, width: `${e.score}%`, background: e.isOwn ? "linear-gradient(90deg,#C9F31D,#A8D017)" : band.color }} />
                                  </div>
                                  <span style={{ fontSize: 14, fontWeight: 800, color: band.color }}>{e.score}%</span>
                                </div>
                              </td>
                              <td style={{ padding: "13px 16px", fontSize: 13, fontWeight: 600, color: "#fff" }}>{e.mentions.toLocaleString()}</td>
                              {models.map((m) => {
                                const v = e.perModel[m] ?? 0;
                                const mColor = engineColors[m] ?? "#888";
                                return (
                                  <td key={m} style={{ padding: "13px 16px", whiteSpace: "nowrap" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                      <div style={{ width: 32, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                                        <div style={{ height: "100%", borderRadius: 2, width: `${v}%`, background: mColor, opacity: 0.85 }} />
                                      </div>
                                      <span style={{ fontSize: 12, fontWeight: 600, color: v ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.25)" }}>{v}</span>
                                    </div>
                                  </td>
                                );
                              })}
                              <td style={{ padding: "13px 16px" }}>
                                {!e.isOwn && (
                                  <button onClick={() => handleRemove(e.name)} title="Remove" style={{ width: 28, height: 28, borderRadius: 7, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Trash2 size={12} style={{ color: "#EF4444" }} />
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showAdd && <AddCompetitorModal onClose={() => setShowAdd(false)} onSubmit={handleAdd} />}
    </div>
  );
}
