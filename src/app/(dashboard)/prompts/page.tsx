"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Topbar from "@/components/shared/Topbar";
import CreateCampaignModal from "@/components/prompts/CreateCampaignModal";
import RunAuditModal from "@/components/shared/RunAuditModal";
import { useAuthStore } from "@/lib/stores/authStore";
import { campaignsApi, type CampaignDTO, type PromptRunDTO } from "@/lib/api/campaigns";
import { engineColors } from "@/lib/colors";
import {
  Zap, Plus, Play, Pause, Trash2, Loader2, Sparkles, Clock,
  CheckCircle2, XCircle, AlertCircle, RefreshCw, ArrowRight,
} from "lucide-react";

const LIME = "#C9F31D";
const card: React.CSSProperties = { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 };

const STATUS: Record<string, { label: string; color: string }> = {
  pending:   { label: "Pending",   color: "#F59E0B" },
  running:   { label: "Running",   color: "#22B8CF" },
  completed: { label: "Completed", color: "#22C55E" },
  failed:    { label: "Failed",    color: "#EF4444" },
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

export default function PromptsPage() {
  const project   = useAuthStore((s) => s.project);
  const projectId = useAuthStore((s) => s.projectId);

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
      // Poll until this campaign's latest runs settle (max ~75s)
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
      setNotice(`Run finished for "${c.name}". Check the Overview for updated scores.`);
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
    setCampaigns((prev) => prev.filter((x) => x._id !== c._id));
    setRuns((prev) => prev.filter((x) => x.campaignId !== c._id));
    await campaignsApi.remove(c._id).catch(() => {});
  }

  // Stats
  const activeCount = campaigns.filter((c) => c.isActive).length;
  const totalPrompts = campaigns.reduce((s, c) => s + (c.prompts?.length ?? 0), 0);
  const completedRuns = runs.filter((r) => r.status === "completed").length;
  const lastRun = runs[0]?.createdAt;

  const stats = [
    { label: "Active Campaigns", value: activeCount,      icon: Zap,          color: LIME },
    { label: "Total Prompts",    value: totalPrompts,     icon: Sparkles,     color: "#C084FC" },
    { label: "Completed Runs",   value: completedRuns,    icon: CheckCircle2, color: "#22C55E" },
    { label: "Last Run",         value: timeAgo(lastRun), icon: Clock,        color: "#22B8CF" },
  ];

  return (
    <div style={{ background: "#0E0F11", minHeight: "100vh" }}>
      <Topbar title="Prompt Campaigns" subtitle={project ? `${project.name} · ${project.domain}` : undefined} />

      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>

        {/* No project */}
        {!projectId && (
          <div style={{ ...card, padding: 40, textAlign: "center" }}>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", margin: 0 }}>
              Select or add a brand from the sidebar to manage prompt campaigns.
            </p>
          </div>
        )}

        {projectId && (
          <>
            {/* Action bar */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", margin: 0 }}>
                Track how AI engines mention <strong style={{ color: "#fff" }}>{project?.brandName}</strong> across your prompts.
              </p>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => setShowAudit(true)}
                  className="btn-ghost"
                  style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 14px", fontSize: 12.5, cursor: "pointer" }}
                >
                  <Sparkles size={14} /> Run Audit
                </button>
                <button
                  onClick={() => setShowCreate(true)}
                  className="btn-lime"
                  style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", fontSize: 12.5, cursor: "pointer" }}
                >
                  <Plus size={15} /> New Campaign
                </button>
              </div>
            </div>

            {/* Notices */}
            {notice && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 14px", borderRadius: 10, background: "rgba(201,243,29,0.07)", border: "1px solid rgba(201,243,29,0.22)" }}>
                <CheckCircle2 size={15} style={{ color: LIME, flexShrink: 0 }} />
                <span style={{ fontSize: 12.5, color: "rgba(255,255,255,0.75)", flex: 1 }}>{notice}</span>
                <Link href="/overview" style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11.5, fontWeight: 600, color: LIME, textDecoration: "none" }}>
                  View Overview <ArrowRight size={12} />
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

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
              {stats.map(({ label, value, icon: Icon, color }) => (
                <div key={label} style={{ ...card, padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)" }}>{label}</span>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon size={14} style={{ color }} />
                    </div>
                  </div>
                  <span style={{ fontSize: 24, fontWeight: 700, color: "#fff", lineHeight: 1 }}>
                    {loading ? "—" : value}
                  </span>
                </div>
              ))}
            </div>

            {/* Campaigns */}
            <div style={{ ...card, padding: 20 }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: "#fff", margin: "0 0 14px" }}>Campaigns</h3>

              {loading ? (
                <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.4)", padding: "20px 0", textAlign: "center" }}>Loading…</p>
              ) : campaigns.length === 0 ? (
                <div style={{ textAlign: "center", padding: "28px 0" }}>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", margin: "0 0 14px" }}>
                    No campaigns yet. Create one and hit “Run now” to query live AI engines for real visibility data.
                  </p>
                  <button onClick={() => setShowCreate(true)} className="btn-lime" style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 16px", fontSize: 12.5, cursor: "pointer" }}>
                    <Plus size={15} /> New Campaign
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {campaigns.map((c) => {
                    const isRunning = running.has(c._id);
                    return (
                      <div key={c._id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 10, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 13.5, fontWeight: 600, color: "#fff" }}>{c.name}</span>
                            <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 5, textTransform: "capitalize", background: c.isActive ? "rgba(34,197,94,0.12)" : "rgba(255,255,255,0.08)", color: c.isActive ? "#22C55E" : "rgba(255,255,255,0.5)" }}>
                              {c.isActive ? "Active" : "Paused"}
                            </span>
                          </div>
                          <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.4)", margin: "4px 0 0" }}>
                            {c.prompts?.length ?? 0} prompts · {c.frequency} · next run {timeAgo(c.nextRunAt)}
                          </p>
                        </div>

                        <button
                          onClick={() => handleRun(c)}
                          disabled={isRunning}
                          style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 13px", borderRadius: 8, border: "none", cursor: isRunning ? "default" : "pointer", background: "rgba(201,243,29,0.12)", color: LIME, fontSize: 12, fontWeight: 600 }}
                        >
                          {isRunning ? <><Loader2 size={13} className="auth-spin" /> Running…</> : <><Play size={13} /> Run now</>}
                        </button>
                        <button onClick={() => handleToggle(c)} title={c.isActive ? "Pause" : "Resume"} style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {c.isActive ? <Pause size={13} style={{ color: "rgba(255,255,255,0.6)" }} /> : <Play size={13} style={{ color: "rgba(255,255,255,0.6)" }} />}
                        </button>
                        <button onClick={() => handleDelete(c)} title="Delete" style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Trash2 size={13} style={{ color: "#EF4444" }} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recent runs */}
            <div style={{ ...card, padding: 20 }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: "#fff", margin: "0 0 14px" }}>Recent Runs</h3>
              {runs.length === 0 ? (
                <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.4)", padding: "16px 0", textAlign: "center" }}>
                  No runs yet — hit “Run now” on a campaign.
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 160px 90px", gap: 12, padding: "0 4px 10px", borderBottom: "1px solid rgba(255,255,255,0.06)", fontSize: 10.5, fontWeight: 600, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    <span>Prompt</span><span>Status</span><span>Engines</span><span>Time</span>
                  </div>
                  {runs.slice(0, 12).map((r) => {
                    const st = STATUS[r.status] ?? STATUS.pending;
                    return (
                      <div key={r._id} style={{ display: "grid", gridTemplateColumns: "1fr 120px 160px 90px", gap: 12, padding: "11px 4px", borderBottom: "1px solid rgba(255,255,255,0.04)", alignItems: "center" }}>
                        <span style={{ fontSize: 12.5, color: "rgba(255,255,255,0.8)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.promptText}</span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 600, color: st.color }}>
                          {r.status === "running" ? <Loader2 size={11} className="auth-spin" /> : r.status === "completed" ? <CheckCircle2 size={11} /> : r.status === "failed" ? <XCircle size={11} /> : <Clock size={11} />}
                          {st.label}
                        </span>
                        <span style={{ display: "flex", gap: 4 }}>
                          {(r.responses ?? []).length === 0 ? (
                            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>—</span>
                          ) : (
                            (r.responses ?? []).map((resp, i) => (
                              <span key={i} title={resp.model} style={{ width: 18, height: 18, borderRadius: 5, fontSize: 8, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", background: `${engineColors[resp.model] ?? "#888"}22`, color: engineColors[resp.model] ?? "#aaa" }}>
                                {resp.model.slice(0, 2).toUpperCase()}
                              </span>
                            ))
                          )}
                        </span>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{timeAgo(r.createdAt)}</span>
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
