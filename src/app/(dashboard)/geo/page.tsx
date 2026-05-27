"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Topbar from "@/components/shared/Topbar";
import { useAuthStore } from "@/lib/stores/authStore";
import { visibilityApi, type GeoRecommendation } from "@/lib/api/visibility";
import { useTier } from "@/lib/hooks/useTier";
import LockedFeature from "@/components/shared/LockedFeature";
import {
  Sparkles, TrendingUp, FileText, Code2,
  HelpCircle, Layers, Cpu, Zap, Clock, AlertCircle, RefreshCw, CheckCircle2,
} from "lucide-react";

const LIME = "#C9F31D";
const card: React.CSSProperties = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 12,
};

// Friendly category labels — no jargon. "Schema" → "Code tags for AI",
// "Entity Opt." → "Brand mentions", etc. The icons stay the same.
type TypeConf = { icon: React.FC<{ size?: number; style?: React.CSSProperties }>; label: string; color: string; help: string };
const TYPE_CONFIG: Record<string, TypeConf> = {
  content_gap: { icon: FileText,   label: "Missing content",     color: "#22B8CF", help: "Topics your competitors cover but you don't" },
  entity:      { icon: Layers,     label: "Brand mentions",      color: LIME,      help: "Make AI clearly link your brand to your products and topics" },
  schema:      { icon: Code2,      label: "Code tags for AI",    color: "#C084FC", help: "Structured data that helps AI understand your pages" },
  faq:         { icon: HelpCircle, label: "Q&A pages",           color: "#D97757", help: "FAQ sections AI loves to quote from" },
  topical:     { icon: TrendingUp, label: "Topic coverage",      color: "#22C55E", help: "Build a fuller library on your core topics" },
  ai_friendly: { icon: Cpu,        label: "AI accessibility",    color: "#10A37F", help: "Let AI crawlers (GPTBot, ClaudeBot) read your pages" },
};
const typeConfFor = (t: string): TypeConf => TYPE_CONFIG[t] ?? { icon: Sparkles, label: "Optimization", color: LIME, help: "" };

const PRIORITY_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  high:   { color: "#EF4444", bg: "rgba(239,68,68,0.12)",  label: "Do first"    },
  medium: { color: "#F59E0B", bg: "rgba(245,158,11,0.12)", label: "Do soon"     },
  low:    { color: "#22C55E", bg: "rgba(34,197,94,0.12)",  label: "Nice to do"  },
};

// 0-100 numbers → plain-language labels users actually understand.
function impactLabel(n: number) {
  if (n >= 70) return { text: "Big boost", color: "#22C55E" };
  if (n >= 40) return { text: "Medium boost", color: "#C9F31D" };
  return { text: "Small boost", color: "#22B8CF" };
}
function effortLabel(n: number) {
  if (n <= 30) return { text: "Easy", sub: "under an hour", color: "#22B8CF" };
  if (n <= 60) return { text: "Medium", sub: "a few hours", color: "#F59E0B" };
  return { text: "Hard", sub: "a day or more", color: "#EF4444" };
}

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

  if (tierResolved && !allows("geo")) {
    return <LockedFeature title="Visibility Recommendations" feature="geo" subtitle={project ? `${project.name} · ${project.domain}` : undefined} />;
  }

  // Sort: high-priority quick wins → high-priority → medium → low
  const sortedRecs = [...recs].sort((a, b) => {
    const pri = { high: 0, medium: 1, low: 2 } as Record<string, number>;
    if (pri[a.priority] !== pri[b.priority]) return pri[a.priority] - pri[b.priority];
    // within same priority: easier effort first
    return a.effort - b.effort;
  });
  const doFirst = sortedRecs.filter((r) => r.priority === "high" && r.effort <= 50).slice(0, 3);
  const totalImpact = Math.round(recs.filter((r) => r.priority === "high").reduce((s, r) => s + r.impact, 0) / 10);

  return (
    <div style={{ background: "#0E0F11", minHeight: "100vh" }}>
      <Topbar title="Visibility Recommendations" subtitle={project ? `${project.name} · ${project.domain}` : "What to fix to get cited by AI more often"} days={days} onDaysChange={setDays} />

      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>

        {!projectId && (
          <div style={{ ...card, padding: 40, textAlign: "center" }}>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", margin: 0 }}>Select or add a brand from the sidebar to see recommendations.</p>
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

            {/* 1. Plain-language explainer */}
            <div style={{ ...card, padding: "18px 22px", display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: `${LIME}18`, border: `1px solid ${LIME}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <HelpCircle size={18} style={{ color: LIME }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#fff", margin: "0 0 4px" }}>
                  What are these recommendations?
                </p>
                <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.65)", margin: 0, lineHeight: 1.55 }}>
                  These are specific things you can fix on your website so AI engines (ChatGPT, Gemini, Claude, Perplexity) mention you more often when users ask about your industry. Each card tells you <strong style={{ color: "#fff" }}>what to change</strong>, <strong style={{ color: "#fff" }}>why it helps</strong>, and <strong style={{ color: "#fff" }}>how hard it is</strong>.
                </p>
              </div>
            </div>

            {!hasData && !loading && !error && (
              <div style={{ ...card, padding: "14px 18px", display: "flex", alignItems: "center", gap: 10, background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)" }}>
                <AlertCircle size={14} style={{ color: "#F59E0B", flexShrink: 0 }} />
                <span style={{ fontSize: 12.5, color: "rgba(255,255,255,0.65)", flex: 1, lineHeight: 1.45 }}>
                  These are general starter recommendations. <Link href="/prompts" style={{ color: LIME, fontWeight: 600, textDecoration: "none" }}>Run an audit</Link> to get advice tailored to {project?.brandName ?? "your brand"}.
                </span>
              </div>
            )}

            {/* 2. Hero summary — plain English headline */}
            {!loading && recs.length > 0 && (
              <div style={{ ...card, padding: "22px 26px", borderColor: `${LIME}33`, background: `${LIME}06` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 11, background: `${LIME}18`, border: `1px solid ${LIME}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Sparkles size={20} style={{ color: LIME }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 16, fontWeight: 700, color: "#fff", margin: "0 0 3px" }}>
                      We found <span style={{ color: LIME }}>{recs.length} {recs.length === 1 ? "thing" : "things"}</span> you can fix
                    </p>
                    <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.55)", margin: 0 }}>
                      Doing all the high-priority ones could lift your AI visibility score by <strong style={{ color: LIME }}>~{totalImpact} points</strong>.
                    </p>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                  <SummaryPill count={counts.high}   label="Do first"    color="#EF4444" />
                  <SummaryPill count={counts.medium} label="Do soon"     color="#F59E0B" />
                  <SummaryPill count={counts.low}    label="Nice to do"  color="#22C55E" />
                </div>
              </div>
            )}

            {/* 3. "Do these first" — top 3 high-impact, easy-effort items */}
            {!loading && doFirst.length > 0 && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <Zap size={15} style={{ color: "#EF4444" }} />
                  <h3 style={{ fontSize: 13.5, fontWeight: 700, color: "#fff", margin: 0 }}>Start with these</h3>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.40)" }}>— biggest impact for the least effort</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
                  {doFirst.map((rec) => {
                    const tc = typeConfFor(rec.type);
                    const TypeIcon = tc.icon;
                    return (
                      <div key={rec.id} style={{ ...card, padding: "14px 16px", borderColor: "rgba(239,68,68,0.25)", background: "rgba(239,68,68,0.04)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 6 }}>
                          <div style={{ width: 26, height: 26, borderRadius: 7, background: `${tc.color}18`, border: `1px solid ${tc.color}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <TypeIcon size={13} style={{ color: tc.color }} />
                          </div>
                          <span style={{ fontSize: 10, fontWeight: 700, color: tc.color, textTransform: "uppercase", letterSpacing: "0.05em" }}>{tc.label}</span>
                        </div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#fff", margin: "0 0 6px", lineHeight: 1.35 }}>{rec.title}</p>
                        <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.55)", margin: 0, lineHeight: 1.5 }}>
                          {rec.description.length > 90 ? rec.description.slice(0, 90) + "…" : rec.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 4. Full recommendation list */}
            {loading ? (
              <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.4)", padding: "20px 0", textAlign: "center" }}>Loading recommendations…</p>
            ) : sortedRecs.length === 0 ? (
              <div style={{ ...card, padding: 48, textAlign: "center" }}>
                <CheckCircle2 size={28} style={{ color: "#22C55E" }} />
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", margin: "14px 0 6px", fontWeight: 600 }}>You're all set</p>
                <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.45)", margin: 0 }}>No optimization opportunities right now. Run another audit later to refresh.</p>
              </div>
            ) : (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, marginTop: 6 }}>
                  <h3 style={{ fontSize: 13.5, fontWeight: 700, color: "#fff", margin: 0 }}>Everything to fix</h3>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.40)" }}>— ordered by priority</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {sortedRecs.map((rec) => {
                    const tc = typeConfFor(rec.type);
                    const pc = PRIORITY_CONFIG[rec.priority];
                    const TypeIcon = tc.icon;
                    const impact = impactLabel(rec.impact);
                    const effort = effortLabel(rec.effort);
                    const isQuickWin = rec.effort <= 30;
                    return (
                      <div key={rec.id} style={{ ...card, padding: "20px 22px" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                          <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0, marginTop: 1, background: `${tc.color}15`, border: `1px solid ${tc.color}28`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <TypeIcon size={17} style={{ color: tc.color }} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            {/* Title + badges */}
                            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                              <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{rec.title}</span>
                              <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: pc.bg, color: pc.color }}>{pc.label}</span>
                              <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: `${tc.color}15`, color: tc.color }}>{tc.label}</span>
                              {isQuickWin && (
                                <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "rgba(34,184,207,0.12)", color: "#22B8CF", display: "flex", alignItems: "center", gap: 4 }}>
                                  <Zap size={9} /> Quick win
                                </span>
                              )}
                            </div>

                            {/* Description */}
                            <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.60)", margin: "0 0 10px 0", lineHeight: 1.55 }}>{rec.description}</p>

                            {/* Why this helps */}
                            {tc.help && (
                              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12, padding: "7px 11px", borderRadius: 7, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                                <span style={{ fontSize: 10, fontWeight: 700, color: tc.color, textTransform: "uppercase", letterSpacing: "0.05em" }}>Why this helps:</span>
                                <span style={{ fontSize: 11.5, color: "rgba(255,255,255,0.65)" }}>{tc.help}</span>
                              </div>
                            )}

                            {/* Action items */}
                            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", color: "rgba(255,255,255,0.40)", textTransform: "uppercase", margin: "0 0 8px" }}>
                              How to do it
                            </p>
                            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                              {rec.actionItems.map((item, i) => (
                                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                                  <div style={{ width: 18, height: 18, borderRadius: 5, flexShrink: 0, marginTop: 1, background: `${tc.color}15`, border: `1px solid ${tc.color}25`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color: tc.color }}>{i + 1}</div>
                                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.72)", lineHeight: 1.5 }}>{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Right side: friendly impact/effort pills */}
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0, width: 110 }}>
                            <div style={{ width: "100%", padding: "9px 11px", borderRadius: 9, background: `${impact.color}10`, border: `1px solid ${impact.color}28`, textAlign: "center" }}>
                              <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>Result</div>
                              <div style={{ fontSize: 12, fontWeight: 700, color: impact.color }}>{impact.text}</div>
                            </div>
                            <div style={{ width: "100%", padding: "9px 11px", borderRadius: 9, background: `${effort.color}10`, border: `1px solid ${effort.color}28`, textAlign: "center" }}>
                              <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                                <Clock size={9} /> Effort
                              </div>
                              <div style={{ fontSize: 12, fontWeight: 700, color: effort.color }}>{effort.text}</div>
                              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>{effort.sub}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function SummaryPill({ count, label, color }: { count: number; label: string; color: string }) {
  return (
    <div style={{ padding: "12px 14px", borderRadius: 10, background: `${color}10`, border: `1px solid ${color}22`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.70)" }}>{label}</span>
      <span style={{ fontSize: 22, fontWeight: 800, color, lineHeight: 1 }}>{count}</span>
    </div>
  );
}
