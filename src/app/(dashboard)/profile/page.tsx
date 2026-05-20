"use client";

import { useState } from "react";
import Topbar from "@/components/shared/Topbar";
import { useAuthStore } from "@/lib/stores/authStore";
import { authApi } from "@/lib/api/auth";
import { getInitials } from "@/lib/utils";
import { Loader2, CheckCircle2, AlertCircle, Mail } from "lucide-react";

const LIME = "#C9F31D";
const card: React.CSSProperties = { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 };
const label: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.60)", marginBottom: 7 };

export default function ProfilePage() {
  const token   = useAuthStore((s) => s.token);
  const user    = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);

  const [fullName, setFullName] = useState(user?.full_name ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim() || !token) return;
    setSaving(true); setSaved(false); setError(null);
    try {
      const updated = await authApi.updateProfile({ fullName: fullName.trim() });
      setAuth(token, { id: updated.id, email: updated.email, full_name: updated.fullName, avatar_url: updated.avatarUrl });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ background: "#0E0F11", minHeight: "100vh" }}>
      <Topbar title="Profile" subtitle="Your personal details" />
      <div style={{ padding: 24 }}>
        <form onSubmit={save} style={{ ...card, padding: 24, maxWidth: 560 }}>
          {/* Avatar */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
            <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(201,243,29,0.15)", color: LIME, fontSize: 24, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {getInitials(fullName || user?.email || "?")}
            </div>
            <div>
              <p style={{ fontSize: 16, fontWeight: 700, color: "#fff", margin: 0 }}>{fullName || "—"}</p>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", margin: "2px 0 0" }}>{user?.email}</p>
            </div>
          </div>

          {error && <div style={{ display: "flex", gap: 8, alignItems: "center", padding: "10px 12px", borderRadius: 10, fontSize: 12.5, marginBottom: 14, background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.25)", color: "#EF4444" }}><AlertCircle size={15} />{error}</div>}

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={label}>Full name</label>
              <input className="auth-input" style={{ padding: "11px 13px" }} value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" />
            </div>
            <div>
              <label style={label}>Email</label>
              <div style={{ position: "relative" }}>
                <Mail size={15} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.35)" }} />
                <input className="auth-input" style={{ padding: "11px 13px 11px 38px", opacity: 0.6, cursor: "not-allowed" }} value={user?.email ?? ""} readOnly />
              </div>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", margin: "6px 0 0" }}>Email is used to sign in and can&apos;t be changed here.</p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 22 }}>
            <button type="submit" disabled={saving} className="btn-lime" style={{ padding: "10px 20px", fontSize: 13, display: "flex", alignItems: "center", gap: 7, cursor: saving ? "not-allowed" : "pointer" }}>
              {saving ? <><Loader2 size={14} className="auth-spin" /> Saving…</> : "Save changes"}
            </button>
            {saved && <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, color: "#22C55E" }}><CheckCircle2 size={14} /> Saved</span>}
          </div>
        </form>
      </div>
    </div>
  );
}
