"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Topbar from "@/components/shared/Topbar";
import RunAuditModal from "@/components/shared/RunAuditModal";
import VisibilityBoostGuide from "@/components/shared/VisibilityBoostGuide";
import KPICard from "@/components/dashboard/KPICard";
import ScoreGauge from "@/components/charts/ScoreGauge";
import TrendChart from "@/components/charts/TrendChart";
import ModelDistributionChart from "@/components/charts/ModelDistributionChart";
import CompetitorChart from "@/components/charts/CompetitorChart";
import { useDashboard } from "@/lib/hooks/useDashboard";
import { useAuthStore } from "@/lib/stores/authStore";
import {
  Eye, Zap, MessageSquare, Link2, Users2, Bot,
  TrendingUp, ArrowRight, CheckCircle2, AlertCircle, RefreshCw, Sparkles,
} from "lucide-react";
import { engineColors, getScoreBand } from "@/lib/colors";
import type { ModelDistribution, CompetitorShare, TrendPoint } from "@/types";

// ── Fallback mock data (shown only when no project is connected) ────────────

const MOCK_TREND: TrendPoint[] = [
  { date: "Jun 1",  score: 42, mentions: 18 },
  { date: "Jun 5",  score: 48, mentions: 22 },
  { date: "Jun 10", score: 51, mentions: 27 },
  { date: "Jun 15", score: 58, mentions: 31 },
  { date: "Jun 20", score: 63, mentions: 38 },
  { date: "Jun 25", score: 67, mentions: 42 },
  { date: "Jun 30", score: 72, mentions: 49 },
];

const MOCK_MODELS: ModelDistribution[] = [
  { model: "chatgpt",    score: 78, mentions: 42, color: engineColors.chatgpt    },
  { model: "gemini",     score: 65, mentions: 31, color: engineColors.gemini     },
  { model: "claude",     score: 82, mentions: 48, color: engineColors.claude     },
  { model: "perplexity", score: 71, mentions: 36, color: engineColors.perplexity },
];

const MOCK_COMPETITORS: CompetitorShare[] = [
  { brand: "Acme Corp",  score: 72, color: "#C9F31D" },
  { brand: "RivalCo",    score: 85, color: "#22C55E" },
  { brand: "TechBrand",  score: 61, color: "#22B8CF" },
  { brand: "StartupXYZ", score: 44, color: "#D97757" },
  { brand: "MegaCorp",   score: 38, color: "#F59E0B" },
];

const MOCK_MENTIONS = [
  { model: "chatgpt",    prompt: "Best CRM tools for startups",     sentiment: "positive", rank: 1, time: "2m ago"  },
  { model: "claude",     prompt: "Top project management software", sentiment: "positive", rank: 2, time: "8m ago"  },
  { model: "gemini",     prompt: "Acme Corp vs competitors",        sentiment: "neutral",  rank: 1, time: "15m ago" },
  { model: "perplexity", prompt: "Enterprise software solutions",   sentiment: "positive", rank: 3, time: "22m ago" },
  { model: "chatgpt",    prompt: "SaaS tools for remote teams",     sentiment: "negative", rank: 4, time: "31m ago" },
];

const SENTIMENT_COLORS: Record<string, string> = {
  positive: "#22C55E",
  neutral:  "#F59E0B",
  negative: "#EF4444",
  mixed:    "#C084FC",
};

const ENGINE_LABELS: Record<string, string> = {
  chatgpt: "ChatGPT", gemini: "Gemini", claude: "Claude", perplexity: "Perplexity",
};

// ── Styles ─────────────────────────────────────────────────────────────────

const card: React.CSSProperties = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 12,
};

const row: React.CSSProperties = { display: "flex", gap: 16 };

// ── Helpers ─────────────────────────────────────────────────────────────────

function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ── Skeleton ───────────────────────────────────────────────────────────────

function Skeleton({ w, h, radius = 6 }: { w: number | string; h: number; radius?: number }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: radius,
      background: "rgba(255,255,255,0.06)",
      animation: "shimmer 1.5s infinite",
      backgroundImage: "linear-gradient(90deg,rgba(255,255,255,0.04) 25%,rgba(255,255,255,0.09) 50%,rgba(255,255,255,0.04) 75%)",
      backgroundSize: "200% 100%",
    }} />
  );
}

// ── Component ──────────────────────────────────────────────────────────────

export default function OverviewPage() {
  const [days, setDays]     = useState(30);
  const [search, setSearch] = useState("");
  const [showAudit, setShowAudit] = useState(false);
  const { data, loading, error, refetch } = useDashboard(days);
  const project   = useAuthStore((s) => s.project);
  const projectId = useAuthStore((s) => s.projectId);

  const brandName  = project?.brandName ?? "Acme Corp";
  const subtitle   = project ? `${project.name} · ${project.domain}` : "Acme Corp · acmecorp.com";

  // Demo mode = no project connected → show illustrative mock data.
  // A real project with no scores yet shows real (empty) values, not mock.
  const isDemo    = !projectId;
  const noData    = !!projectId && !!data && data.trend.length === 0;

  // Derive values — real data when available, else mock fallback.
  const k             = data?.kpis;
  const score         = data?.currentScore ?? 72;
  const scoreChange   = data?.scoreChange  ?? 8.4;
  const totalPrompts  = k?.totalPrompts  ?? 1284;
  const totalMentions = k?.totalMentions ?? 487;
  const mentionFreq   = k?.mentionFrequency  ?? 37.9;
  const citations     = k?.citationsFound     ?? 93;
  const competitorsN  = k?.competitorsTracked ?? 4;
  const modelsActive  = k?.modelsActive       ?? 4;

  // Show the "how to boost" guide for a real project whose visibility is low.
  const showBoostGuide = !!projectId && !loading && !!data && score < 20;

  // Trend
  const trendData: TrendPoint[] = data?.trend.length
    ? data.trend.map((t) => ({
        date:     fmtDate(t.scoreDate),
        score:    t.overallScore,
        mentions: t.totalMentions ?? 0,
      }))
    : isDemo ? MOCK_TREND : [];

  // Model distribution
  const modelData: ModelDistribution[] = data?.modelDistribution.length
    ? data.modelDistribution.map((m) => ({
        model: m.model as ModelDistribution["model"],
        score: m.score,
        mentions: m.mentions,
        color: engineColors[m.model] ?? "#fff",
      }))
    : isDemo ? MOCK_MODELS : [];

  // Competitor share
  const competitorData: CompetitorShare[] = data?.competitors.length
    ? data.competitors.map((c) => ({
        brand: c.brand,
        score: c.score,
        color: c.isOwn ? "#C9F31D" : getScoreBand(c.score).color,
      }))
    : isDemo ? MOCK_COMPETITORS : [];

  // Recent mentions (+ search filter)
  const recentMentions = data?.recentMentions.length ? data.recentMentions : (isDemo ? MOCK_MENTIONS : []);
  const q = search.trim().toLowerCase();
  const filteredMentions = useMemo(
    () => (q ? recentMentions.filter((m) => m.prompt.toLowerCase().includes(q) || m.model.toLowerCase().includes(q)) : recentMentions),
    [recentMentions, q],
  );

  // Notifications feed (derived from the most recent brand mentions)
  const notifications = useMemo(
    () => recentMentions.slice(0, 6).map((m) => ({
      text: `${brandName} mentioned in ${ENGINE_LABELS[m.model] ?? m.model}${m.rank ? ` at rank #${m.rank}` : ""}`,
      time: m.time,
      color: SENTIMENT_COLORS[m.sentiment] ?? "#C9F31D",
    })),
    [recentMentions, brandName],
  );

  // Score breakdown
  const sb = data?.scoreBreakdown;
  const scoreFactors = [
    { label: "Mention Freq.",   score: sb?.mentionScore   ?? 76,  icon: MessageSquare },
    { label: "Ranking Pos.",    score: sb?.rankingScore   ?? 68,  icon: TrendingUp    },
    { label: "Sentiment",       score: sb?.sentimentScore ?? 82,  icon: CheckCircle2  },
    { label: "Citations",       score: sb?.citationScore  ?? 55,  icon: Link2         },
    { label: "Model Diversity", score: sb?.diversityScore ?? 100, icon: Bot           },
  ];

  return (
    <div style={{ background: "#0E0F11", minHeight: "100vh" }}>
      <Topbar
        title="Overview"
        subtitle={subtitle}
        days={days}
        onDaysChange={setDays}
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search mentions…"
        notifications={notifications}
      />

      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>

        {/* ── Error Banner ── */}
        {error && (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 16px", borderRadius: 10,
            background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.20)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <AlertCircle size={14} style={{ color: "#EF4444" }} />
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.65)" }}>
                Could not load live data — showing demo values.{" "}
                <span style={{ color: "#EF4444", fontSize: 11 }}>{error}</span>
              </span>
            </div>
            <button
              onClick={() => refetch()}
              style={{
                display: "flex", alignItems: "center", gap: 5,
                padding: "5px 12px", borderRadius: 7, border: "none", cursor: "pointer",
                background: "rgba(239,68,68,0.12)", color: "#EF4444", fontSize: 11, fontWeight: 600,
              }}
            >
              <RefreshCw size={11} />
              Retry
            </button>
          </div>
        )}

        {/* ── No project warning ── */}
        {!projectId && !loading && (
          <div style={{
            padding: "12px 16px", borderRadius: 10,
            background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.20)",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <AlertCircle size={14} style={{ color: "#F59E0B" }} />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.60)" }}>
              No project connected — showing demo data. Go to{" "}
              <Link href="/settings" style={{ color: "#C9F31D", fontWeight: 600, textDecoration: "none" }}>Settings → Project</Link> to connect.
            </span>
          </div>
        )}

        {/* ── No data yet (real project, no scores) ── */}
        {noData && (
          <div style={{
            padding: "12px 16px", borderRadius: 10,
            background: "rgba(201,243,29,0.06)", border: "1px solid rgba(201,243,29,0.20)",
            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Zap size={14} style={{ color: "#C9F31D" }} />
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.65)" }}>
                No tracking data yet for <strong style={{ color: "#fff" }}>{brandName}</strong> — run an audit to measure its AI visibility across every engine.
              </span>
            </div>
            <button onClick={() => setShowAudit(true)} style={{
              display: "flex", alignItems: "center", gap: 5, flexShrink: 0, border: "none", cursor: "pointer",
              padding: "7px 14px", borderRadius: 7,
              background: "#C9F31D", color: "#000", fontSize: 11.5, fontWeight: 700,
            }}>
              <Sparkles size={12} /> Run Audit
            </button>
          </div>
        )}

        {/* ── ROW 1: Score Gauge + 6 KPI Cards ── */}
        <div style={{ ...row, alignItems: "stretch" }}>

          {/* Score Gauge */}
          <div style={{
            ...card,
            width: 240, flexShrink: 0, padding: 24,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", margin: 0 }}>
              AI Visibility Score
            </p>
            {loading
              ? <Skeleton w={160} h={160} radius={80} />
              : <ScoreGauge score={score} size={180} />
            }
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "rgba(255,255,255,0.50)" }}>
              <TrendingUp size={12} style={{ color: scoreChange >= 0 ? "#22C55E" : "#EF4444" }} />
              <span style={{ color: scoreChange >= 0 ? "#22C55E" : "#EF4444", fontWeight: 600 }}>
                {scoreChange >= 0 ? "+" : ""}{scoreChange.toFixed(1)}%
              </span>
              <span>vs last {days} days</span>
            </div>
          </div>

          {/* 6 KPI Cards (clickable → relevant page) */}
          <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            <Link href="/prompts"     style={{ textDecoration: "none" }}><KPICard loading={loading} title="Total Prompts Tracked" value={totalPrompts}  delta={k?.promptsChange  ?? 12} icon={Zap}           iconColor="#C9F31D" /></Link>
            <Link href="/visibility"  style={{ textDecoration: "none" }}><KPICard loading={loading} title="Brand Mentions"        value={totalMentions} delta={k?.mentionsChange ?? 18} icon={MessageSquare} iconColor="#22B8CF" /></Link>
            <Link href="/visibility"  style={{ textDecoration: "none" }}><KPICard loading={loading} title="Mention Frequency"     value={mentionFreq.toFixed(1)} suffix="%" delta={k?.mentionFreqChange ?? 5} icon={Eye} iconColor="#C084FC" /></Link>
            <Link href="/citations"   style={{ textDecoration: "none" }}><KPICard loading={loading} title="Brand Citations"       value={citations}     icon={Link2}   iconColor="#D97757" /></Link>
            <Link href="/competitors" style={{ textDecoration: "none" }}><KPICard loading={loading} title="Competitors Tracked"   value={competitorsN}  icon={Users2}  iconColor="#F59E0B" /></Link>
            <Link href="/visibility"  style={{ textDecoration: "none" }}><KPICard loading={loading} title="AI Models Active"      value={modelsActive}  icon={Bot}     iconColor="#10A37F" /></Link>
          </div>
        </div>

        {/* ── Boost guide (shown when visibility is low) ── */}
        {showBoostGuide && (
          <VisibilityBoostGuide brandName={brandName} onRunAudit={() => setShowAudit(true)} />
        )}

        {/* ── ROW 2: Trend Chart + Model Distribution ── */}
        <div style={row}>
          <div style={{ flex: "0 0 calc(65% - 8px)" }}>
            {loading
              ? <div style={{ ...card, height: 240 }}><Skeleton w="100%" h={240} radius={12} /></div>
              : <TrendChart data={trendData} />
            }
          </div>
          <div style={{ flex: "0 0 calc(35% - 8px)" }}>
            {loading
              ? <div style={{ ...card, height: 240 }}><Skeleton w="100%" h={240} radius={12} /></div>
              : <ModelDistributionChart data={modelData} />
            }
          </div>
        </div>

        {/* ── ROW 3: Competitor Chart + Recent Mentions ── */}
        <div style={row}>
          <div style={{ flex: "0 0 calc(38% - 8px)" }}>
            {loading
              ? <div style={{ ...card, height: 280 }}><Skeleton w="100%" h={280} radius={12} /></div>
              : <CompetitorChart data={competitorData} brandName={brandName} />
            }
          </div>

          {/* Recent Mentions */}
          <div style={{ ...card, flex: 1, padding: 20, display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexShrink: 0 }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: "#fff", margin: 0 }}>Recent Mentions</h3>
              <Link href="/visibility" style={{
                display: "flex", alignItems: "center", gap: 4,
                fontSize: 11, fontWeight: 500, color: "#C9F31D",
                textDecoration: "none",
              }}>
                View all <ArrowRight size={11} />
              </Link>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 8, background: "rgba(255,255,255,0.03)" }}>
                      <Skeleton w={26} h={26} radius={6} />
                      <Skeleton w="60%" h={12} />
                      <Skeleton w={28} h={20} radius={4} />
                    </div>
                  ))
                : filteredMentions.length === 0
                ? (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
                      {search.trim() ? <>No mentions match &ldquo;{search}&rdquo;</> : "No mentions yet"}
                    </div>
                  )
                : filteredMentions.map((m, i) => (
                    <div key={i} style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "9px 12px", borderRadius: 8,
                      background: "rgba(255,255,255,0.03)",
                    }}>
                      <div style={{
                        width: 26, height: 26, borderRadius: 6, flexShrink: 0,
                        background: `${engineColors[m.model] ?? "#888"}20`,
                        border: `1px solid ${engineColors[m.model] ?? "#888"}35`,
                        color: engineColors[m.model] ?? "#888",
                        fontSize: 9, fontWeight: 700,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {(ENGINE_LABELS[m.model] ?? m.model).slice(0, 2).toUpperCase()}
                      </div>
                      <span style={{ flex: 1, fontSize: 12, color: "rgba(255,255,255,0.75)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {m.prompt}
                      </span>
                      {m.rank != null && (
                        <span style={{
                          fontSize: 11, fontWeight: 600, padding: "2px 6px", borderRadius: 4, flexShrink: 0,
                          background: "rgba(255,255,255,0.06)",
                          color: m.rank === 1 ? "#C9F31D" : "rgba(255,255,255,0.45)",
                          fontVariantNumeric: "tabular-nums",
                        }}>
                          #{m.rank}
                        </span>
                      )}
                      <span style={{
                        fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 20, flexShrink: 0,
                        background: `${SENTIMENT_COLORS[m.sentiment] ?? "#888"}18`,
                        color: SENTIMENT_COLORS[m.sentiment] ?? "#888",
                        textTransform: "capitalize",
                      }}>
                        {m.sentiment}
                      </span>
                      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.28)", flexShrink: 0 }}>
                        {m.time}
                      </span>
                    </div>
                  ))
              }
            </div>
          </div>
        </div>

        {/* ── ROW 4: Score Breakdown ── */}
        <div style={{ ...card, padding: 20 }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: "#fff", margin: "0 0 16px 0" }}>
            Score Breakdown
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
            {scoreFactors.map(({ label, score: s, icon: Icon }) => {
              const b = getScoreBand(s ?? 0);
              const rounded = Math.round(s ?? 0);
              return (
                <div key={label} style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                  padding: "16px 12px", borderRadius: 10,
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
                }}>
                  {loading
                    ? <>
                        <Skeleton w={34} h={34} radius={8} />
                        <Skeleton w={40} h={28} />
                        <Skeleton w={60} h={12} />
                      </>
                    : <>
                        <div style={{ width: 34, height: 34, borderRadius: 8, background: `${b.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Icon size={16} style={{ color: b.color }} />
                        </div>
                        <span style={{ fontSize: 26, fontWeight: 700, color: b.color, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
                          {rounded}
                        </span>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.40)", textAlign: "center", lineHeight: 1.3 }}>
                          {label}
                        </span>
                        <div style={{ width: "100%", height: 4, borderRadius: 2, background: "rgba(255,255,255,0.08)" }}>
                          <div style={{ height: "100%", borderRadius: 2, width: `${rounded}%`, background: b.color }} />
                        </div>
                      </>
                  }
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {showAudit && projectId && (
        <RunAuditModal
          projectId={projectId}
          brandName={brandName}
          defaultCategory={undefined}
          onClose={() => setShowAudit(false)}
          onDone={refetch}
        />
      )}
    </div>
  );
}
