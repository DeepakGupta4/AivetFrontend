"use client";

import Link from "next/link";
import Topbar from "@/components/shared/Topbar";
import { Lock, ArrowRight, Sparkles } from "lucide-react";
import { FEATURE_MIN_TIER, TIER_LABEL, type Tier } from "@/lib/tiers";

const LIME = "#C9F31D";

export default function LockedFeature({ title, feature, subtitle }: { title: string; feature: string; subtitle?: string }) {
  const need: Tier = FEATURE_MIN_TIER[feature] ?? "pro";

  return (
    <div style={{ background: "#0E0F11", minHeight: "100vh" }}>
      <Topbar title={title} subtitle={subtitle} />
      <div style={{ padding: 24, display: "flex", justifyContent: "center" }}>
        <div style={{
          maxWidth: 460, width: "100%", marginTop: 48, textAlign: "center",
          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 16, padding: "40px 32px",
        }}>
          <div style={{ width: 56, height: 56, borderRadius: 15, margin: "0 auto 18px", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(201,243,29,0.12)" }}>
            <Lock size={26} style={{ color: LIME }} />
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#fff", margin: "0 0 6px" }}>
            {title} is a {TIER_LABEL[need]} feature
          </h2>
          <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.55)", margin: "0 0 22px", lineHeight: 1.6 }}>
            Upgrade to <strong style={{ color: "#fff" }}>{TIER_LABEL[need]}</strong> to unlock {title.toLowerCase()} and the rest of the {TIER_LABEL[need]} toolkit.
          </p>
          <Link href="/pricing" style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            padding: "11px 22px", borderRadius: 9, background: LIME, color: "#000",
            fontSize: 13.5, fontWeight: 700, textDecoration: "none",
          }}>
            <Sparkles size={15} /> Upgrade to {TIER_LABEL[need]} <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
}
