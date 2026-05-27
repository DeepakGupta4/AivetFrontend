"use client";

import { useEffect, useState } from "react";
import Topbar from "@/components/shared/Topbar";
import { useTier } from "@/lib/hooks/useTier";
import { billingApi } from "@/lib/api/billing";
import { Check, Crown, Zap, Building2, Loader2, AlertCircle, Tag } from "lucide-react";

const LIME = "#C9F31D";
const card: React.CSSProperties = { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14 };

// Honest plan features — only listing what's actually shipped today.
// Internal id "pro" renders publicly as "Business".
const PLANS = [
  {
    id: "starter", name: "Starter", price: 10, checkoutPlan: "starter", icon: Zap, color: "#22B8CF", highlighted: false,
    features: [
      "1 brand tracked",
      "Up to 5 competitors per brand",
      "All 5 AI engines (ChatGPT, Gemini, Claude, Perplexity, Google AI)",
      "Up to 6 prompts per audit",
      "Weekly auto-audit cadence",
      "Visibility scoring + trend tracking",
      "Citations tracking",
      "PDF report export",
    ],
  },
  {
    id: "business", name: "Business", price: 20, checkoutPlan: "pro", icon: Crown, color: LIME, highlighted: true,
    features: [
      "7 brands tracked",
      "Up to 10 competitors per brand",
      "All 5 AI engines + per-engine factor breakdown",
      "Up to 8 prompts per audit",
      "Daily auto-audit cadence",
      "Everything in Starter",
      "GEO recommendations engine",
      "Competitor share-of-voice analysis",
    ],
  },
  {
    id: "enterprise", name: "Enterprise", price: 49, checkoutPlan: "enterprise", icon: Building2, color: "#C084FC", highlighted: false,
    features: [
      "15 brands tracked",
      "Up to 15 competitors per brand",
      "All 5 AI engines + advanced factor breakdown",
      "Up to 8 prompts per audit",
      "Daily auto-audit cadence",
      "Everything in Business",
      "Bulk PDF report generation",
      "Priority email support",
    ],
  },
];

export default function PricingPage() {
  const { tier } = useTier();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [canceled, setCanceled] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("status") === "canceled") {
      setCanceled(true);
    }
  }, []);

  async function choose(checkoutPlan: string) {
    setBusy(checkoutPlan); setError(null);
    try {
      const { url } = await billingApi.checkout(checkoutPlan);
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start checkout");
      setBusy(null);
    }
  }

  return (
    <div style={{ background: "#0E0F11", minHeight: "100vh" }}>
      <Topbar title="Plans & Pricing" subtitle="Free preview includes 1 brand. Upgrade to unlock more domains, keywords & AI credits" />
      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20, maxWidth: 1000 }}>

        {canceled && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 14px", borderRadius: 10, fontSize: 12.5, background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", color: "rgba(255,255,255,0.7)" }}>
            <AlertCircle size={14} style={{ color: "#F59E0B" }} /> Checkout canceled — no charge was made.
          </div>
        )}
        {error && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 14px", borderRadius: 10, fontSize: 12.5, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "rgba(255,255,255,0.7)" }}>
            <AlertCircle size={14} style={{ color: "#EF4444" }} /> {error}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, alignItems: "stretch" }}>
          {PLANS.map((p) => {
            const Icon = p.icon;
            const isCurrent = tier === p.checkoutPlan;
            return (
              <div key={p.id} style={{ ...card, padding: "26px 22px", display: "flex", flexDirection: "column", gap: 18, position: "relative", border: p.highlighted ? `1px solid ${LIME}55` : "1px solid rgba(255,255,255,0.08)", background: p.highlighted ? "rgba(201,243,29,0.04)" : "rgba(255,255,255,0.03)" }}>
                {p.highlighted && (
                  <span style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", fontSize: 10, fontWeight: 800, letterSpacing: "0.06em", padding: "3px 12px", borderRadius: 20, background: LIME, color: "#000" }}>MOST POPULAR</span>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: `${p.color}15`, border: `1px solid ${p.color}28`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon size={18} style={{ color: p.color }} />
                  </div>
                  <span style={{ fontSize: 17, fontWeight: 800, color: "#fff" }}>{p.name}</span>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                  <span style={{ fontSize: 38, fontWeight: 900, color: "#fff", letterSpacing: "-1px" }}>${p.price}</span>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>/month</span>
                </div>
                <div style={{ height: 1, background: "rgba(255,255,255,0.07)" }} />
                <div style={{ display: "flex", flexDirection: "column", gap: 11, flex: 1 }}>
                  {p.features.map((f) => (
                    <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
                      <Check size={14} style={{ color: p.color, flexShrink: 0, marginTop: 2 }} strokeWidth={3} />
                      <span style={{ fontSize: 12.5, color: "rgba(255,255,255,0.68)", lineHeight: 1.45 }}>{f}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => !isCurrent && choose(p.checkoutPlan)}
                  disabled={isCurrent || busy === p.checkoutPlan}
                  style={{
                    width: "100%", padding: "12px 0", borderRadius: 10, fontSize: 13.5, fontWeight: 700, border: "none",
                    cursor: isCurrent ? "default" : "pointer",
                    background: isCurrent ? "rgba(255,255,255,0.06)" : p.highlighted ? LIME : "rgba(255,255,255,0.08)",
                    color: isCurrent ? "rgba(255,255,255,0.5)" : p.highlighted ? "#000" : "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                  }}
                >
                  {busy === p.checkoutPlan ? <><Loader2 size={15} className="auth-spin" /> Starting…</> : isCurrent ? "Current plan" : `Get ${p.name}`}
                </button>
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", fontSize: 12.5, color: "rgba(255,255,255,0.45)" }}>
          <Tag size={14} style={{ color: LIME }} /> Have a coupon? Enter it at checkout. Secure payments by Stripe · cancel anytime.
        </div>
      </div>
    </div>
  );
}
