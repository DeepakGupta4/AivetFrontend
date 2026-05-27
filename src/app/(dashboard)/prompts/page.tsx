"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Topbar from "@/components/shared/Topbar";
import CreateCampaignModal from "@/components/prompts/CreateCampaignModal";
import RunAuditModal from "@/components/shared/RunAuditModal";
import LockedFeature from "@/components/shared/LockedFeature";
import { useAuthStore } from "@/lib/stores/authStore";
import { useTier } from "@/lib/hooks/useTier";
import { campaignsApi, type CampaignDTO, type PromptRunDTO } from "@/lib/api/campaigns";
import { engineColors } from "@/lib/colors";
import {
  Zap, Plus, Play, Pause, Trash2, Loader2, Sparkles, Clock,
  CheckCircle2, XCircle, AlertCircle, RefreshCw, ArrowRight, HelpCircle,
  MessageSquare,
} from "lucide-react";

const LIME = "#C9F31D";
const card: React.CSSProperties = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 12,
};

const STATUS: Record<string, { label: string; color: string; help: string }> = {
  pending:   { label: "Waiting",    color: "#F59E0B", help: "Queued to be sent to AI engines" },
  running:   { label: "Asking AI",  color: "#22B8CF", help: "Sending the question to the engines" },
  completed: { label: "Done",       color: "#22C55E", help: "AI engines answered successfully" },
  failed:    { label: "Failed",     color: "#EF4444", help: "Couldn't reach an engine — try Run again" },
};

const ENGINE_LABEL: Record<string, string> = {
  chatgpt: "ChatGPT", gemini: "Gemini", claude: "Claude",
  perplexity: "Perplexity", google_ai_overview: "Google AI",
};

const CADENCE_LABEL: Record<string, string> = {
  hourly: "every hour",
  daily:  "every day",
  weekly: "every week",
};

function timeAgo(d?: string): string {
  if (!d) return "—";
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function timeUntil(d?: string): string {
  if (!d) return "—";
  const diff = new Date(d).getTime() - Date.now();
  if (diff < 0) return "due now";
  const m = Math.floor(diff / 60000);
  if (m < 60) return `in ${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `in ${h}h`;
  return `in ${Math.floor(h / 24)}d`;
}

export default function PromptsPage() {
  const project   = useAuthStore((s) => s.project);
  const projectId = useAuthStore((s) => s.projectId);
  const { allows, resolved: tierResolved, tier, limits, usage } = useTier();

  const [campaigns, setCampaigns] = useState<CampaignDTO[]>([]);
  const [runs, setRuns]           = useState<PromptRunDTO[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [running, setRunning]     = useState<Set<string>>(new Set());
  const [showCreate, setShowCreate] = useState(false);
  const [showAudit, setShowAudit]   = useState(false);
  const [notice, setNotice]       = useState<string | null>(null);

  const loadRuns = useCallback(async (list: CampaignDTO[]) => {
    const all = await Promise.all(list.map((c) => campaignsApi.runs(c._id).catch(() => [] as PromptRunDTO[])));
    const merged = all.flat().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setRuns(merged);
  }, []);

  const load = useCallback(async () => {
    if (!projectId) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const list = await campaignsApi.list(projectId);
      setCampaigns(list);
      await loadRuns(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  }, [projectId, loadRuns]);

  useEffect(() => { load(); }, [load]);

  const markRunning = (id: string, on: boolean) =>
    setRunning((prev) => { const n = new Set(prev); if (on) n.add(id); else n.delete(id); return n; });

  async function handleRun(c: CampaignDTO) {
    markRunning(c._id, true);
    setNotice(null);
    try {
      await campaignsApi.run(c._id);
      for (let i = 0; i < 25; i++) {
        await new Promise((r) => setTimeout(r, 3000));
        const r = await campaignsApi.runs(c._id).catch(() => [] as PromptRunDTO[]);
        setRuns((prev) => {
          const others = prev.filter((x) => x.campaignId !== c._id);
          return [...others, ...r].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        });
        const active = r.some((x) => x.status === "pending" || x.status === "running");
        if (!active) break;
      }
      setNotice(`Done. "${c.name}" finished checking — see your latest visibility scores in Overview.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Run failed");
    } finally {
      markRunning(c._id, false);
    }
  }

  async function handleToggle(c: CampaignDTO) {
    const updated = await campaignsApi.update(c._id, { isActive: !c.isActive }).catch(() => null);
    if (updated) setCampaigns((prev) => prev.map((x) => (x._id === c._id ? updated : x)));
  }

  async function handleDelete(c: CampaignDTO) {
    if (!confirm(`Delete "${c.name}"? This stops tracking these questions.`)) return;
    setCampaigns((prev) => prev.filter((x) => x._id !== c._id));
    setRuns((prev) => prev.filter((x) => x.campaignId !== c._id));
    await campaignsApi.remove(c._id).catch(() => {});
  }

  if (tierResolved && !allows("prompts")) {
    return <LockedFeature title="Audits & Campaigns" feature="prompts" subtitle={project ? `${project.name} · ${project.domain}` : undefined} />;
  }

  // Stats — plain language
  const activeCount = campaigns.filter((c) => c.isActive).length;
  const pausedCount = campaigns.length - activeCount;
  const completedRuns = runs.filter((r) => r.status === "completed").length;
  const failedRuns = runs.filter((r) => r.status === "failed").length;
  const lastRun = runs[0]?.createdAt;

  // Monthly prompt-budget usage (matches the billing copy: 50/250/500/1000)
  const promptLimit = limits?.promptLimit ?? 0;
  const promptsUsed = usage?.promptsUsed ?? 0;
  const usagePct = promptLimit > 0 ? Math.min(100, Math.round((promptsUsed / promptLimit) * 100)) : 0;
  const usageColor = usagePct >= 90 ? "#EF4444" : usagePct >= 70 ? "#F59E0B" : "#22C55E";
  void tier;

  return (
    <div style={{ background: "#0E0F11", minHeight: "100vh" }}>
      <Topbar title="Audits & Campaigns" subtitle={project ? `${project.name} · ${project.domain}` : undefined} />

      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>

        {!projectId && (
          <div style={{ ...card, padding: 40, textAlign: "center" }}>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", margin: 0 }}>
              Select or add a brand from the sidebar to start tracking AI mentions.
            </p>
          </div>
        )}

        {projectId && (
          <>
            {/* 1. Explainer */}
            <div style={{ ...card, padding: "18px 22px", display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: `${LIME}18`, border: `1px solid ${LIME}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <HelpCircle size={18} style={{ color: LIME }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#fff", margin: "0 0 4px" }}>
                  How does this work?
                </p>
                <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.65)", margin: 0, lineHeight: 1.55 }}>
                  We ask AI engines (ChatGPT, Gemini, Claude, Perplexity, Google AI) real questions about your industry and check if they mention <strong style={{ color: "#fff" }}>{project?.brandName}</strong>. You have two options:
                  {" "}<strong style={{ color: "#fff" }}>Quick audit</strong> runs once with auto-generated questions.
                  {" "}<strong style={{ color: "#fff" }}>Campaigns</strong> are saved question sets that re-run automatically on a schedule.
                </p>
              </div>
            </div>

            {/* 2. Primary CTAs */}
            <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 14 }}>
              {/* Quick audit — primary */}
              <div style={{ ...card, padding: "20px 22px", display: "flex", gap: 16, alignItems: "center", background: `${LIME}06`, borderColor: `${LIME}33` }}>
                <div style={{ width: 44, height: 44, borderRadius: 11, background: `${LIME}18`, border: `1px solid ${LIME}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Sparkles size={20} style={{ color: LIME }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13.5, fontWeight: 700, color: "#fff", margin: "0 0 3px" }}>Run a quick audit</p>
                  <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.55)", margin: 0, lineHeight: 1.5 }}>
                    One-click. We generate the questions for you. Takes ~15-30 seconds.
                  </p>
                </div>
                <button
                  onClick={() => setShowAudit(true)}
                  className="btn-lime"
                  style={{ padding: "10px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}
                >
                  Start audit
                </button>
              </div>

              {/* New campaign — secondary */}
              <div style={{ ...card, padding: "20px 22px", display: "flex", gap: 14, alignItems: "center" }}>
                <div style={{ width: 44, height: 44, borderRadius: 11, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <MessageSquare size={20} style={{ color: "rgba(255,255,255,0.65)" }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13.5, fontWeight: 700, color: "#fff", margin: "0 0 3px" }}>Save custom questions</p>
                  <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.55)", margin: 0, lineHeight: 1.5 }}>
                    Write your own questions to track on a schedule.
                  </p>
                </div>
                <button
                  onClick={() => setShowCreate(true)}
                  style={{ padding: "8px 14px", fontSize: 12.5, fontWeight: 600, borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.85)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}
                >
                  <Plus size={13} /> New
                </button>
              </div>
            </div>

            {/* Notices */}
            {notice && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 14px", borderRadius: 10, background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.22)" }}>
                <CheckCircle2 size={15} style={{ color: "#22C55E", flexShrink: 0 }} />
                <span style={{ fontSize: 12.5, color: "rgba(255,255,255,0.75)", flex: 1 }}>{notice}</span>
                <Link href="/overview" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11.5, fontWeight: 600, color: LIME, textDecoration: "none" }}>
                  See scores <ArrowRight size={12} />
                </Link>
              </div>
            )}
            {error && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 14px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "rgba(255,255,255,0.7)" }}>
                  <AlertCircle size={14} style={{ color: "#EF4444" }} /> {error}
                </span>
                <button onClick={load} style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 7, border: "none", cursor: "pointer", background: "rgba(239,68,68,0.12)", color: "#EF4444", fontSize: 11, fontWeight: 600 }}>
                  <RefreshCw size={11} /> Retry
                </button>
              </div>
            )}

            {/* 3. Stats + monthly budget usage */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              <StatCard
                value={loading ? "—" : `${campaigns.length}`}
                label="Saved campaigns"
                sub={loading ? "" : activeCount > 0 ? `${activeCount} running on auto` : pausedCount > 0 ? "All paused" : "None yet"}
                color={LIME}
                Icon={Zap}
              />
              <div style={{ ...card, padding: "18px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.55)" }}>Prompts this month</span>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: `${usageColor}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <MessageSquare size={14} style={{ color: usageColor }} />
                  </div>
                </div>
                <p style={{ fontSize: 28, fontWeight: 800, color: "#fff", lineHeight: 1, letterSpacing: "-0.5px", margin: "0 0 8px" }}>
                  {loading ? "—" : `${promptsUsed}`}<span style={{ fontSize: 16, fontWeight: 600, color: "rgba(255,255,255,0.35)" }}> / {promptLimit}</span>
                </p>
                <div style={{ height: 5, borderRadius: 3, background: "rgba(255,255,255,0.08)", overflow: "hidden", marginBottom: 5 }}>
                  <div style={{ height: "100%", borderRadius: 3, width: `${usagePct}%`, background: `linear-gradient(90deg, ${usageColor}88, ${usageColor})`, transition: "width 0.6s ease" }} />
                </div>
                <p style={{ fontSize: 11, color: usageColor, margin: 0, fontWeight: usagePct >= 70 ? 600 : 400 }}>
                  {usagePct >= 90 ? "Almost out — upgrade for more" : usagePct >= 70 ? "Getting close to limit" : `${promptLimit - promptsUsed} left in your monthly budget`}
                </p>
              </div>
              <StatCard
                value={loading ? "—" : `${completedRuns}`}
                label="Successful checks"
                sub={failedRuns > 0 ? `${failedRuns} failed · last: ${timeAgo(lastRun)}` : `Last: ${timeAgo(lastRun)}`}
                color={failedRuns > completedRuns ? "#EF4444" : "#22C55E"}
                Icon={CheckCircle2}
              />
            </div>

            {/* 4. Campaigns list */}
            <div style={{ ...card, overflow: "hidden" }}>
              <div style={{ padding: "16px 22px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#fff", margin: "0 0 3px" }}>Your campaigns</p>
                <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.45)", margin: 0 }}>
                  Each campaign is a saved set of questions that runs automatically on a schedule.
                </p>
              </div>

              {loading ? (
                <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.4)", padding: "30px 0", textAlign: "center" }}>Loading…</p>
              ) : campaigns.length === 0 ? (
                <div style={{ textAlign: "center", padding: "36px 24px" }}>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", margin: "0 0 14px", lineHeight: 1.5 }}>
                    No campaigns yet. Use <strong style={{ color: "#fff" }}>Start audit</strong> above for a one-click test,
                    {" "}or <strong style={{ color: "#fff" }}>New</strong> to write your own questions.
                  </p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {campaigns.map((c, i) => {
                    const isRunning = running.has(c._id);
                    const promptCount = c.prompts?.length ?? 0;
                    return (
                      <div
                        key={c._id}
                        style={{
                          display: "flex", alignItems: "center", gap: 14,
                          padding: "16px 22px",
                          borderBottom: i < campaigns.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                        }}
                      >
                        <div style={{ width: 38, height: 38, borderRadius: 10, background: c.isActive ? "rgba(34,197,94,0.10)" : "rgba(255,255,255,0.05)", border: c.isActive ? "1px solid rgba(34,197,94,0.20)" : "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Zap size={16} style={{ color: c.isActive ? "#22C55E" : "rgba(255,255,255,0.40)" }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 13.5, fontWeight: 600, color: "#fff" }}>{c.name}</span>
                            <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 999, background: c.isActive ? "rgba(34,197,94,0.14)" : "rgba(255,255,255,0.08)", color: c.isActive ? "#22C55E" : "rgba(255,255,255,0.5)" }}>
                              {c.isActive ? "Active" : "Paused"}
                            </span>
                          </div>
                          <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.50)", margin: "5px 0 0", lineHeight: 1.45 }}>
                            <strong style={{ color: "#fff" }}>{promptCount}</strong> question{promptCount === 1 ? "" : "s"} ·
                            {" "}runs <strong style={{ color: "#fff" }}>{CADENCE_LABEL[c.frequency] ?? c.frequency}</strong>
                            {c.isActive && c.nextRunAt ? <> · next check {timeUntil(c.nextRunAt)}</> : null}
                          </p>
                        </div>

                        <button
                          onClick={() => handleRun(c)}
                          disabled={isRunning}
                          title="Send these questions to AI engines right now"
                          style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, border: "none", cursor: isRunning ? "default" : "pointer", background: isRunning ? "rgba(255,255,255,0.08)" : `${LIME}18`, color: isRunning ? "rgba(255,255,255,0.6)" : LIME, fontSize: 12, fontWeight: 700 }}
                        >
                          {isRunning ? <><Loader2 size={13} className="auth-spin" /> Asking AI…</> : <><Play size={12} /> Run now</>}
                        </button>
                        <button
                          onClick={() => handleToggle(c)}
                          title={c.isActive ? "Pause auto-runs" : "Resume auto-runs"}
                          style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                        >
                          {c.isActive ? <Pause size={13} style={{ color: "rgba(255,255,255,0.6)" }} /> : <Play size={13} style={{ color: "rgba(255,255,255,0.6)" }} />}
                        </button>
                        <button
                          onClick={() => handleDelete(c)}
                          title="Delete this campaign"
                          style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                        >
                          <Trash2 size={13} style={{ color: "#EF4444" }} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 5. Recent runs */}
            <div style={{ ...card, overflow: "hidden" }}>
              <div style={{ padding: "16px 22px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#fff", margin: "0 0 3px" }}>Recent activity</p>
                <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.45)", margin: 0 }}>
                  Each row is one question sent to AI engines. Done = answer captured, Failed = couldn't reach an engine.
                </p>
              </div>
              {runs.length === 0 ? (
                <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.4)", padding: "30px 0", textAlign: "center" }}>
                  No activity yet — hit <strong style={{ color: "#fff" }}>Start audit</strong> above to send your first question.
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {runs.slice(0, 15).map((r, i) => {
                    const st = STATUS[r.status] ?? STATUS.pending;
                    return (
                      <div
                        key={r._id}
                        style={{
                          display: "flex", alignItems: "center", gap: 14,
                          padding: "12px 22px",
                          borderBottom: i < Math.min(runs.length, 15) - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.80)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={r.promptText}>
                            {r.promptText}
                          </p>
                          <p style={{ fontSize: 10.5, color: st.color, margin: "3px 0 0", opacity: 0.85 }} title={st.help}>{st.help}</p>
                        </div>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, color: st.color, minWidth: 84 }}>
                          {r.status === "running" ? <Loader2 size={12} className="auth-spin" /> : r.status === "completed" ? <CheckCircle2 size={12} /> : r.status === "failed" ? <XCircle size={12} /> : <Clock size={12} />}
                          {st.label}
                        </span>
                        <div style={{ display: "flex", gap: 4, minWidth: 130 }}>
                          {(r.responses ?? []).length === 0 ? (
                            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>—</span>
                          ) : (
                            (r.responses ?? []).map((resp, idx) => (
                              <span key={idx} title={ENGINE_LABEL[resp.model] ?? resp.model} style={{ width: 20, height: 20, borderRadius: 5, fontSize: 8.5, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", background: `${engineColors[resp.model] ?? "#888"}22`, color: engineColors[resp.model] ?? "#aaa" }}>
                                {(ENGINE_LABEL[resp.model] ?? resp.model).slice(0, 2).toUpperCase()}
                              </span>
                            ))
                          )}
                        </div>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", minWidth: 70, textAlign: "right" }}>{timeAgo(r.createdAt)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {showCreate && projectId && (
        <CreateCampaignModal
          projectId={projectId}
          brandName={project?.brandName ?? "your brand"}
          industry={undefined}
          onClose={() => setShowCreate(false)}
          onCreated={(c) => { setCampaigns((prev) => [...prev, c]); setShowCreate(false); }}
        />
      )}

      {showAudit && projectId && (
        <RunAuditModal
          projectId={projectId}
          brandName={project?.brandName ?? "your brand"}
          onClose={() => setShowAudit(false)}
          onDone={load}
        />
      )}
    </div>
  );
}

// ── Helper component ─────────────────────────────────────────────────────────
function StatCard({ value, label, sub, color, Icon }: { value: string; label: string; sub: string; color: string; Icon: React.FC<{ size?: number; style?: React.CSSProperties }> }) {
  return (
    <div style={{ ...card, padding: "18px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.55)" }}>{label}</span>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon size={14} style={{ color }} />
        </div>
      </div>
      <p style={{ fontSize: 28, fontWeight: 800, color: "#fff", lineHeight: 1, letterSpacing: "-0.5px", margin: "0 0 4px" }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", margin: 0 }}>{sub}</p>}
    </div>
  );
}
