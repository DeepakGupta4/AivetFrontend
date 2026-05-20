"use client";

import { useState } from "react";
import { Bell, Search, Calendar, ChevronDown, Check, X } from "lucide-react";

export interface NotificationItem {
  text: string;
  time: string;
  color?: string;
}

interface TopbarProps {
  title: string;
  subtitle?: string;
  /** Controlled date-range window in days. When provided with onDaysChange, the picker becomes interactive. */
  days?: number;
  onDaysChange?: (days: number) => void;
  /** Controlled search box. */
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  /** Notification feed shown in the bell dropdown. */
  notifications?: NotificationItem[];
}

const RANGES = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
];

const ctrl: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "6px 12px",
  borderRadius: 8,
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.08)",
};

export default function Topbar({
  title,
  subtitle,
  days = 30,
  onDaysChange,
  search,
  onSearchChange,
  searchPlaceholder = "Search…",
  notifications,
}: TopbarProps) {
  const [menu, setMenu] = useState<null | "date" | "notif">(null);
  const close = () => setMenu(null);

  const rangeLabel = RANGES.find((r) => r.days === days)?.label ?? `Last ${days} days`;
  const unread = notifications?.length ?? 0;

  return (
    <header
      style={{
        height: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        position: "sticky",
        top: 0,
        zIndex: 30,
        background: "rgba(14,15,17,0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        flexShrink: 0,
      }}
    >
      {/* Title */}
      <div>
        <h1 style={{ fontSize: 15, fontWeight: 600, color: "#fff", margin: 0, lineHeight: 1.3 }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.40)", margin: 0, marginTop: 1 }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Backdrop to close any open menu */}
      {menu && (
        <div
          onClick={close}
          style={{ position: "fixed", inset: 0, zIndex: 20 }}
        />
      )}

      {/* Right Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, position: "relative", zIndex: 25 }}>

        {/* Search */}
        <div style={ctrl}>
          <Search size={13} style={{ color: "rgba(255,255,255,0.40)", flexShrink: 0 }} />
          <input
            type="text"
            value={search ?? ""}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder={searchPlaceholder}
            disabled={!onSearchChange}
            style={{
              background: "transparent",
              border: "none",
              outline: "none",
              fontSize: 13,
              color: "rgba(255,255,255,0.85)",
              width: 150,
            }}
          />
          {search ? (
            <button
              onClick={() => onSearchChange?.("")}
              style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 0 }}
            >
              <X size={12} style={{ color: "rgba(255,255,255,0.40)" }} />
            </button>
          ) : null}
        </div>

        {/* Date Range */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => onDaysChange && setMenu(menu === "date" ? null : "date")}
            style={{
              ...ctrl,
              color: "rgba(255,255,255,0.70)",
              fontSize: 12,
              fontWeight: 500,
              cursor: onDaysChange ? "pointer" : "default",
            }}
          >
            <Calendar size={13} />
            {rangeLabel}
            <ChevronDown size={12} style={{ transform: menu === "date" ? "rotate(180deg)" : "none", transition: "transform .15s" }} />
          </button>

          {menu === "date" && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 6px)",
                right: 0,
                minWidth: 160,
                background: "#18191B",
                border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: 10,
                padding: 6,
                boxShadow: "0 12px 32px rgba(0,0,0,0.45)",
                zIndex: 30,
              }}
            >
              {RANGES.map((r) => {
                const active = r.days === days;
                return (
                  <button
                    key={r.days}
                    onClick={() => { onDaysChange?.(r.days); close(); }}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 10px",
                      borderRadius: 7,
                      border: "none",
                      cursor: "pointer",
                      fontSize: 12.5,
                      fontWeight: active ? 600 : 500,
                      background: active ? "rgba(201,243,29,0.10)" : "transparent",
                      color: active ? "#C9F31D" : "rgba(255,255,255,0.75)",
                    }}
                    onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}
                    onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                  >
                    {r.label}
                    {active && <Check size={13} />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setMenu(menu === "notif" ? null : "notif")}
            style={{
              position: "relative",
              width: 34,
              height: 34,
              borderRadius: 8,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <Bell size={14} style={{ color: "rgba(255,255,255,0.70)" }} />
            {unread > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: 7,
                  right: 7,
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#C9F31D",
                }}
              />
            )}
          </button>

          {menu === "notif" && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 6px)",
                right: 0,
                width: 300,
                background: "#18191B",
                border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: 10,
                boxShadow: "0 12px 32px rgba(0,0,0,0.45)",
                zIndex: 30,
                overflow: "hidden",
              }}
            >
              <div style={{ padding: "11px 14px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: "#fff" }}>Notifications</span>
              </div>
              <div style={{ maxHeight: 280, overflowY: "auto" }}>
                {unread === 0 ? (
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.40)", padding: "18px 14px", textAlign: "center", margin: 0 }}>
                    No new notifications
                  </p>
                ) : (
                  notifications!.map((n, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 10,
                        padding: "10px 14px",
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: n.color ?? "#C9F31D", marginTop: 5, flexShrink: 0 }} />
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.80)", margin: 0, lineHeight: 1.4 }}>{n.text}</p>
                        <p style={{ fontSize: 10.5, color: "rgba(255,255,255,0.30)", margin: "2px 0 0" }}>{n.time}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
