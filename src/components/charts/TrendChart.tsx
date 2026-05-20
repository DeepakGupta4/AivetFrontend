"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import type { TrendPoint } from "@/types";

interface TrendChartProps {
  data: TrendPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#18191B",
      border: "1px solid rgba(255,255,255,0.12)",
      borderRadius: 8,
      padding: "8px 12px",
      fontSize: 12,
      color: "#fff",
    }}>
      <p style={{ color: "rgba(255,255,255,0.50)", marginBottom: 4, fontWeight: 500 }}>{label}</p>
      <p style={{ marginBottom: 2 }}>
        Score:{" "}
        <span style={{ color: "#C9F31D", fontWeight: 600 }}>{payload[0]?.value}</span>
      </p>
      {payload[1] && (
        <p>
          Mentions:{" "}
          <span style={{ color: "#22B8CF", fontWeight: 600 }}>{payload[1]?.value}</span>
        </p>
      )}
    </div>
  );
};

export default function TrendChart({ data }: TrendChartProps) {
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
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexShrink: 0 }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: "#fff", margin: 0 }}>
          Visibility Trend
        </h3>
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 11, color: "rgba(255,255,255,0.50)" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#C9F31D", display: "inline-block" }} />
            Score
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22B8CF", display: "inline-block" }} />
            Mentions
          </span>
        </div>
      </div>

      {/* Chart */}
      <div style={{ flex: 1, minHeight: 0, height: 210 }}>
        <ResponsiveContainer width="100%" height={210}>
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#C9F31D" stopOpacity={0.28} />
                <stop offset="95%" stopColor="#C9F31D" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="mentionGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#22B8CF" stopOpacity={0.22} />
                <stop offset="95%" stopColor="#22B8CF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="score"
              stroke="#C9F31D"
              strokeWidth={2}
              fill="url(#scoreGrad)"
              dot={false}
              activeDot={{ r: 4, fill: "#C9F31D", strokeWidth: 0 }}
            />
            <Area
              type="monotone"
              dataKey="mentions"
              stroke="#22B8CF"
              strokeWidth={2}
              fill="url(#mentionGrad)"
              dot={false}
              activeDot={{ r: 4, fill: "#22B8CF", strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
