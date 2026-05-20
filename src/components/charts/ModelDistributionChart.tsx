"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { engineColors } from "@/lib/colors";
import type { ModelDistribution } from "@/types";

interface ModelChartProps {
  data: ModelDistribution[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const color = engineColors[label?.toLowerCase()] || "#C9F31D";
  return (
    <div style={{
      background: "#18191B",
      border: "1px solid rgba(255,255,255,0.12)",
      borderRadius: 8,
      padding: "8px 12px",
      fontSize: 12,
      color: "#fff",
    }}>
      <p style={{ fontWeight: 600, marginBottom: 4, color, textTransform: "capitalize" }}>{label}</p>
      <p style={{ color: "rgba(255,255,255,0.65)" }}>
        Score: <span style={{ color: "#fff", fontWeight: 600 }}>{payload[0].value}</span>
      </p>
    </div>
  );
};

export default function ModelDistributionChart({ data }: ModelChartProps) {
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
        Visibility by AI Model
      </h3>

      <div style={{ flex: 1, minHeight: 0, height: 200 }}>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} barSize={32} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis
              dataKey="model"
              tick={{ fill: "rgba(255,255,255,0.40)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => v.charAt(0).toUpperCase() + v.slice(1)}
            />
            <YAxis
              tick={{ fill: "rgba(255,255,255,0.40)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              domain={[0, 100]}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
            <Bar dataKey="score" radius={[5, 5, 0, 0]}>
              {data.map((entry) => (
                <Cell
                  key={entry.model}
                  fill={engineColors[entry.model] || "#C9F31D"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
