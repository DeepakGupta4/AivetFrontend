"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Topbar from "@/components/shared/Topbar";
import { useAuthStore } from "@/lib/stores/authStore";
import { visibilityApi, type CitationsData } from "@/lib/api/visibility";
import { engineColors } from "@/lib/colors";
import { Link2, ExternalLink, Shield, Target, Globe, AlertCircle, RefreshCw, ArrowRight, Zap } from "lucide-react";

const LIME = "#C9F31D";
const card: React.CSSProperties = { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 };
const MODEL_LABEL: Record<string, string> = { chatgpt: "ChatGPT", gemini: "Gemini", claude: "Claude", perplexity: "Perplexity", google_ai_overview: "Google AI" };

// Real domain authority (0-100) from DataForSEO Labs organic-traffic estimate.
function authorityBand(a: number) {
  if (a >= 70) return { label: "High", color: "#22C55E" };
  if (a >= 45) return { label: "Good", color: "#C9F31D" };
  if (a >= 20) return { label: "Medium", color: "#F59E0B" };
  return { label: "Low", color: "#EF4444" };
}

export default function CitationsPage() {
  const project   = useAuthStore((s) => s.project);
  const projectId = useAuthStore((s) => s.projectId);

  const [days, setDays]       = useState(30);
  const [data, setData]       = useState<CitationsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!projectId) { setLoading(false); return; }
    setLoading(true); setError(null);
    try {
      setData(await visibilityApi.getCitations(projectId, days));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load citations");
    } finally {
      setLoading(false);
    }
  }, [projectId, days]);

  useEffect(() => { load(); }, [load]);

  // Brand metrics are the real signal (hero); Total/Unique are context for them.
  const stats = [
    { label: "Brand Citations", value: data?.brandCitations ?? 0, icon: Shield, color: "#22C55E", primary: true,
      hint: "Times AI cited your site",
      tip: "How many times AI engines linked your own domain as a source. This is the metric that reflects YOUR visibility." },
    { label: "Brand Share", value: `${data?.brandShare ?? 0}%`, icon: Target, color: "#C084FC", primary: true,
      hint: "Your share of all citations",
      tip: "Your domain's citations as a % of every citation AI gave for your topics (Brand ÷ Total)." },
    { label: "Total Citations", value: data?.totalCitations ?? 0, icon: Link2, color: LIME, primary: false,
      hint: "All sources AI cited · context",
      tip: "Every source link AI gave across all your tracked answers in this period (repeats included). It's the denominator for Brand Share — context, not a brand score." },
    { label: "Unique Domains", value: data?.uniqueDomains ?? 0, icon: Globe, color: "#22B8CF", primary: false,
      hint: "Distinct domains cited",
      tip: "Number of different websites AI cited across your tracked answers." },
  ];

  const sources = data?.sources ?? [];
  const opportunities = data?.opportunities ?? [];
  const empty = !!projectId && !loading && !error && sources.length === 0;

  return (
    <div style={{ background: "#0E0F11", minHeight: "100vh" }}>
      <Topbar title="Citations" subtitle={project ? `${project.name} · ${project.domain}` : "Sources AI engines cite for your topics"} days={days} onDaysChange={setDays} />

      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>

        {!projectId && (
          <div style={{ ...card, padding: 40, textAlign: "center" }}>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", margin: 0 }}>Select or add a brand from the sidebar to view citations.</p>
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

            {/* Stats — Brand metrics (hero) first, then context */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              {stats.map(({ label, value, icon: Icon, color, hint, tip, primary }) => (
                <div
                  key={label}
                  title={tip}
                  style={{
                    ...card,
                    padding: "16px 18px", display: "flex", alignItems: "flex-start", gap: 13, cursor: "help",
                    background: primary ? `${color}0D` : "rgba(255,255,255,0.03)",
                    border: primary ? `1px solid ${color}33` : "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <div style={{ width: 38, height: 38, borderRadius: 10, flexShrink: 0, background: `${color}15`, border: `1px solid ${color}25`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={16} style={{ color }} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 22, fontWeight: 800, color: "#fff", lineHeight: 1, letterSpacing: "-0.5px" }}>{loading ? "—" : value}</span>
                      {primary && <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.06em", padding: "2px 5px", borderRadius: 4, background: `${color}22`, color, textTransform: "uppercase" }}>Key</span>}
                    </div>
                    <div style={{ fontSize: 11.5, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginTop: 5 }}>{label}</div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{hint}</div>
                  </div>
                </div>
              ))}
            </div>

            {empty ? (
              <div style={{ ...card, padding: 48, textAlign: "center" }}>
                <Zap size={28} style={{ color: LIME, opacity: 0.8 }} />
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", margin: "14px 0 6px", fontWeight: 600 }}>No citations captured yet</p>
                <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.45)", margin: "0 0 16px" }}>Run a prompt campaign — citations come from engines like Perplexity & Google AI that cite sources.</p>
                <Link href="/prompts" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 8, background: LIME, color: "#000", fontSize: 12.5, fontWeight: 600, textDecoration: "none" }}>
                  Go to Campaigns <ArrowRight size={13} />
                </Link>
              </div>
            ) : (
              <>
                {/* Sources table */}
                <div style={{ ...card, overflow: "hidden" }}>
                  <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                    <h3 style={{ fontSize: 13, fontWeight: 700, color: "#fff", margin: 0 }}>Citation Sources</h3>
                  </div>
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                          {["Domain", "Type", "Authority", "Citations", "Cited by"].map((h) => (
                            <th key={h} style={{ padding: "9px 20px", textAlign: "left", fontSize: 10, fontWeight: 700, letterSpacing: "0.06em", color: "rgba(255,255,255,0.28)", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {sources.map((s, i) => {
                          const ab = authorityBand(s.authority);
                          return (
                            <tr key={s.domain} style={{ borderBottom: i < sources.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", background: s.isBrand ? "rgba(201,243,29,0.03)" : "transparent" }}>
                              <td style={{ padding: "13px 20px", whiteSpace: "nowrap" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                                  <span style={{ fontSize: 13, fontWeight: 600, color: s.isBrand ? LIME : "#fff" }}>{s.domain}</span>
                                  <ExternalLink size={11} style={{ color: "rgba(255,255,255,0.3)" }} />
                                </div>
                              </td>
                              <td style={{ padding: "13px 20px" }}>
                                <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 20, background: s.isBrand ? "rgba(201,243,29,0.12)" : "rgba(255,255,255,0.06)", color: s.isBrand ? LIME : "rgba(255,255,255,0.5)" }}>
                                  {s.isBrand ? "Your domain" : "External"}
                                </span>
                              </td>
                              <td style={{ padding: "13px 20px", whiteSpace: "nowrap" }}>
                                {s.authority > 0 ? (
                                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <div style={{ width: 44, height: 5, borderRadius: 3, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                                      <div style={{ height: "100%", borderRadius: 3, width: `${s.authority}%`, background: ab.color }} />
                                    </div>
                                    <span style={{ fontSize: 12, fontWeight: 600, color: ab.color }}>{s.authority}</span>
                                  </div>
                                ) : (
                                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)" }}>—</span>
                                )}
                              </td>
                              <td style={{ padding: "13px 20px", fontSize: 13, fontWeight: 700, color: "#fff" }}>{s.count}</td>
                              <td style={{ padding: "13px 20px" }}>
                                <div style={{ display: "flex", gap: 4 }}>
                                  {s.models.map((m) => (
                                    <span key={m} title={MODEL_LABEL[m] ?? m} style={{ width: 18, height: 18, borderRadius: 5, fontSize: 8, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", background: `${engineColors[m] ?? "#888"}22`, color: engineColors[m] ?? "#aaa" }}>
                                      {m.slice(0, 2).toUpperCase()}
                                    </span>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Opportunities */}
                {opportunities.length > 0 && (
                  <div style={{ ...card, padding: 20 }}>
                    <h3 style={{ fontSize: 13, fontWeight: 600, color: "#fff", margin: "0 0 4px" }}>Citation Opportunities</h3>
                    <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: "0 0 14px" }}>
                      High-frequency sources AI cites for your topics — get featured on these to boost authority.
                    </p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
                      {opportunities.map((o) => (
                        <div key={o.domain} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                          <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(245,158,11,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <Target size={15} style={{ color: "#F59E0B" }} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 13, fontWeight: 600, color: "#fff", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.domain}</p>
                            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", margin: "2px 0 0" }}>cited {o.count}×{o.authority > 0 ? ` · authority ${o.authority}` : ""}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
