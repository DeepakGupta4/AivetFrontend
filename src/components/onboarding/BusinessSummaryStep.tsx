"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { LIME, flagEmoji, SectionCard } from "./shared";
import type { BusinessSummary } from "@/lib/api/onboarding";

interface Props {
  summary: BusinessSummary;
  setSummary: (s: BusinessSummary) => void;
  selectedTopics: string[];
  toggleTopic: (t: string) => void;
  sitemaps: string[];
  setSitemaps: (s: string[]) => void;
}

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 11, fontWeight: 600, letterSpacing: "0.04em",
  textTransform: "uppercase", color: "rgba(255,255,255,0.40)", marginBottom: 7,
};

const inputBase: React.CSSProperties = { padding: "10px 12px" };

function BulletField({
  label, value, onChange, placeholder,
}: { label: string; value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  return (
    <div>
      {label && <label style={labelStyle}>{label}</label>}
      <textarea
        className="auth-input"
        style={{ ...inputBase, minHeight: 92, lineHeight: 1.6, resize: "vertical", fontSize: 13 }}
        value={value.join("\n")}
        onChange={(e) => onChange(e.target.value.split("\n"))}
        placeholder={placeholder ?? "One point per line"}
      />
      <p style={{ fontSize: 10.5, color: "rgba(255,255,255,0.30)", margin: "5px 2px 0" }}>One point per line</p>
    </div>
  );
}

export default function BusinessSummaryStep({
  summary, setSummary, selectedTopics, toggleTopic, sitemaps, setSitemaps,
}: Props) {
  const [sitemapDraft, setSitemapDraft] = useState("");
  const set = <K extends keyof BusinessSummary>(k: K, v: BusinessSummary[K]) => setSummary({ ...summary, [k]: v });

  const addSitemap = () => {
    const v = sitemapDraft.trim();
    if (v && !sitemaps.includes(v)) setSitemaps([...sitemaps, v]);
    setSitemapDraft("");
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 16, alignItems: "start" }}>
      {/* ── Left column ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <SectionCard title="Brand">
          <input className="auth-input" style={{ ...inputBase, fontSize: 17, fontWeight: 700, color: LIME }}
            value={summary.brandName} onChange={(e) => set("brandName", e.target.value)} />
        </SectionCard>

        <SectionCard title="Website Domain">
          <input className="auth-input" style={inputBase} value={summary.domain}
            onChange={(e) => set("domain", e.target.value)} />
        </SectionCard>

        <SectionCard title="Business Type">
          <input className="auth-input" style={inputBase} value={summary.businessType}
            onChange={(e) => set("businessType", e.target.value)} placeholder="e.g. E-commerce & Technology" />
        </SectionCard>

        <SectionCard title="Language and Location">
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Language</label>
              <input className="auth-input" style={inputBase} value={summary.language}
                onChange={(e) => set("language", e.target.value)} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>{flagEmoji(summary.countryCode)} Country</label>
              <input className="auth-input" style={inputBase} value={summary.country}
                onChange={(e) => set("country", e.target.value)} />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="About the Business">
          <BulletField label="" value={summary.about} onChange={(v) => set("about", v)} />
        </SectionCard>

        <SectionCard title="Key Features">
          <BulletField label="" value={summary.keyFeatures} onChange={(v) => set("keyFeatures", v)}
            placeholder="Feature: short description" />
        </SectionCard>
      </div>

      {/* ── Right column ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <SectionCard
          title="Suggested Topics"
          hint="Pick the themes we should track for your brand."
          right={<span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>{selectedTopics.length}/{summary.topics.length} selected</span>}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {summary.topics.length === 0 && (
              <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.40)" }}>No topics detected — you can add prompts in the next steps.</p>
            )}
            {summary.topics.map((t) => {
              const active = selectedTopics.includes(t);
              return (
                <button key={t} type="button" onClick={() => toggleTopic(t)}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 999,
                    fontSize: 12.5, cursor: "pointer", transition: "all .12s ease",
                    background: active ? "rgba(201,243,29,0.14)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${active ? "rgba(201,243,29,0.5)" : "rgba(255,255,255,0.12)"}`,
                    color: active ? LIME : "rgba(255,255,255,0.75)",
                  }}>
                  {t}{active && <X size={12} />}
                </button>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard title="Your Sitemaps" hint="Optional — an accurate sitemap helps us analyze your pages faster.">
          <input className="auth-input" style={inputBase} value={sitemapDraft}
            onChange={(e) => setSitemapDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSitemap(); } }}
            placeholder="Type a URL and press Enter" />
          {sitemaps.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 10 }}>
              {sitemaps.map((s) => (
                <span key={s} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 8, fontSize: 12, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.75)" }}>
                  {s}
                  <button type="button" onClick={() => setSitemaps(sitemaps.filter((x) => x !== s))}
                    style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 0 }}>
                    <X size={12} style={{ color: "rgba(255,255,255,0.45)" }} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Competitive Advantage">
          <textarea className="auth-input" style={{ ...inputBase, minHeight: 80, lineHeight: 1.6, resize: "vertical", fontSize: 13 }}
            value={summary.competitiveAdvantage} onChange={(e) => set("competitiveAdvantage", e.target.value)}
            placeholder="What makes this brand stand out?" />
        </SectionCard>

        <SectionCard title="Target Customers">
          <BulletField label="" value={summary.targetCustomers} onChange={(v) => set("targetCustomers", v)} />
        </SectionCard>
      </div>
    </div>
  );
}
