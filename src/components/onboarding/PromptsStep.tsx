"use client";

import { useState } from "react";
import { ChevronRight, Plus, Loader2 } from "lucide-react";
import { LIME, MarketTag, Checkbox, type ClusterRow } from "./shared";

interface Props {
  clusters: ClusterRow[];
  setClusters: (c: ClusterRow[]) => void;
  active: number;
  setActive: (i: number) => void;
  loading: boolean;
  market: string;
  countryCode: string;
}

export default function PromptsStep({ clusters, setClusters, active, setActive, loading, market, countryCode }: Props) {
  const [draft, setDraft] = useState("");
  const totalSelected = clusters.reduce((n, c) => n + c.prompts.filter((p) => p.selected).length, 0);

  const togglePrompt = (ci: number, pi: number) =>
    setClusters(clusters.map((c, idx) =>
      idx !== ci ? c : { ...c, prompts: c.prompts.map((p, j) => (j === pi ? { ...p, selected: !p.selected } : p)) }));

  const addPrompt = (ci: number) => {
    const text = draft.trim();
    if (!text) return;
    setClusters(clusters.map((c, idx) =>
      idx !== ci ? c : { ...c, prompts: [{ text, selected: true }, ...c.prompts] }));
    setDraft("");
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: "80px 0", color: "rgba(255,255,255,0.55)" }}>
        <Loader2 size={26} className="auth-spin" style={{ color: LIME }} />
        <p style={{ fontSize: 13.5 }}>Generating prompts for your topics…</p>
      </div>
    );
  }

  if (clusters.length === 0) {
    return (
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", textAlign: "center", padding: "60px 0" }}>
        No prompts generated. You can run an audit later from the Prompts page.
      </p>
    );
  }

  const current = clusters[active] ?? clusters[0];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "minmax(280px, 1fr) minmax(320px, 1.2fr)", gap: 20, alignItems: "start" }}>
      {/* ── Topic clusters ── */}
      <div>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#fff", margin: "0 0 14px" }}>Topic clusters</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {clusters.map((c, i) => {
            const sel = c.prompts.filter((p) => p.selected).length;
            const isActive = i === active;
            return (
              <button key={c.topic + i} type="button" onClick={() => setActive(i)}
                style={{
                  display: "flex", alignItems: "center", gap: 10, textAlign: "left", cursor: "pointer", width: "100%",
                  padding: "14px 16px", borderRadius: 12,
                  background: isActive ? "rgba(201,243,29,0.08)" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${isActive ? "rgba(201,243,29,0.45)" : "rgba(255,255,255,0.08)"}`,
                  transition: "all .12s ease",
                }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13.5, fontWeight: 600, color: "#fff", margin: 0 }}>{c.topic}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 5 }}>
                    <MarketTag market={market} countryCode={countryCode} />
                    <span style={{ fontSize: 11.5, color: sel ? LIME : "rgba(255,255,255,0.40)" }}>{sel} selected</span>
                  </div>
                </div>
                <ChevronRight size={16} style={{ color: isActive ? LIME : "rgba(255,255,255,0.35)", flexShrink: 0 }} />
              </button>
            );
          })}
        </div>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 14 }}>
          <strong style={{ color: "#fff" }}>{totalSelected}</strong> prompts selected
        </p>
      </div>

      {/* ── Prompts for active cluster ── */}
      <div>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#fff", margin: "0 0 4px" }}>Group your prompts</h3>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: "0 0 14px" }}>for {current?.topic}</p>

        <div className="card" style={{ overflow: "hidden" }}>
          {/* add row */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <Plus size={16} style={{ color: "rgba(255,255,255,0.35)", flexShrink: 0 }} />
            <input className="auth-input" style={{ padding: "7px 8px", border: "none", background: "transparent", boxShadow: "none" }}
              value={draft} onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addPrompt(active); } }}
              placeholder="Type to add a prompt manually" />
          </div>

          {current?.prompts.map((p, pi) => (
            <div key={pi} onClick={() => togglePrompt(active, pi)}
              style={{
                display: "flex", alignItems: "flex-start", gap: 12, width: "100%", textAlign: "left", cursor: "pointer",
                padding: "13px 14px",
                borderBottom: pi < current.prompts.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
              }}>
              <span style={{ marginTop: 1, pointerEvents: "none" }}><Checkbox checked={p.selected} /></span>
              <span style={{ fontSize: 13, lineHeight: 1.5, color: p.selected ? "#fff" : "rgba(255,255,255,0.70)" }}>{p.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
