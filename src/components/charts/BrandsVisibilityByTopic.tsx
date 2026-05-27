"use client";

import BrandLogo from "@/components/shared/BrandLogo";
import { Lock } from "lucide-react";
import type { TopicRowDTO } from "@/lib/api/visibility";

const LIME = "#C9F31D";
const card: React.CSSProperties = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 12,
};

// Best-effort domain guess from a brand name so BrandLogo can fetch a real
// favicon. Falls back gracefully to a letter avatar when the guess misses.
function guessDomain(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "")
    + ".com";
}

const POSITIONS = [1, 2, 3, 4, 5, 6, 7, 8];

export default function BrandsVisibilityByTopic({
  topics,
  brandName,
  locked = 0,
}: {
  topics: TopicRowDTO[];
  brandName?: string;
  /** Hide brand positions past this index (Ubersuggest-style free-tier teaser). */
  locked?: number;
}) {
  if (topics.length === 0) {
    return (
      <div style={{ ...card, padding: 32, textAlign: "center" }}>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", margin: 0 }}>
          Run an audit to see how AI engines rank brands across your topics.
        </p>
      </div>
    );
  }

  return (
    <div style={{ ...card, overflow: "hidden" }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: "#fff", margin: 0 }}>Brands Visibility By Topic</h3>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.40)" }}>
          Top brands ranked across {topics.length} topic{topics.length === 1 ? "" : "s"}
        </span>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 1000 }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <th style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.40)", letterSpacing: "0.05em", textTransform: "uppercase", width: 280, minWidth: 240 }}>
                Topics
              </th>
              {POSITIONS.map((p) => (
                <th key={p} style={{ padding: "12px 8px", textAlign: "center", fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.40)", letterSpacing: "0.05em" }}>
                  #{p}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {topics.map((row, ri) => (
              <tr key={row.topic} style={{ borderBottom: ri < topics.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                <td style={{ padding: "14px 16px", verticalAlign: "middle" }}>
                  <p style={{ fontSize: 12.5, fontWeight: 500, color: "#fff", margin: 0, lineHeight: 1.4, maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={row.topic}>
                    {row.topic}
                  </p>
                  <p style={{ fontSize: 10.5, color: "rgba(255,255,255,0.35)", margin: "3px 0 0 0" }}>
                    {row.responses} response{row.responses === 1 ? "" : "s"}
                  </p>
                </td>
                {POSITIONS.map((pos, i) => {
                  const brand = row.brands[i];
                  const isLocked = locked > 0 && i >= locked;
                  return (
                    <td key={pos} style={{ padding: "14px 8px", textAlign: "center", verticalAlign: "middle" }}>
                      <BrandCell brand={brand} isLocked={isLocked} highlight={brand?.isOwn || isOwnByName(brand?.name, brandName)} />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {locked > 0 && (
        <div style={{ padding: "10px 20px", borderTop: "1px solid rgba(255,255,255,0.06)", fontSize: 11, color: "rgba(255,255,255,0.45)", textAlign: "center" }}>
          🔒 Free tier shows top {locked} brands per topic. <a href="/pricing" style={{ color: LIME, textDecoration: "none", fontWeight: 600 }}>Upgrade to see all 8</a>
        </div>
      )}
    </div>
  );
}

function isOwnByName(name?: string, brandName?: string) {
  if (!name || !brandName) return false;
  return name.toLowerCase() === brandName.toLowerCase();
}

function BrandCell({
  brand,
  isLocked,
  highlight,
}: {
  brand?: { name: string; mentions: number; avgRank: number | null };
  isLocked: boolean;
  highlight?: boolean;
}) {
  if (isLocked) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, opacity: 0.55 }}>
        <div style={{ width: 28, height: 28, borderRadius: 7, background: "rgba(255,255,255,0.06)", border: "1px dashed rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Lock size={12} style={{ color: "rgba(255,255,255,0.45)" }} />
        </div>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.30)" }}>Locked</span>
      </div>
    );
  }
  if (!brand) {
    return (
      <span style={{ fontSize: 10.5, color: "rgba(255,255,255,0.22)" }}>—</span>
    );
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <BrandLogo domain={guessDomain(brand.name)} name={brand.name} size={28} radius={7} fallbackBg={highlight ? LIME : "rgba(255,255,255,0.08)"} fallbackColor={highlight ? "#000" : "#fff"} />
      <span style={{ fontSize: 10.5, fontWeight: highlight ? 700 : 500, color: highlight ? LIME : "rgba(255,255,255,0.78)", maxWidth: 76, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={brand.name}>
        {brand.name}
      </span>
    </div>
  );
}
