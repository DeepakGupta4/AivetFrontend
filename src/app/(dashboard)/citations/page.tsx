"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Topbar from "@/components/shared/Topbar";
import BrandLogo from "@/components/shared/BrandLogo";
import { useAuthStore } from "@/lib/stores/authStore";
import { useTier } from "@/lib/hooks/useTier";
import LockedFeature from "@/components/shared/LockedFeature";
import { visibilityApi, type CitationsData } from "@/lib/api/visibility";
import { engineColors } from "@/lib/colors";
import {
  CheckCircle2, ExternalLink, Target, AlertCircle, RefreshCw, ArrowRight,
  Zap, HelpCircle, TrendingUp, Sparkles,
} from "lucide-react";

const LIME = "#C9F31D";
const card: React.CSSProperties = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 12,
};
const MODEL_LABEL: Record<string, string> = {
  chatgpt: "ChatGPT", gemini: "Gemini", claude: "Claude",
  perplexity: "Perplexity", google_ai_overview: "Google AI",
};

// Simple 3-band authority — Strong / Decent / Weak. We avoid the word
// "authority" in the UI because it's jargon; we show the band visually.
function authorityBand(a: number) {
  if (a >= 60) return { label: "Strong site", color: "#22C55E", icon: "🏆" };
  if (a >= 30) return { label: "Decent site", color: "#C9F31D", icon: "👍" };
  if (a >  0)  return { label: "Smaller site", color: "#F59E0B", icon: "🌱" };
  return { label: "Unknown", color: "rgba(255,255,255,0.4)", icon: "" };
}

export default function CitationsPage() {
  const project   = useAuthStore((s) => s.project);
  const projectId = useAuthStore((s) => s.projectId);
  const { allows, resolved: tierResolved } = useTier();

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

  const sources = data?.sources ?? [];
  const opportunities = data?.opportunities ?? [];
  const empty = !!projectId && !loading && !error && sources.length === 0;

  if (tierResolved && !allows("citations")) {
    return <LockedFeature title="Citations" feature="citations" subtitle={project ? `${project.name} · ${project.domain}` : undefined} />;
  }

  const brandSourcesCount = sources.filter((s) => s.isBrand).length;
  const brandShare = data?.brandShare ?? 0;
  const yourCitations = data?.brandCitations ?? 0;
  const externalSources = sources.filter((s) => !s.isBrand);

  // Plain-language headline for the brand-share number.
  const verdict =
    brandShare >= 25 ? { text: "AI trusts your site as a source", color: "#22C55E", icon: CheckCircle2 } :
    brandShare >= 5  ? { text: "AI sometimes cites you — room to grow", color: "#C9F31D", icon: TrendingUp } :
    yourCitations > 0 ? { text: "AI rarely cites you — work needed", color: "#F59E0B", icon: AlertCircle } :
    { text: "AI doesn't cite your site yet", color: "#EF4444", icon: AlertCircle };
  const VerdictIcon = verdict.icon;

  return (
    <div style={{ background: "#0E0F11", minHeight: "100vh" }}>
      <Topbar title="Citations" subtitle={project ? `${project.name} · ${project.domain}` : "Which websites AI cites for your topics"} days={days} onDaysChange={setDays} />

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

            {/* 1. Plain-language explainer — what is a citation, why care? */}
            <div style={{ ...card, padding: "18px 22px", display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(201,243,29,0.12)", border: "1px solid rgba(201,243,29,0.22)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <HelpCircle size={18} style={{ color: LIME }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#fff", margin: "0 0 4px" }}>
                  What's a citation?
                </p>
                <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.65)", margin: 0, lineHeight: 1.55 }}>
                  When AI engines like ChatGPT or Perplexity answer a question, they sometimes link to a website as a source. This page shows <strong style={{ color: "#fff" }}>which websites AI cites for your topics</strong> — including whether your own site shows up. The more often AI cites you, the more trusted you look in front of users.
                </p>
              </div>
            </div>

            {/* 2. Hero verdict — single big number with plain meaning */}
            {!loading && (
              <div style={{ ...card, padding: "24px 26px", borderColor: `${verdict.color}33`, background: `${verdict.color}08` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 11, background: `${verdict.color}18`, border: `1px solid ${verdict.color}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <VerdictIcon size={20} style={{ color: verdict.color }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "rgba(255,255,255,0.45)", textTransform: "uppercase", margin: "0 0 3px" }}>Your standing</p>
                    <p style={{ fontSize: 16, fontWeight: 700, color: "#fff", margin: 0 }}>{verdict.text}</p>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
                  <SimpleMetric
                    big={loading ? "—" : String(yourCitations)}
                    label="Times AI cited your site"
                    sub={`Out of ${data?.totalCitations ?? 0} total citations for your topics`}
                    color={verdict.color}
                  />
                  <SimpleMetric
                    big={loading ? "—" : `${brandShare}%`}
                    label="Your share of all citations"
                    sub={brandShare >= 25 ? "Healthy share — keep it up" : brandShare >= 5 ? "Decent — aim higher" : "Low — see opportunities below"}
                    color={verdict.color}
                  />
                  <SimpleMetric
                    big={loading ? "—" : String(data?.uniqueDomains ?? 0)}
                    label="Different sites AI uses"
                    sub="The wider the list, the more competition"
                    color="rgba(255,255,255,0.65)"
                  />
                </div>
              </div>
            )}

            {empty && (
              <div style={{ ...card, padding: 48, textAlign: "center" }}>
                <Zap size={28} style={{ color: LIME, opacity: 0.8 }} />
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", margin: "14px 0 6px", fontWeight: 600 }}>No citations captured yet</p>
                <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.45)", margin: "0 0 16px", maxWidth: 460, marginLeft: "auto", marginRight: "auto", lineHeight: 1.5 }}>
                  Run an audit first. Citations only come from engines that cite their sources — mainly Perplexity & Google AI Overviews.
                </p>
                <Link href="/prompts" style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 8, background: LIME, color: "#000", fontSize: 12.5, fontWeight: 600, textDecoration: "none" }}>
                  Go to Campaigns <ArrowRight size={13} />
                </Link>
              </div>
            )}

            {/* 3. Your site card (if AI cited you) — friendly highlight */}
            {!empty && brandSourcesCount > 0 && (
              <div style={{ ...card, padding: "18px 22px", borderColor: `${LIME}33`, background: `${LIME}06`, display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 46, height: 46, borderRadius: 12, background: `${LIME}18`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <CheckCircle2 size={22} style={{ color: LIME }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#fff", margin: "0 0 3px" }}>
                    Your site appears in AI answers
                  </p>
                  <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.55)", margin: 0 }}>
                    <strong style={{ color: "#fff" }}>{project?.domain ?? "Your domain"}</strong> was cited <strong style={{ color: LIME }}>{yourCitations} time{yourCitations === 1 ? "" : "s"}</strong> across {sources.filter((s) => s.isBrand).flatMap((s) => s.models).filter((v, i, a) => a.indexOf(v) === i).map((m) => MODEL_LABEL[m] ?? m).join(", ") || "AI engines"}.
                  </p>
                </div>
              </div>
            )}

            {/* 4. Sources list — plain card layout, NOT a table */}
            {!empty && externalSources.length > 0 && (
              <div style={{ ...card, overflow: "hidden" }}>
                <div style={{ padding: "16px 22px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: "#fff", margin: "0 0 3px" }}>Where AI gets info about your topics</p>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: 0 }}>
                    These are the websites AI links to when answering questions in your industry. The more they appear, the more AI trusts them.
                  </p>
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {externalSources.map((s, i) => {
                    const ab = authorityBand(s.authority);
                    return (
                      <div
                        key={s.domain}
                        style={{
                          display: "flex", alignItems: "center", gap: 14,
                          padding: "14px 22px",
                          borderBottom: i < externalSources.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                        }}
                      >
                        <BrandLogo domain={s.domain} name={s.domain} size={34} radius={9} fallbackBg="rgba(255,255,255,0.08)" fallbackColor="#fff" />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            <a
                              href={`https://${s.domain}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ fontSize: 14, fontWeight: 600, color: "#fff", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 5 }}
                            >
                              {s.domain}
                              <ExternalLink size={11} style={{ color: "rgba(255,255,255,0.35)" }} />
                            </a>
                            {s.authority > 0 && (
                              <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: `${ab.color}18`, color: ab.color }}>
                                {ab.label}
                              </span>
                            )}
                          </div>
                          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.50)", margin: "3px 0 0" }}>
                            Cited <strong style={{ color: "#fff" }}>{s.count}×</strong> · seen on {s.models.map((m) => MODEL_LABEL[m] ?? m).join(", ")}
                          </p>
                        </div>
                        <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                          {s.models.map((m) => (
                            <span key={m} title={MODEL_LABEL[m] ?? m} style={{ width: 22, height: 22, borderRadius: 6, fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", background: `${engineColors[m] ?? "#888"}22`, color: engineColors[m] ?? "#aaa" }}>
                              {(MODEL_LABEL[m] ?? m).slice(0, 2).toUpperCase()}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 5. Opportunities — renamed to action-oriented */}
            {opportunities.length > 0 && (
              <div style={{ ...card, padding: "18px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <Sparkles size={16} style={{ color: "#F59E0B" }} />
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: "#fff", margin: 0 }}>Sites to get featured on</h3>
                </div>
                <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.55)", margin: "0 0 16px", lineHeight: 1.5 }}>
                  AI cites these sites a lot for your topics. If you can get mentioned on any of them — guest post, review, listing, interview — AI will start trusting your brand more.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10 }}>
                  {opportunities.map((o) => {
                    const ab = authorityBand(o.authority);
                    return (
                      <a
                        key={o.domain}
                        href={`https://${o.domain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "flex", alignItems: "center", gap: 12,
                          padding: "12px 14px", borderRadius: 10, textDecoration: "none",
                          background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.18)",
                        }}
                      >
                        <BrandLogo domain={o.domain} name={o.domain} size={32} radius={8} fallbackBg="rgba(245,158,11,0.18)" fallbackColor="#F59E0B" />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: "#fff", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.domain}</p>
                          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.50)", margin: "2px 0 0" }}>
                            Cited {o.count}× · {ab.label}
                          </p>
                        </div>
                        <ExternalLink size={13} style={{ color: "rgba(255,255,255,0.35)", flexShrink: 0 }} />
                      </a>
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

// ── Helper components ────────────────────────────────────────────────────────

function SimpleMetric({ big, label, sub, color }: { big: string; label: string; sub: string; color: string }) {
  return (
    <div>
      <p style={{ fontSize: 36, fontWeight: 800, color: "#fff", lineHeight: 1, letterSpacing: "-0.8px", margin: "0 0 6px" }}>
        {big}
      </p>
      <p style={{ fontSize: 12.5, fontWeight: 600, color: "rgba(255,255,255,0.75)", margin: "0 0 3px" }}>{label}</p>
      <p style={{ fontSize: 11, color: typeof color === "string" && color.startsWith("rgba") ? color : `${color}cc`, margin: 0 }}>{sub}</p>
    </div>
  );
}

// Suppress unused import lint for Target — kept for future "tracking opportunities" UI.
void Target;
