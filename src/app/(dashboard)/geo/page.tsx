"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Topbar from "@/components/shared/Topbar";
import { useAuthStore } from "@/lib/stores/authStore";
import { visibilityApi, type GeoRecommendation } from "@/lib/api/visibility";
import { useTier } from "@/lib/hooks/useTier";
import LockedFeature from "@/components/shared/LockedFeature";
import {
  Sparkles, ChevronRight, TrendingUp, FileText, Code2,
  HelpCircle, Layers, Cpu, Zap, Target, Clock, AlertCircle, RefreshCw, ArrowRight,
} from "lucide-react";

type TypeConf = { icon: React.FC<{ size?: number; style?: React.CSSProperties }>; label: string; color: string };

const TYPE_CONFIG: Record<string, TypeConf> = {
  content_gap: { icon: FileText,   label: "Content Gap",       color: "#22B8CF" },
  entity:      { icon: Layers,     label: "Entity Opt.",       color: "#C9F31D" },
  schema:      { icon: Code2,      label: "Schema",            color: "#C084FC" },
  faq:         { icon: HelpCircle, label: "FAQ",               color: "#D97757" },
  topical:     { icon: TrendingUp, label: "Topical Authority", color: "#22C55E" },
  ai_friendly: { icon: Cpu,        label: "AI-Friendly",       color: "#10A37F" },
};
const typeConfFor = (t: string): TypeConf => TYPE_CONFIG[t] ?? { icon: Sparkles, label: "Optimization", color: "#C9F31D" };

const PRIORITY_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  high:   { color: "#EF4444", bg: "rgba(239,68,68,0.12)",  label: "High"   },
  medium: { color: "#F59E0B", bg: "rgba(245,158,11,0.12)", label: "Medium" },
  low:    { color: "#22C55E", bg: "rgba(34,197,94,0.12)",  label: "Low"    },
};

const card: React.CSSProperties = { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 };

export default function GEOPage() {
  const project   = useAuthStore((s) => s.project);
  const projectId = useAuthStore((s) => s.projectId);
  const { allows, resolved: tierResolved } = useTier();

  const [days, setDays]       = useState(30);
  const [recs, setRecs]       = useState<GeoRecommendation[]>([]);
  const [counts, setCounts]   = useState({ high: 0, medium: 0, low: 0 });
  const [hasData, setHasData] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!projectId) { setLoading(false); return; }
    setLoading(true); setError(null);
    try {
      const d = await visibilityApi.getGeo(projectId, days);
      setRecs(d.recommendations); setCounts(d.counts); setHasData(d.hasData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load recommendations");
    } finally {
      setLoading(false);
    }
  }, [projectId, days]);

  useEffect(() => { load(); }, [load]);

  const totalImpact = Math.round(recs.filter((r) => r.priority === "high").reduce((s, r) => s + r.impact, 0) / 10);
  const stats = [
    { label: "Total Opportunities", value: String(recs.length), color: "#C9F31D", icon: Sparkles },
    { label: "High Priority",       value: String(counts.high), color: "#EF4444", icon: Zap },
    { label: "Est. Score Boost",    value: `+${totalImpact}`,   color: "#22C55E", icon: Target },
    { label: "Quick Wins",          value: String(recs.filter((r) => r.effort <= 30).length), color: "#22B8CF", icon: Clock },
  ];

  if (tierResolved && !allows("geo")) {
    return <LockedFeature title="GEO Recommendations" feature="geo" subtitle={project ? `${project.name} · ${project.domain}` : undefined} />;
  }

  return (
    <div style={{ background: "#0E0F11", minHeight: "100vh" }}>
      <Topbar title="GEO Recommendations" subtitle={project ? `${project.name} · ${project.domain}` : "AI-generated optimization opportunities"} days={days} onDaysChange={setDays} />

      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>

        {!projectId && (
          <div style={{ ...card, padding: 40, textAlign: "center" }}>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", margin: 0 }}>Select or add a brand from the sidebar for GEO recommendations.</p>
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

            {!hasData && !loading && !error && (
              <div style={{ ...card, padding: 14, display: "flex", alignItems: "center", gap: 8, background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)" }}>
                <AlertCircle size={14} style={{ color: "#F59E0B" }} />
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", flex: 1 }}>
                  These are baseline recommendations — <Link href="/prompts" style={{ color: "#C9F31D", fontWeight: 600, textDecoration: "none" }}>run a campaign</Link> to tailor them to {project?.brandName}&apos;s real scores.
                </span>
              </div>
            )}

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              {stats.map(({ label, value, color, icon: Icon }) => (
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

            {/* Summary banner */}
            {!loading && recs.length > 0 && (
              <div style={{ borderRadius: 12, padding: "18px 22px", background: "rgba(201,243,29,0.05)", border: "1px solid rgba(201,243,29,0.22)", display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 42, height: 42, borderRadius: 11, flexShrink: 0, background: "rgba(201,243,29,0.14)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Sparkles size={19} style={{ color: "#C9F31D" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#fff", margin: "0 0 3px 0" }}>{recs.length} optimization opportunities found</p>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.52)", margin: 0 }}>
                    Implementing all high-priority items could increase your AI visibility score by an estimated <span style={{ color: "#C9F31D", fontWeight: 700 }}>+{totalImpact} points</span>
                  </p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {[{ count: counts.high, ...PRIORITY_CONFIG.high }, { count: counts.medium, ...PRIORITY_CONFIG.medium }, { count: counts.low, ...PRIORITY_CONFIG.low }].map((p) => (
                    <div key={p.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "8px 16px", borderRadius: 10, background: p.bg, minWidth: 56 }}>
                      <span style={{ fontSize: 20, fontWeight: 800, color: p.color, lineHeight: 1 }}>{p.count}</span>
                      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", marginTop: 3 }}>{p.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {loading ? (
              <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.4)", padding: "20px 0", textAlign: "center" }}>Loading recommendations…</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {recs.map((rec) => {
                  const tc = typeConfFor(rec.type);
                  const pc = PRIORITY_CONFIG[rec.priority];
                  const TypeIcon = tc.icon;
                  const isQuickWin = rec.effort <= 30;
                  return (
                    <div key={rec.id} style={{ ...card, padding: "20px 22px" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, marginTop: 1, background: `${tc.color}15`, border: `1px solid ${tc.color}28`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <TypeIcon size={17} style={{ color: tc.color }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                            <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{rec.title}</span>
                            <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: pc.bg, color: pc.color }}>{pc.label} Priority</span>
                            <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: `${tc.color}15`, color: tc.color }}>{tc.label}</span>
                            {isQuickWin && (
                              <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "rgba(34,184,207,0.12)", color: "#22B8CF", display: "flex", alignItems: "center", gap: 4 }}>
                                <Zap size={9} /> Quick Win
                              </span>
                            )}
                          </div>
                          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", margin: "0 0 14px 0", lineHeight: 1.6 }}>{rec.description}</p>
                          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            {rec.actionItems.map((item, i) => (
                              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                                <div style={{ width: 18, height: 18, borderRadius: 5, flexShrink: 0, marginTop: 1, background: `${tc.color}15`, border: `1px solid ${tc.color}25`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color: tc.color }}>{i + 1}</div>
                                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.68)", lineHeight: 1.5 }}>{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 14, flexShrink: 0 }}>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginBottom: 5 }}>Impact</div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{ width: 72, height: 5, borderRadius: 3, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                                <div style={{ height: "100%", borderRadius: 3, width: `${rec.impact}%`, background: "linear-gradient(90deg,#22C55E99,#22C55E)" }} />
                              </div>
                              <span style={{ fontSize: 12, fontWeight: 700, color: "#22C55E", minWidth: 22 }}>{rec.impact}</span>
                            </div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginBottom: 5 }}>Effort</div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{ width: 72, height: 5, borderRadius: 3, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                                <div style={{ height: "100%", borderRadius: 3, width: `${rec.effort}%`, background: rec.effort <= 30 ? "linear-gradient(90deg,#22B8CF99,#22B8CF)" : rec.effort <= 60 ? "linear-gradient(90deg,#F59E0B99,#F59E0B)" : "linear-gradient(90deg,#EF444499,#EF4444)" }} />
                              </div>
                              <span style={{ fontSize: 12, fontWeight: 700, minWidth: 22, color: rec.effort <= 30 ? "#22B8CF" : rec.effort <= 60 ? "#F59E0B" : "#EF4444" }}>{rec.effort}</span>
                            </div>
                          </div>
                          <ChevronRight size={14} style={{ color: "rgba(255,255,255,0.20)" }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
