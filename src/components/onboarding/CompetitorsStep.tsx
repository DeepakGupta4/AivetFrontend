"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import BrandLogo from "@/components/shared/BrandLogo";
import { MarketTag, Checkbox, type CompetitorRow } from "./shared";

interface Props {
  competitors: CompetitorRow[];
  setCompetitors: (c: CompetitorRow[]) => void;
  market: string;
  countryCode: string;
}

function cleanDomain(raw: string): string {
  return raw.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "");
}

export default function CompetitorsStep({ competitors, setCompetitors, market, countryCode }: Props) {
  const [draft, setDraft] = useState("");
  const selectedCount = competitors.filter((c) => c.selected).length;

  const toggle = (i: number) =>
    setCompetitors(competitors.map((c, idx) => (idx === i ? { ...c, selected: !c.selected } : c)));

  const remove = (i: number) => setCompetitors(competitors.filter((_, idx) => idx !== i));

  const add = () => {
    const domain = cleanDomain(draft);
    if (!domain || competitors.some((c) => c.domain === domain)) { setDraft(""); return; }
    const brandName = domain.split(".")[0].replace(/^\w/, (m) => m.toUpperCase());
    setCompetitors([{ brandName, domain, selected: true }, ...competitors]);
    setDraft("");
  };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.50)", marginBottom: 12 }}>
        {selectedCount}/{competitors.length} competitors selected
      </p>

      <div className="card" style={{ overflow: "hidden" }}>
        {/* header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Competitors</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Market</span>
        </div>

        {/* add row */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <Plus size={16} style={{ color: "rgba(255,255,255,0.35)", flexShrink: 0 }} />
          <input className="auth-input" style={{ padding: "8px 10px", border: "none", background: "transparent", boxShadow: "none" }}
            value={draft} onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
            placeholder="Type a competitor URL and press Enter" />
        </div>

        {/* rows */}
        {competitors.length === 0 ? (
          <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.40)", padding: "18px 16px" }}>
            No competitors suggested. Add some above, or skip this step.
          </p>
        ) : (
          competitors.map((c, i) => (
            <div key={c.domain + i} className="group"
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: i < competitors.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
              <Checkbox checked={c.selected} onChange={() => toggle(i)} />
              <BrandLogo domain={c.domain} name={c.brandName} size={26} radius={7} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13.5, fontWeight: 500, color: "#fff", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.domain}</p>
                {c.brandName && c.brandName.toLowerCase() !== c.domain.split(".")[0] && (
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.40)", margin: 0 }}>{c.brandName}</p>
                )}
              </div>
              <MarketTag market={market} countryCode={countryCode} />
              <button type="button" onClick={() => remove(i)} title="Remove"
                style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 4, flexShrink: 0 }}
                onMouseEnter={(e) => { (e.currentTarget.firstChild as HTMLElement).style.color = "#EF4444"; }}
                onMouseLeave={(e) => { (e.currentTarget.firstChild as HTMLElement).style.color = "rgba(255,255,255,0.3)"; }}>
                <Trash2 size={14} style={{ color: "rgba(255,255,255,0.3)", transition: "color .15s" }} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
