"use client";

import { useState } from "react";
import { Plus, Loader2, BarChart3 } from "lucide-react";
import { LIME, MarketTag, Checkbox, type KeywordRow } from "./shared";

interface Props {
  keywords: KeywordRow[];
  setKeywords: (k: KeywordRow[]) => void;
  loading: boolean;
  market: string;
  countryCode: string;
}

function diffColor(d: number): string {
  if (d >= 70) return "#EF4444";
  if (d >= 45) return "#F59E0B";
  if (d >= 25) return LIME;
  return "#22C55E";
}

export default function KeywordsStep({ keywords, setKeywords, loading, market, countryCode }: Props) {
  const [draft, setDraft] = useState("");
  const selectedCount = keywords.filter((k) => k.selected).length;

  const toggle = (i: number) =>
    setKeywords(keywords.map((k, idx) => (idx === i ? { ...k, selected: !k.selected } : k)));

  const add = () => {
    const kw = draft.trim();
    if (!kw || keywords.some((k) => k.keyword.toLowerCase() === kw.toLowerCase())) { setDraft(""); return; }
    setKeywords([{ keyword: kw, searchVolume: 0, searchVolumeLabel: "—", difficulty: 0, market, selected: true }, ...keywords]);
    setDraft("");
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: "80px 0", color: "rgba(255,255,255,0.55)" }}>
        <Loader2 size={26} className="auth-spin" style={{ color: LIME }} />
        <p style={{ fontSize: 13.5 }}>Fetching keyword data…</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
      <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.50)", marginBottom: 12 }}>
        {selectedCount}/{keywords.length} keywords selected
      </p>

      <div className="card" style={{ overflow: "hidden" }}>
        {/* header */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 130px 140px 110px", alignItems: "center", padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)", fontSize: 11.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "rgba(255,255,255,0.50)" }}>
          <span>Keyword</span>
          <span>Search Volume</span>
          <span>SEO Difficulty</span>
          <span>Market</span>
        </div>

        {/* add row */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <Plus size={16} style={{ color: "rgba(255,255,255,0.35)", flexShrink: 0 }} />
          <input className="auth-input" style={{ padding: "8px 10px", border: "none", background: "transparent", boxShadow: "none" }}
            value={draft} onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
            placeholder="Type to add a keyword manually" />
        </div>

        {/* rows */}
        {keywords.length === 0 ? (
          <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.40)", padding: "18px 16px" }}>
            No keyword data available for this domain yet. You can add keywords manually above, or skip.
          </p>
        ) : (
          keywords.map((k, i) => (
            <div key={k.keyword + i}
              onClick={() => toggle(i)}
              style={{ display: "grid", gridTemplateColumns: "1fr 130px 140px 110px", alignItems: "center", gap: 8, padding: "12px 16px", cursor: "pointer", borderBottom: i < keywords.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                <span style={{ pointerEvents: "none" }}><Checkbox checked={k.selected} /></span>
                <span style={{ fontSize: 13.5, color: k.selected ? "#fff" : "rgba(255,255,255,0.70)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{k.keyword}</span>
              </div>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.80)" }}>{k.searchVolumeLabel}</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13, color: diffColor(k.difficulty) }}>
                <BarChart3 size={14} />{k.difficulty || "—"}
              </span>
              <MarketTag market={k.market || market} countryCode={countryCode} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
