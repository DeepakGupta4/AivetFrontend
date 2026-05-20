"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  delta?: number;
  deltaLabel?: string;
  icon: LucideIcon;
  iconColor?: string;
  suffix?: string;
  loading?: boolean;
}

export default function KPICard({
  title,
  value,
  delta,
  deltaLabel = "vs last period",
  icon: Icon,
  iconColor = "#C9F31D",
  suffix,
  loading,
}: KPICardProps) {
  const isPositive = delta !== undefined && delta > 0;
  const isNegative = delta !== undefined && delta < 0;

  if (loading) {
    return (
      <div style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 12,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}>
        <div style={{ height: 14, width: 96, borderRadius: 6, background: "rgba(255,255,255,0.06)" }} />
        <div style={{ height: 32, width: 64, borderRadius: 6, background: "rgba(255,255,255,0.06)" }} />
        <div style={{ height: 12, width: 120, borderRadius: 6, background: "rgba(255,255,255,0.06)" }} />
      </div>
    );
  }

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 12,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        transition: "border-color 0.2s ease",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.15)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)";
      }}
    >
      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.55)" }}>
          {title}
        </span>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: `${iconColor}18`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon size={15} style={{ color: iconColor }} strokeWidth={2} />
        </div>
      </div>

      {/* Value */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 4 }}>
        <span
          style={{
            fontSize: 28,
            fontWeight: 700,
            lineHeight: 1,
            color: "#fff",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {typeof value === "number" ? formatNumber(value) : value}
        </span>
        {suffix && (
          <span style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.55)", marginBottom: 1 }}>
            {suffix}
          </span>
        )}
      </div>

      {/* Delta badge */}
      {delta !== undefined && (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              fontSize: 11,
              fontWeight: 600,
              padding: "2px 7px",
              borderRadius: 20,
              background: isPositive
                ? "rgba(34,197,94,0.12)"
                : isNegative
                ? "rgba(239,68,68,0.12)"
                : "rgba(255,255,255,0.06)",
              color: isPositive ? "#22C55E" : isNegative ? "#EF4444" : "rgba(255,255,255,0.40)",
            }}
          >
            {isPositive
              ? <TrendingUp size={10} />
              : isNegative
              ? <TrendingDown size={10} />
              : <Minus size={10} />}
            {isPositive ? "+" : ""}{delta}%
          </div>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
            {deltaLabel}
          </span>
        </div>
      )}
    </div>
  );
}
