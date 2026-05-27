"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Eye, Zap, Users2, Link2, Sparkles,
  FileText, CreditCard, Settings, Bot, LogOut, Lock,
  User, Shield, HelpCircle, ArrowRight, ChevronUp,
} from "lucide-react";
import { useAuthStore } from "@/lib/stores/authStore";
import { useTier } from "@/lib/hooks/useTier";
import { getInitials } from "@/lib/utils";
import { TIER_LABEL, NEXT_TIER } from "@/lib/tiers";
import ProjectSwitcher from "./ProjectSwitcher";

const LIME = "#C9F31D";

type NavItem = { href: string; icon: typeof Eye; label: string; feature?: string };

// Primary product navigation.
const MAIN_ITEMS: NavItem[] = [
  { href: "/overview",    icon: LayoutDashboard, label: "Overview" },
  { href: "/visibility",  icon: Eye,             label: "AI Visibility" },
  { href: "/prompts",     icon: Zap,             label: "Audits", feature: "prompts" },
  { href: "/competitors", icon: Users2,          label: "Competitors", feature: "competitors" },
  { href: "/citations",   icon: Link2,           label: "Citations", feature: "citations" },
  { href: "/geo",         icon: Sparkles,        label: "Recommendations", feature: "geo" },
  { href: "/reports",     icon: FileText,        label: "Reports", feature: "reports" },
];

// Workspace-level settings — kept separate from the product nav so the rail
// reads as two clean groups instead of one long jumbled list.
const WORKSPACE_ITEMS: NavItem[] = [
  { href: "/billing",  icon: CreditCard, label: "Billing" },
  { href: "/settings", icon: Settings,   label: "Settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();

  const user    = useAuthStore((s) => s.user);
  const logout  = useAuthStore((s) => s.logout);
  const { tier, allows } = useTier();

  const userName  = user?.full_name ?? "John Doe";
  const userEmail = user?.email ?? "john@acme.com";

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const handleLogout = () => { logout(); router.replace("/login"); };

  const navLinkStyle = (active: boolean): React.CSSProperties => ({
    display: "flex", alignItems: "center", gap: 11, padding: "9px 11px", borderRadius: 9,
    fontSize: 13, fontWeight: active ? 600 : 500, textDecoration: "none",
    background: active ? LIME : "transparent",
    color: active ? "#000" : "rgba(255,255,255,0.62)",
    transition: "background 0.15s ease, color 0.15s ease",
  });
  const hoverOn = (e: React.MouseEvent, active: boolean) => {
    if (!active) { const el = e.currentTarget as HTMLElement; el.style.background = "rgba(255,255,255,0.05)"; el.style.color = "#fff"; }
  };
  const hoverOff = (e: React.MouseEvent, active: boolean) => {
    if (!active) { const el = e.currentTarget as HTMLElement; el.style.background = "transparent"; el.style.color = "rgba(255,255,255,0.62)"; }
  };

  const sectionLabel: React.CSSProperties = {
    fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.28)",
    letterSpacing: "0.1em", textTransform: "uppercase", padding: "0 11px 8px",
  };

  const renderNav = (items: NavItem[]) =>
    items.map(({ href, icon: Icon, label, feature }) => {
      const active = isActive(href);
      const locked = !!feature && !allows(feature);
      return (
        <Link key={href} href={href} style={navLinkStyle(active)} onMouseEnter={(e) => hoverOn(e, active)} onMouseLeave={(e) => hoverOff(e, active)}>
          <Icon size={16} strokeWidth={active ? 2.5 : 2} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
          {locked && <Lock size={12} style={{ flexShrink: 0, color: active ? "#000" : "rgba(255,255,255,0.32)" }} />}
        </Link>
      );
    });

  return (
    <aside style={{ position: "fixed", top: 0, left: 0, width: "240px", height: "100vh", background: "#0E0F11", borderRight: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column", zIndex: 50, overflow: "hidden" }}>
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "20px 16px 16px", flexShrink: 0 }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: LIME, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Bot size={17} color="#000" strokeWidth={2.5} />
        </div>
        <span style={{ fontWeight: 700, fontSize: 16, color: "#fff", letterSpacing: "-0.3px" }}>AIVet</span>
        <span style={{ marginLeft: "auto", fontSize: 9.5, fontWeight: 800, padding: "3px 8px", borderRadius: 999, background: "rgba(201,243,29,0.12)", color: LIME, flexShrink: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {TIER_LABEL[tier]}
        </span>
      </div>

      {/* Project switcher */}
      <ProjectSwitcher />

      {/* Scrollable nav */}
      <nav style={{ flex: 1, padding: "16px 12px 12px", display: "flex", flexDirection: "column", overflowY: "auto", overflowX: "hidden" }}>
        <p style={sectionLabel}>Main</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>{renderNav(MAIN_ITEMS)}</div>

        <p style={{ ...sectionLabel, paddingTop: 24 }}>Workspace</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>{renderNav(WORKSPACE_ITEMS)}</div>
      </nav>

      {/* User menu */}
      <UserMenu
        userName={userName}
        userEmail={userEmail}
        tier={tier}
        onLogout={handleLogout}
      />
    </aside>
  );
}

/* ── User menu ───────────────────────────────────────────────────────────
 * A single account "pill" pinned to the bottom of the rail. Clicking it opens
 * an upward dropdown with Profile / Account / Help & Support / Upgrade / Sign
 * out — instead of stacking five dim links above the avatar, which read as one
 * cramped blob. Mirrors dixor's AivetUserDropdown. */
function UserMenu({
  userName, userEmail, tier, onLogout,
}: {
  userName: string; userEmail: string; tier: keyof typeof TIER_LABEL; onLogout: () => void;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  // Close on outside click + Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, [open]);

  // Close the menu whenever the route changes.
  useEffect(() => { setOpen(false); }, [pathname]);

  const menuLinks = [
    { href: "/profile", icon: User,       label: "Profile" },
    { href: "/account", icon: Shield,     label: "Account" },
    { href: "/support", icon: HelpCircle, label: "Help & Support" },
  ];

  const itemStyle: React.CSSProperties = {
    display: "flex", alignItems: "center", gap: 11, width: "100%",
    padding: "9px 11px", borderRadius: 8, border: "none", background: "transparent",
    color: "rgba(255,255,255,0.78)", fontSize: 13, fontWeight: 500,
    textDecoration: "none", cursor: "pointer", textAlign: "left",
  };
  const itemHoverOn  = (e: React.MouseEvent) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; };
  const itemHoverOff = (e: React.MouseEvent) => { (e.currentTarget as HTMLElement).style.background = "transparent"; };

  return (
    <div ref={wrapRef} style={{ position: "relative", padding: 12, borderTop: "1px solid rgba(255,255,255,0.08)", flexShrink: 0 }}>
      {/* Dropdown (opens upward) */}
      {open && (
        <div
          className="animate-fade-in"
          style={{
            position: "absolute", bottom: "calc(100% - 4px)", left: 12, right: 12,
            background: "#18191B", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 12,
            padding: 6, boxShadow: "0 -16px 40px rgba(0,0,0,0.5)", zIndex: 70,
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 10px 12px", borderBottom: "1px solid rgba(255,255,255,0.08)", marginBottom: 6 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(201,243,29,0.15)", color: LIME, fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {getInitials(userName)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#fff", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{userName}</p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{userEmail}</p>
            </div>
            <span style={{ fontSize: 9, fontWeight: 800, padding: "3px 7px", borderRadius: 999, background: "rgba(201,243,29,0.15)", color: LIME, flexShrink: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {TIER_LABEL[tier]}
            </span>
          </div>

          {menuLinks.map(({ href, icon: Icon, label }) => (
            <Link key={href} href={href} style={itemStyle} onMouseEnter={itemHoverOn} onMouseLeave={itemHoverOff}>
              <Icon size={15} style={{ flexShrink: 0, opacity: 0.85 }} />
              {label}
            </Link>
          ))}

          {NEXT_TIER[tier] && (
            <>
              <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "6px 4px" }} />
              <Link href="/pricing" style={{ ...itemStyle, color: LIME, fontWeight: 600 }} onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(201,243,29,0.08)"; }} onMouseLeave={itemHoverOff}>
                <Sparkles size={15} style={{ flexShrink: 0 }} />
                <span style={{ flex: 1 }}>Upgrade plan</span>
                <ArrowRight size={13} />
              </Link>
            </>
          )}

          <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "6px 4px" }} />
          <button onClick={onLogout} style={{ ...itemStyle, color: "#ff6b6b" }} onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,107,107,0.08)"; }} onMouseLeave={itemHoverOff}>
            <LogOut size={15} style={{ flexShrink: 0 }} />
            Sign out
          </button>
        </div>
      )}

      {/* Trigger */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 10,
          padding: "8px 10px", borderRadius: 10, cursor: "pointer", textAlign: "left",
          background: open ? "rgba(255,255,255,0.06)" : "transparent",
          border: "1px solid", borderColor: open ? "rgba(255,255,255,0.10)" : "transparent",
        }}
        onMouseEnter={(e) => { if (!open) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; }}
        onMouseLeave={(e) => { if (!open) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
      >
        <div style={{ width: 30, height: 30, borderRadius: "50%", background: "rgba(201,243,29,0.15)", color: LIME, fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          {getInitials(userName)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 12.5, fontWeight: 600, color: "#fff", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{userName}</p>
          <p style={{ fontSize: 10.5, color: "rgba(255,255,255,0.35)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{userEmail}</p>
        </div>
        <ChevronUp size={15} style={{ color: "rgba(255,255,255,0.4)", flexShrink: 0, transform: open ? "none" : "rotate(180deg)", transition: "transform .15s" }} />
      </button>
    </div>
  );
}
