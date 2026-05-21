"use client";

import Link from "next/link";
import {
  Sparkles, Target, Link2, FileText, Star, Globe, Code2, RefreshCw, ArrowRight, Rocket,
} from "lucide-react";

const LIME = "#C9F31D";

type Step = { icon: typeof Target; title: string; desc: string };

const STEPS: Step[] = [
  {
    icon: Target,
    title: "Audit the right buyer-intent topics",
    desc: "Run audits on category questions your customers actually ask (e.g. \"best running shoes in India\"), not your brand name. Right category + region = real visibility.",
  },
  {
    icon: Link2,
    title: "Get cited by the sources AI trusts",
    desc: "AI pulls answers from Wikipedia, Reddit, YouTube, review sites, directories & top blogs. Check your Citations page for the domains AI cites in your space, then get featured there (PR, guest posts, listicles).",
  },
  {
    icon: FileText,
    title: "Publish \"best of\" & comparison content",
    desc: "Create \"Best X for Y\", \"X vs Y\" and FAQ pages on your own site. This is exactly the kind of content AI quotes when it recommends brands.",
  },
  {
    icon: Star,
    title: "Build third-party reviews & mentions",
    desc: "Get listed and reviewed on Trustpilot, G2, Amazon and industry sites. AI weighs social proof and recent reviews heavily when ranking brands.",
  },
  {
    icon: Globe,
    title: "Strengthen Wikipedia & Wikidata",
    desc: "AI engines reference these constantly. An accurate, well-sourced entry for your brand massively improves how often you're recommended.",
  },
  {
    icon: Code2,
    title: "Add structured data (schema)",
    desc: "Mark up your site with Organization, Product, FAQ & Review schema so AI engines clearly understand your brand, products and reputation.",
  },
];

export default function VisibilityBoostGuide({
  brandName,
  onRunAudit,
}: {
  brandName: string;
  onRunAudit?: () => void;
}) {
  return (
    <div
      style={{
        background: "linear-gradient(135deg, rgba(201,243,29,0.06) 0%, rgba(255,255,255,0.03) 60%)",
        border: "1px solid rgba(201,243,29,0.20)",
        borderRadius: 14,
        padding: 24,
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 13, marginBottom: 20 }}>
        <div style={{ width: 40, height: 40, borderRadius: 11, flexShrink: 0, background: "rgba(201,243,29,0.14)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Sparkles size={20} style={{ color: LIME }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff", margin: 0 }}>
            {brandName} is barely visible in AI answers — here&apos;s how to grow it
          </h3>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", margin: "5px 0 0", lineHeight: 1.5, maxWidth: 720 }}>
            AI engines recommend brands they repeatedly see across trusted sources. Follow these steps to get ChatGPT, Gemini, Claude &amp; Perplexity to start mentioning you.
          </p>
        </div>

        {/* Boost AI Visibility — teaser (auto done-for-you, coming soon) */}
        <button
          type="button"
          disabled
          title="Automated done-for-you visibility boosting — coming soon"
          style={{
            flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 8,
            padding: "10px 16px", borderRadius: 10, border: "1px solid rgba(201,243,29,0.35)",
            background: "rgba(201,243,29,0.10)", color: LIME, fontSize: 13, fontWeight: 700,
            cursor: "not-allowed",
          }}
        >
          <Rocket size={15} /> Boost AI Visibility
          <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.06em", padding: "2px 7px", borderRadius: 999, background: LIME, color: "#000", textTransform: "uppercase" }}>
            Coming soon
          </span>
        </button>
      </div>

      {/* Steps */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: 12, marginBottom: 20 }}>
        {STEPS.map(({ icon: Icon, title, desc }, i) => (
          <div
            key={title}
            style={{
              display: "flex", gap: 12, padding: "14px 15px", borderRadius: 11,
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(201,243,29,0.10)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={16} style={{ color: LIME }} />
              </div>
              <span style={{ position: "absolute", top: -6, right: -6, width: 17, height: 17, borderRadius: "50%", background: LIME, color: "#000", fontSize: 9.5, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {i + 1}
              </span>
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#fff", margin: "1px 0 4px" }}>{title}</p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", margin: 0, lineHeight: 1.5 }}>{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTAs */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {onRunAudit && (
          <button
            onClick={onRunAudit}
            style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 18px", borderRadius: 9, border: "none", cursor: "pointer", background: LIME, color: "#000", fontSize: 13, fontWeight: 700 }}
          >
            <RefreshCw size={14} /> Run a new audit
          </button>
        )}
        <Link
          href="/geo"
          style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 18px", borderRadius: 9, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", fontSize: 13, fontWeight: 600, textDecoration: "none" }}
        >
          <Sparkles size={14} style={{ color: LIME }} /> See personalized recommendations <ArrowRight size={13} />
        </Link>
        <Link
          href="/citations"
          style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 18px", borderRadius: 9, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", fontSize: 13, fontWeight: 600, textDecoration: "none" }}
        >
          <Link2 size={14} style={{ color: LIME }} /> View citation sources
        </Link>
      </div>
    </div>
  );
}
