"use client";

import { getScoreBand } from "@/lib/colors";
import type { CompetitorShare } from "@/types";

interface CompetitorChartProps {
  data: CompetitorShare[];
  brandName: string;
}

export default function CompetitorChart({ data, brandName }: CompetitorChartProps) {
  // Always show the brand, then the top competitors — capped so the fixed-height
  // card never overflows into the section below.
  const own = data.filter((d) => d.brand === brandName);
  const others = data.filter((d) => d.brand !== brandName);
  const rows = [...own, ...others].slice(0, 6);
  const max = Math.max(...rows.map((d) => d.score), 1);

  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 12,
      padding: 20,
      height: 280,
      display: "flex",
      flexDirection: "column",
    }}>
      <h3 style={{ fontSize: 13, fontWeight: 600, color: "#fff", margin: "0 0 16px 0", flexShrink: 0 }}>
        Competitor Visibility Share
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: 11, flex: 1, minHeight: 0, overflowY: "auto", justifyContent: "flex-start" }}>
        {rows.map((item) => {
          const band = getScoreBand(item.score);
          const isOwn = item.brand === brandName;
          const pct = (item.score / max) * 100;

          return (
            <div key={item.brand}>
              {/* Label row */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{
                    fontSize: 12,
                    fontWeight: isOwn ? 600 : 500,
                    color: isOwn ? "#C9F31D" : "rgba(255,255,255,0.80)",
                  }}>
                    {item.brand}
                  </span>
                  {isOwn && (
                    <span style={{
                      fontSize: 9,
                      fontWeight: 700,
                      padding: "2px 6px",
                      borderRadius: 20,
                      background: "rgba(201,243,29,0.12)",
                      color: "#C9F31D",
                      letterSpacing: "0.04em",
                    }}>
                      YOU
                    </span>
                  )}
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: band.color, fontVariantNumeric: "tabular-nums" }}>
                  {item.score}
                </span>
              </div>

              {/* Progress bar */}
              <div style={{
                height: 6,
                borderRadius: 3,
                background: "rgba(255,255,255,0.06)",
                overflow: "hidden",
              }}>
                <div style={{
                  height: "100%",
                  borderRadius: 3,
                  width: `${pct}%`,
                  background: isOwn
                    ? "linear-gradient(90deg, #C9F31D, #A8D017)"
                    : band.color,
                  opacity: isOwn ? 1 : 0.75,
                  transition: "width 0.8s ease",
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
