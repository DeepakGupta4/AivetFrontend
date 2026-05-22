"use client";

import { Check } from "lucide-react";

export const LIME = "#C9F31D";

// ── Wizard-internal row types (selection state layered on the API DTOs) ──────
export interface CompetitorRow { brandName: string; domain: string; selected: boolean }
export interface PromptRow { text: string; selected: boolean }
export interface ClusterRow { topic: string; prompts: PromptRow[] }
export interface KeywordRow {
  keyword: string;
  searchVolume: number;
  searchVolumeLabel: string;
  difficulty: number;
  market: string;
  selected: boolean;
}

/** Two-letter country code → flag emoji (regional indicator symbols). */
export function flagEmoji(countryCode?: string): string {
  const code = (countryCode || "").toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) return "🌐";
  return String.fromCodePoint(...[...code].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}

/** "EN-IN" style market tag with a flag. */
export function MarketTag({ market, countryCode }: { market?: string; countryCode?: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
      <span style={{ fontSize: 15, lineHeight: 1 }}>{flagEmoji(countryCode)}</span>
      {market || "—"}
    </span>
  );
}

/** Square checkbox matching the dark/lime theme. */
export function Checkbox({ checked, onChange, disabled }: { checked: boolean; onChange?: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      aria-pressed={checked}
      style={{
        width: 20, height: 20, flexShrink: 0, borderRadius: 6,
        border: `1.5px solid ${checked ? LIME : "rgba(255,255,255,0.22)"}`,
        background: checked ? LIME : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: disabled ? "not-allowed" : "pointer", padding: 0,
        opacity: disabled ? 0.4 : 1, transition: "all .12s ease",
      }}
    >
      {checked && <Check size={13} strokeWidth={3} style={{ color: "#000" }} />}
    </button>
  );
}

/** Section card with a title, optional helper, and edit affordance. */
export function SectionCard({
  title, hint, children, right,
}: { title: string; hint?: string; children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="card" style={{ padding: 18 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: "#fff", margin: 0 }}>{title}</h3>
        {right}
      </div>
      {hint && <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: "0 0 12px" }}>{hint}</p>}
      {children}
    </div>
  );
}
