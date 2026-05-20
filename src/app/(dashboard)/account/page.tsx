"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Topbar from "@/components/shared/Topbar";
import { useAuthStore } from "@/lib/stores/authStore";
import { useTier } from "@/lib/hooks/useTier";
import { teamApi, type TeamData } from "@/lib/api/team";
import { authApi } from "@/lib/api/auth";
import { TIER_LABEL } from "@/lib/tiers";
import { Crown, Users, Shield, LogOut, ArrowRight, CreditCard } from "lucide-react";

const LIME = "#C9F31D";
const card: React.CSSProperties = { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 };

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <span style={{ fontSize: 12.5, color: "rgba(255,255,255,0.5)" }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{value}</span>
    </div>
  );
}

export default function AccountPage() {
  const router = useRouter();
  const user   = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { tier, limits, usage } = useTier();

  const [team, setTeam] = useState<TeamData | null>(null);
  const [memberSince, setMemberSince] = useState<string | null>(null);

  useEffect(() => {
    teamApi.get().then(setTeam).catch(() => {});
    authApi.me().then((m) => setMemberSince(m.createdAt ?? null)).catch(() => {});
  }, []);

  const signOut = () => { logout(); router.replace("/login"); };
  const fmt = (d?: string | null) => (d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—");

  return (
    <div style={{ background: "#0E0F11", minHeight: "100vh" }}>
      <Topbar title="Account" subtitle="Plan, workspace & security" />
      <div style={{ padding: 24, display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, maxWidth: 900 }}>

        {/* Plan */}
        <div style={{ ...card, padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(201,243,29,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}><Crown size={16} style={{ color: LIME }} /></div>
            <h3 style={{ fontSize: 13.5, fontWeight: 600, color: "#fff", margin: 0 }}>Plan</h3>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 26, fontWeight: 800, color: "#fff", textTransform: "capitalize" }}>{TIER_LABEL[tier]}</span>
            <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "rgba(34,197,94,0.14)", color: "#22C55E" }}>ACTIVE</span>
          </div>
          {limits && (
            <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.5)", margin: "0 0 14px" }}>
              {usage?.promptsUsed ?? 0} / {limits.promptLimit.toLocaleString()} prompts · {usage?.projectsUsed ?? 0} / {limits.projectLimit} projects
            </p>
          )}
          <Link href="/billing" style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, color: LIME, textDecoration: "none" }}>
            <CreditCard size={14} /> Manage billing <ArrowRight size={13} />
          </Link>
        </div>

        {/* Workspace */}
        <div style={{ ...card, padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(34,184,207,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}><Users size={16} style={{ color: "#22B8CF" }} /></div>
            <h3 style={{ fontSize: 13.5, fontWeight: 600, color: "#fff", margin: 0 }}>Workspace</h3>
          </div>
          <Row label="Team" value={team?.name ?? "—"} />
          <Row label="Members" value={team?.members.length ?? "—"} />
          <Row label="Your role" value={<span style={{ textTransform: "capitalize" }}>{team?.members.find((m) => m.email === user?.email)?.role ?? "member"}</span>} />
        </div>

        {/* Security */}
        <div style={{ ...card, padding: 20, gridColumn: "1 / -1" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(192,132,252,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}><Shield size={16} style={{ color: "#C084FC" }} /></div>
            <h3 style={{ fontSize: 13.5, fontWeight: 600, color: "#fff", margin: 0 }}>Security</h3>
          </div>
          <Row label="Email" value={user?.email ?? "—"} />
          <Row label="Member since" value={fmt(memberSince)} />
          <div style={{ marginTop: 16 }}>
            <button onClick={signOut} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 9, background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.25)", color: "#EF4444", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
