"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Topbar from "@/components/shared/Topbar";
import ScoreGauge from "@/components/charts/ScoreGauge";
import TrendChart from "@/components/charts/TrendChart";
import { useAuthStore } from "@/lib/stores/authStore";
import { visibilityApi, type ModelBreakdownDTO } from "@/lib/api/visibility";
import { engineColors, getScoreBand } from "@/lib/colors";
import { TrendingUp, TrendingDown, MessageSquare, Hash, Smile, Link2, AlertCircle, RefreshCw, Zap, ArrowRight } from "lucide-react";
import type { TrendPoint } from "@/types";

// ── Brand logos ─────────────────────────────────────────────────────────────
function ChatGPTLogo({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 41 41" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M37.532 16.87a9.963 9.963 0 0 0-.856-8.184 10.078 10.078 0 0 0-10.855-4.835 9.964 9.964 0 0 0-6.212-2.71 10.079 10.079 0 0 0-9.49 6.963 9.967 9.967 0 0 0-6.188 4.83 10.079 10.079 0 0 0 1.24 11.817 9.965 9.965 0 0 0 .856 8.185 10.079 10.079 0 0 0 10.855 4.835 9.965 9.965 0 0 0 6.212 2.71 10.079 10.079 0 0 0 9.49-6.963 9.967 9.967 0 0 0 6.188-4.832 10.079 10.079 0 0 0-1.24-11.816zm-17.223 24.09a7.474 7.474 0 0 1-4.801-1.735c.061-.033.168-.091.237-.134l7.964-4.6a1.294 1.294 0 0 0 .655-1.134V19.054l3.366 1.944a.12.12 0 0 1 .066.092v9.299a7.505 7.505 0 0 1-7.487 7.57zm-16.124-6.908a7.471 7.471 0 0 1-.894-5.023c.06.036.162.099.237.141l7.964 4.6a1.297 1.297 0 0 0 1.308 0l9.724-5.614v3.888a.12.12 0 0 1-.048.103l-8.051 4.649a7.504 7.504 0 0 1-10.24-2.744zm-2.09-17.496a7.47 7.47 0 0 1 3.908-3.285c0 .068-.004.19-.004.274v9.201a1.294 1.294 0 0 0 .654 1.132l9.723 5.614-3.366 1.944a.12.12 0 0 1-.114.012L8.048 25.444a7.504 7.504 0 0 1-5.953-8.884zm27.651 6.437l-9.724-5.615 3.367-1.943a.121.121 0 0 1 .114-.012l8.048 4.648a7.498 7.498 0 0 1-1.158 13.528v-9.476a1.293 1.293 0 0 0-.647-1.13zm3.35-5.043c-.059-.037-.162-.099-.236-.141l-7.965-4.6a1.298 1.298 0 0 0-1.308 0l-9.723 5.614v-3.888a.12.12 0 0 1 .048-.103l8.05-4.645a7.497 7.497 0 0 1 11.135 7.763zm-21.063 6.929l-3.367-1.944a.12.12 0 0 1-.065-.092v-9.299a7.497 7.497 0 0 1 12.293-5.756 6.94 6.94 0 0 0-.236.134l-7.965 4.6a1.294 1.294 0 0 0-.654 1.132l-.006 11.225zm1.829-3.943l4.33-2.501 4.332 2.5v4.999l-4.331 2.5-4.331-2.5V21z" fill="#10A37F" />
    </svg>
  );
}
function GeminiLogo({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 28C14 26.0633 13.6267 24.2433 12.88 22.54C12.1567 20.8367 11.165 19.355 9.905 18.095C8.645 16.835 7.16333 15.8433 5.46 15.12C3.75667 14.3733 1.93667 14 0 14C1.93667 14 3.75667 13.6383 5.46 12.915C7.16333 12.1683 8.645 11.165 9.905 9.905C11.165 8.645 12.1567 7.16333 12.88 5.46C13.6267 3.75667 14 1.93667 14 0C14 1.93667 14.3617 3.75667 15.085 5.46C15.8317 7.16333 16.835 8.645 18.095 9.905C19.355 11.165 20.8367 12.1683 22.54 12.915C24.2433 13.6383 26.0633 14 28 14C26.0633 14 24.2433 14.3733 22.54 15.12C20.8367 15.8433 19.355 16.835 18.095 18.095C16.835 19.355 15.8317 20.8367 15.085 22.54C14.3617 24.2433 14 26.0633 14 28Z" fill="#1A73E8" />
    </svg>
  );
}
function ClaudeLogo({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13.827 3.52h3.603l-7.376 16.96H6.45l7.377-16.96z" fill="#D97757" />
      <path d="M6.288 3.52h3.604L2.515 20.48H.001L6.288 3.52zM17.047 13.952h3.476l-1.738-4.656-1.738 4.656zM14.123 20.48l1.06-2.832h5.534l1.06 2.832H24L18.785 7.04h-2.952L10.618 20.48h3.505z" fill="#D97757" />
    </svg>
  );
}
function PerplexityLogo({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 .5L7.5 5H4v4.5L.5 12 4 15.5V20h3.5l4.5 4.5 4.5-4.5H20v-4.5l3.5-3.5L20 9.5V5h-3.5L12 .5z" fill="none" stroke="#22B8CF" strokeWidth="1.2" />
      <path d="M8.5 8.5h7v7h-7z" fill="none" stroke="#22B8CF" strokeWidth="1.2" />
      <path d="M12 5v14M5 12h14" stroke="#22B8CF" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

const MODEL_LOGO_MAP: Record<string, React.FC<{ size?: number }>> = {
  chatgpt: ChatGPTLogo, gemini: GeminiLogo, claude: ClaudeLogo, perplexity: PerplexityLogo,
};
const MODEL_LABELS: Record<string, string> = {
  chatgpt: "ChatGPT", gemini: "Gemini", claude: "Claude", perplexity: "Perplexity",
  google_ai_overview: "Google AI", "google-ai": "Google AI",
};
const labelFor = (m: string) => MODEL_LABELS[m] ?? m.charAt(0).toUpperCase() + m.slice(1);

const SENTIMENT_COLORS: Record<string, string> = { positive: "#22C55E", neutral: "#F59E0B", negative: "#EF4444", mixed: "#C084FC" };
const TABLE_HEADERS = ["Model", "Mention Freq.", "Ranking", "Sentiment", "Citations", "Overall"];
const card: React.CSSProperties = { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 };

function fmtDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ── Demo fallback (no project connected) ────────────────────────────────────
const MOCK_MODELS: ModelBreakdownDTO[] = [
  { model: "claude",     score: 82, mentions: 48, change: 11, sentiment: "positive", topPrompt: "Project management tools", factors: { mention: 85, ranking: 80, sentiment: 90, citation: 70 } },
  { model: "chatgpt",    score: 78, mentions: 42, change: 6,  sentiment: "positive", topPrompt: "Best CRM for startups",     factors: { mention: 80, ranking: 74, sentiment: 88, citation: 62 } },
  { model: "perplexity", score: 71, mentions: 36, change: 4,  sentiment: "positive", topPrompt: "SaaS tools comparison",     factors: { mention: 74, ranking: 68, sentiment: 78, citation: 55 } },
  { model: "gemini",     score: 65, mentions: 31, change: -2, sentiment: "neutral",  topPrompt: "Enterprise software",       factors: { mention: 60, ranking: 58, sentiment: 72, citation: 48 } },
];
const MOCK_TREND: TrendPoint[] = [
  { date: "Jun 1", score: 42, mentions: 18 }, { date: "Jun 8", score: 51, mentions: 24 },
  { date: "Jun 15", score: 58, mentions: 31 }, { date: "Jun 22", score: 65, mentions: 39 }, { date: "Jun 30", score: 72, mentions: 49 },
];

// ── Component ────────────────────────────────────────────────────────────────
export default function VisibilityPage() {
  const project   = useAuthStore((s) => s.project);
  const projectId = useAuthStore((s) => s.projectId);

  const [days, setDays]       = useState(30);
  const [data, setData]       = useState<Awaited<ReturnType<typeof visibilityApi.getVisibility>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [tick, setTick]       = useState(0);

  useEffect(() => {
    if (!projectId) { setLoading(false); return; }
    let cancelled = false;
    setLoading(true); setError(null);
    visibilityApi.getVisibility(projectId, days)
      .then((d) => { if (!cancelled) setData(d); })
      .catch((e: Error) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [projectId, days, tick]);

  const isDemo = !projectId;
  const score = data ? data.currentScore : (isDemo ? 72 : 0);
  const scoreChange = data ? data.scoreChange : (isDemo ? 8.4 : 0);
  const trend: TrendPoint[] = data?.trend.length
    ? data.trend.map((t) => ({ date: fmtDate(t.scoreDate), score: t.overallScore, mentions: t.totalMentions }))
    : (isDemo ? MOCK_TREND : []);
  const models: ModelBreakdownDTO[] = data?.models.length ? data.models : (isDemo ? MOCK_MODELS : []);
  const subtitle = project ? `${project.name} · ${project.domain}` : "Per-model breakdown and trend analysis";
  const empty = !!projectId && !loading && !error && models.length === 0;

  return (
    <div style={{ background: "#0E0F11", minHeight: "100vh" }}>
      <Topbar title="AI Visibility" subtitle={subtitle} days={days} onDaysChange={setDays} />

      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>

        {error && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "rgba(255,255,255,0.65)" }}>
              <AlertCircle size={14} style={{ color: "#EF4444" }} /> {error}
            </span>
            <button onClick={() => setTick((t) => t + 1)} style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 7, border: "none", cursor: "pointer", background: "rgba(239,68,68,0.12)", color: "#EF4444", fontSize: 11, fontWeight: 600 }}>
              <RefreshCw size={11} /> Retry
            </button>
          </div>
        )}

        {empty ? (
          <div style={{ ...card, padding: 48, textAlign: "center" }}>
            <Zap size={28} style={{ color: "#C9F31D", opacity: 0.8 }} />
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", margin: "14px 0 6px", fontWeight: 600 }}>No visibility data yet</p>
            <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.45)", margin: "0 0 16px" }}>Run a prompt campaign for {project?.brandName} to start measuring per-model visibility.</p>
            <Link href="/prompts" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 8, background: "#C9F31D", color: "#000", fontSize: 12.5, fontWeight: 600, textDecoration: "none" }}>
              Go to Campaigns <ArrowRight size={13} />
            </Link>
          </div>
        ) : (
          <>
            {/* ROW 1: Overall Score + Trend */}
            <div style={{ display: "flex", gap: 16, alignItems: "stretch" }}>
              <div style={{ ...card, width: 240, flexShrink: 0, padding: 24, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", margin: 0 }}>Overall Score</p>
                <ScoreGauge score={Math.round(score)} size={180} />
                <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "rgba(255,255,255,0.50)" }}>
                  {scoreChange >= 0 ? <TrendingUp size={12} style={{ color: "#22C55E" }} /> : <TrendingDown size={12} style={{ color: "#EF4444" }} />}
                  <span style={{ color: scoreChange >= 0 ? "#22C55E" : "#EF4444", fontWeight: 600 }}>{scoreChange >= 0 ? "+" : ""}{scoreChange.toFixed(1)} pts</span>
                  <span>this period</span>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <TrendChart data={trend} />
              </div>
            </div>

            {/* ROW 2: Per-Model Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 16 }}>
              {models.map((m) => {
                const band = getScoreBand(m.score);
                const color = engineColors[m.model] ?? "#888";
                const isUp = m.change >= 0;
                const Logo = MODEL_LOGO_MAP[m.model];
                return (
                  <div key={m.model} style={{ ...card, padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 9, background: `${color}15`, border: `1px solid ${color}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {Logo ? <Logo size={18} /> : <span style={{ fontSize: 11, fontWeight: 700, color }}>{labelFor(m.model).slice(0, 2)}</span>}
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{labelFor(m.model)}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 20, background: isUp ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)", color: isUp ? "#22C55E" : "#EF4444" }}>
                        {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}{isUp ? "+" : ""}{m.change}
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <span style={{ fontSize: 40, fontWeight: 800, lineHeight: 1, color: band.color, fontVariantNumeric: "tabular-nums", letterSpacing: "-1px" }}>{m.score}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.05em", padding: "3px 8px", borderRadius: 20, background: band.bg, color: band.color, alignSelf: "flex-start" }}>{band.label}</span>
                    </div>

                    <div style={{ height: 5, borderRadius: 3, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: 3, width: `${m.score}%`, background: `linear-gradient(90deg, ${color}88, ${color})`, transition: "width 0.8s ease" }} />
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.50)" }}>
                        <span style={{ color: "#fff", fontWeight: 600 }}>{m.mentions}</span> mentions
                      </span>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 20, background: `${SENTIMENT_COLORS[m.sentiment] ?? "#888"}15`, color: SENTIMENT_COLORS[m.sentiment] ?? "#888", textTransform: "capitalize" }}>{m.sentiment}</span>
                    </div>

                    <div style={{ paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                      <p style={{ fontSize: 10, color: "rgba(255,255,255,0.28)", margin: "0 0 4px 0" }}>Top prompt</p>
                      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.topPrompt ?? "—"}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ROW 3: Factor Breakdown Table */}
            <div style={{ ...card, overflow: "hidden" }}>
              <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                <h3 style={{ fontSize: 13, fontWeight: 600, color: "#fff", margin: 0 }}>Score Factor Breakdown by Model</h3>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  {[
                    { icon: MessageSquare, label: "Mention Freq.", color: "#C9F31D" },
                    { icon: Hash, label: "Ranking", color: "#22B8CF" },
                    { icon: Smile, label: "Sentiment", color: "#22C55E" },
                    { icon: Link2, label: "Citations", color: "#D97757" },
                  ].map(({ icon: Icon, label, color }) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "rgba(255,255,255,0.40)" }}>
                      <Icon size={11} style={{ color }} />{label}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      {TABLE_HEADERS.map((h) => (
                        <th key={h} style={{ padding: "10px 20px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.35)", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {models.map((m, i) => {
                      const color = engineColors[m.model] ?? "#888";
                      const band = getScoreBand(m.score);
                      const Logo = MODEL_LOGO_MAP[m.model];
                      const factorValues = [m.factors.mention, m.factors.ranking, m.factors.sentiment, m.factors.citation];
                      return (
                        <tr key={m.model} style={{ borderBottom: i < models.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none", background: i % 2 !== 0 ? "rgba(255,255,255,0.01)" : "transparent" }}>
                          <td style={{ padding: "14px 20px", whiteSpace: "nowrap" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}15`, border: `1px solid ${color}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                {Logo ? <Logo size={16} /> : <span style={{ fontSize: 10, fontWeight: 700, color }}>{labelFor(m.model).slice(0, 2)}</span>}
                              </div>
                              <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{labelFor(m.model)}</span>
                            </div>
                          </td>
                          {factorValues.map((f, fi) => {
                            const fb = getScoreBand(f);
                            return (
                              <td key={fi} style={{ padding: "14px 20px", whiteSpace: "nowrap" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  <div style={{ width: 64, height: 5, borderRadius: 3, background: "rgba(255,255,255,0.08)", overflow: "hidden", flexShrink: 0 }}>
                                    <div style={{ height: "100%", borderRadius: 3, width: `${f}%`, background: fb.color }} />
                                  </div>
                                  <span style={{ fontSize: 12, fontWeight: 600, color: fb.color, fontVariantNumeric: "tabular-nums", minWidth: 24 }}>{f}</span>
                                </div>
                              </td>
                            );
                          })}
                          <td style={{ padding: "14px 20px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span style={{ fontSize: 16, fontWeight: 700, color: band.color, fontVariantNumeric: "tabular-nums" }}>{m.score}</span>
                              <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 20, background: band.bg, color: band.color, letterSpacing: "0.04em" }}>{band.label}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
