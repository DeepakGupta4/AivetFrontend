"use client";

import { useCallback, useEffect, useState } from "react";
import Topbar from "@/components/shared/Topbar";
import { useAuthStore } from "@/lib/stores/authStore";
import { projectsApi } from "@/lib/api/projects";
import { teamApi, type TeamData } from "@/lib/api/team";
import {
  FolderOpen, Users, Key, Bell, CheckCircle2, Copy, Loader2, AlertCircle,
} from "lucide-react";

const LIME = "#C9F31D";
const card: React.CSSProperties = { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 };
const labelStyle: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.60)", marginBottom: 7 };

const TABS = [
  { key: "project", label: "Project", icon: FolderOpen },
  { key: "team", label: "Team", icon: Users },
  { key: "api", label: "API & Access", icon: Key },
  { key: "notifications", label: "Notifications", icon: Bell },
] as const;

const NOTIF_PREFS = [
  { key: "weekly_report", label: "Weekly visibility report", desc: "Emailed summary every Monday" },
  { key: "score_drop", label: "Score drop alerts", desc: "When your visibility score falls sharply" },
  { key: "competitor", label: "Competitor movement", desc: "When a competitor overtakes you" },
  { key: "campaign_done", label: "Campaign completed", desc: "When a prompt campaign finishes running" },
];

const ROLE_STYLE: Record<string, { bg: string; color: string }> = {
  owner: { bg: "rgba(201,243,29,0.12)", color: LIME },
  admin: { bg: "rgba(34,184,207,0.12)", color: "#22B8CF" },
  member: { bg: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" },
};

export default function SettingsPage() {
  const project   = useAuthStore((s) => s.project);
  const projectId = useAuthStore((s) => s.projectId);
  const user      = useAuthStore((s) => s.user);
  const setProject = useAuthStore((s) => s.setProject);

  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("project");

  // Project form
  const [name, setName] = useState(project?.name ?? "");
  const [brandName, setBrandName] = useState(project?.brandName ?? "");
  const [domain, setDomain] = useState(project?.domain ?? "");
  const [industry, setIndustry] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName(project?.name ?? "");
    setBrandName(project?.brandName ?? "");
    setDomain(project?.domain ?? "");
  }, [project]);

  // Team
  const [team, setTeam] = useState<TeamData | null>(null);
  const loadTeam = useCallback(async () => {
    try { setTeam(await teamApi.get()); } catch { /* ignore */ }
  }, []);
  useEffect(() => { loadTeam(); }, [loadTeam]);

  // Notifications (local prefs)
  const [notifs, setNotifs] = useState<Record<string, boolean>>({});
  useEffect(() => {
    if (typeof window === "undefined") return;
    try { setNotifs(JSON.parse(localStorage.getItem("aivet-notif-prefs") ?? "{}")); } catch { /* ignore */ }
  }, []);
  const toggleNotif = (key: string) => {
    setNotifs((prev) => {
      const next = { ...prev, [key]: !(prev[key] ?? true) };
      if (typeof window !== "undefined") localStorage.setItem("aivet-notif-prefs", JSON.stringify(next));
      return next;
    });
  };

  const [copied, setCopied] = useState<string | null>(null);
  const copy = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  async function saveProject(e: React.FormEvent) {
    e.preventDefault();
    if (!projectId) return;
    setSaving(true); setSaved(false); setError(null);
    try {
      const updated = await projectsApi.update(projectId, {
        name: name.trim(),
        brandName: brandName.trim(),
        domain: domain.trim(),
        industry: industry.trim() || undefined,
      });
      setProject({ id: updated._id, name: updated.name, domain: updated.domain, brandName: updated.brandName });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

  return (
    <div style={{ background: "#0E0F11", minHeight: "100vh" }}>
      <Topbar title="Settings" subtitle={project ? `${project.name} · ${project.domain}` : "Manage your workspace"} />

      <div style={{ padding: 24, display: "flex", gap: 20, alignItems: "flex-start" }}>

        {/* Tab nav */}
        <div style={{ width: 200, flexShrink: 0, display: "flex", flexDirection: "column", gap: 4 }}>
          {TABS.map(({ key, label, icon: Icon }) => {
            const active = tab === key;
            return (
              <button key={key} onClick={() => setTab(key)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 9, border: "none", cursor: "pointer", textAlign: "left", fontSize: 13, fontWeight: active ? 600 : 500, background: active ? "rgba(201,243,29,0.10)" : "transparent", color: active ? LIME : "rgba(255,255,255,0.6)" }}>
                <Icon size={15} /> {label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {!projectId && tab === "project" ? (
            <div style={{ ...card, padding: 40, textAlign: "center" }}>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", margin: 0 }}>Select or add a brand from the sidebar.</p>
            </div>
          ) : tab === "project" ? (
            <form onSubmit={saveProject} style={{ ...card, padding: 24, maxWidth: 560 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: "#fff", margin: "0 0 4px" }}>Project details</h3>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: "0 0 20px" }}>The brand AIVet tracks across AI engines.</p>

              {error && <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "10px 12px", borderRadius: 10, fontSize: 12.5, marginBottom: 14, background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.25)", color: "#EF4444" }}><AlertCircle size={15} />{error}</div>}

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div><label style={labelStyle}>Project name</label><input className="auth-input" style={{ padding: "11px 13px" }} value={name} onChange={(e) => setName(e.target.value)} /></div>
                <div><label style={labelStyle}>Brand name</label><input className="auth-input" style={{ padding: "11px 13px" }} value={brandName} onChange={(e) => setBrandName(e.target.value)} /></div>
                <div><label style={labelStyle}>Website domain</label><input className="auth-input" style={{ padding: "11px 13px" }} value={domain} onChange={(e) => setDomain(e.target.value)} /></div>
                <div><label style={labelStyle}>Industry <span style={{ color: "rgba(255,255,255,0.3)" }}>(optional)</span></label><input className="auth-input" style={{ padding: "11px 13px" }} value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="B2B SaaS" /></div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 22 }}>
                <button type="submit" disabled={saving} className="btn-lime" style={{ padding: "10px 20px", fontSize: 13, display: "flex", alignItems: "center", gap: 7, cursor: saving ? "not-allowed" : "pointer" }}>
                  {saving ? <><Loader2 size={14} className="auth-spin" /> Saving…</> : "Save changes"}
                </button>
                {saved && <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, color: "#22C55E" }}><CheckCircle2 size={14} /> Saved</span>}
              </div>
            </form>
          ) : tab === "team" ? (
            <div style={{ ...card, overflow: "hidden", maxWidth: 680 }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: "#fff", margin: 0 }}>{team?.name ?? "Team"}</h3>
                  <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.4)", margin: "2px 0 0" }}>{team?.members.length ?? 0} member(s) · <span style={{ textTransform: "capitalize" }}>{team?.plan ?? "free"}</span> plan</p>
                </div>
              </div>
              <div>
                {(team?.members ?? []).map((m, i) => {
                  const rs = ROLE_STYLE[m.role] ?? ROLE_STYLE.member;
                  return (
                    <div key={m.userId} style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 20px", borderBottom: i < (team?.members.length ?? 0) - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(201,243,29,0.15)", color: LIME, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {(m.fullName || m.email || "?").charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#fff", margin: 0 }}>{m.fullName}</p>
                        <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.4)", margin: 0 }}>{m.email}</p>
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 20, textTransform: "capitalize", background: rs.bg, color: rs.color }}>{m.role}</span>
                    </div>
                  );
                })}
                {!team && <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.4)", padding: "18px 20px", textAlign: "center" }}>Loading team…</p>}
              </div>
            </div>
          ) : tab === "api" ? (
            <div style={{ ...card, padding: 24, maxWidth: 620 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: "#fff", margin: "0 0 4px" }}>API &amp; Access</h3>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: "0 0 20px" }}>Reference details for integrating with the AIVet API.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[{ label: "API base URL", value: apiBase, id: "api" }, { label: "Project ID", value: projectId ?? "—", id: "pid" }, { label: "Account email", value: user?.email ?? "—", id: "email" }].map((row) => (
                  <div key={row.id}>
                    <label style={labelStyle}>{row.label}</label>
                    <div style={{ display: "flex", gap: 8 }}>
                      <input readOnly className="auth-input" style={{ padding: "11px 13px", flex: 1, fontFamily: "monospace", fontSize: 12 }} value={row.value} />
                      <button type="button" onClick={() => copy(row.value, row.id)} className="btn-ghost" style={{ padding: "0 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                        {copied === row.id ? <CheckCircle2 size={14} style={{ color: "#22C55E" }} /> : <Copy size={14} />} {copied === row.id ? "Copied" : "Copy"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.35)", margin: "16px 0 0" }}>Authenticate requests with your session token via the <code style={{ color: "rgba(255,255,255,0.6)" }}>Authorization: Bearer</code> header.</p>
            </div>
          ) : (
            <div style={{ ...card, overflow: "hidden", maxWidth: 620 }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: "#fff", margin: 0 }}>Notification preferences</h3>
                <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.4)", margin: "2px 0 0" }}>Saved on this device.</p>
              </div>
              <div>
                {NOTIF_PREFS.map((n, i) => {
                  const on = notifs[n.key] ?? true;
                  return (
                    <div key={n.key} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 20px", borderBottom: i < NOTIF_PREFS.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#fff", margin: 0 }}>{n.label}</p>
                        <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.4)", margin: "2px 0 0" }}>{n.desc}</p>
                      </div>
                      <button onClick={() => toggleNotif(n.key)} style={{ width: 40, height: 22, borderRadius: 20, border: "none", cursor: "pointer", padding: 2, background: on ? LIME : "rgba(255,255,255,0.15)", transition: "background .15s", display: "flex", justifyContent: on ? "flex-end" : "flex-start" }}>
                        <span style={{ width: 18, height: 18, borderRadius: "50%", background: on ? "#000" : "#fff", display: "block" }} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
