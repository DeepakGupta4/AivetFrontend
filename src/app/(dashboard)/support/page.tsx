"use client";

import { useState } from "react";
import Link from "next/link";
import Topbar from "@/components/shared/Topbar";
import { Mail, ChevronDown, MessageSquare, BookOpen, Zap, BarChart3 } from "lucide-react";

const LIME = "#C9F31D";
const card: React.CSSProperties = { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 };
const SUPPORT_EMAIL = "support@aivet.io";

const FAQS = [
  { q: "How is the AI Visibility Score calculated?", a: "It's a weighted blend of five factors from real AI answers: mention frequency (30%), ranking position (25%), sentiment (20%), citations (15%) and engine diversity (10%). A brand that never appears in answers scores 0." },
  { q: "How do I get data for my brand?", a: "Add your brand, then run an audit (Overview → Run Audit, or Prompt Campaigns → Run Audit). It asks all AI engines real category questions and measures whether your brand shows up." },
  { q: "Why is my score 0?", a: "It means AI engines don't surface your brand for your category's buyer questions yet — the honest starting point. Use the GEO Recommendations and Citations pages to see where to improve." },
  { q: "Which AI engines do you track?", a: "ChatGPT (OpenAI), Claude (Anthropic), Gemini (Google), Perplexity-style web-grounded answers, and Google AI Overviews." },
  { q: "What do the plan tiers unlock?", a: "Free covers the core dashboard and audits. Pro unlocks Competitors, GEO Recommendations and Reports. See Billing to compare and upgrade." },
];

const LINKS = [
  { href: "/overview", icon: BarChart3, label: "Overview", desc: "Your visibility at a glance" },
  { href: "/prompts", icon: Zap, label: "Run an audit", desc: "Generate real data" },
  { href: "/billing", icon: BookOpen, label: "Plans & billing", desc: "Compare tiers" },
];

export default function SupportPage() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div style={{ background: "#0E0F11", minHeight: "100vh" }}>
      <Topbar title="Help & Support" subtitle="Answers and ways to reach us" />
      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20, maxWidth: 820 }}>

        {/* Contact */}
        <div style={{ ...card, padding: 22, display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 48, height: 48, borderRadius: 13, background: "rgba(201,243,29,0.12)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <MessageSquare size={22} style={{ color: LIME }} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#fff", margin: "0 0 3px" }}>Need a hand?</h3>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: 0 }}>Email us and we&apos;ll get back within 1 business day.</p>
          </div>
          <a href={`mailto:${SUPPORT_EMAIL}`} style={{ display: "inline-flex", alignItems: "center", gap: 7, padding: "10px 18px", borderRadius: 9, background: LIME, color: "#000", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
            <Mail size={15} /> Email support
          </a>
        </div>

        {/* Quick links */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {LINKS.map(({ href, icon: Icon, label, desc }) => (
            <Link key={href} href={href} style={{ ...card, padding: 16, textDecoration: "none", display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon size={15} style={{ color: LIME }} /></div>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{label}</span>
              <span style={{ fontSize: 11.5, color: "rgba(255,255,255,0.4)" }}>{desc}</span>
            </Link>
          ))}
        </div>

        {/* FAQ */}
        <div style={{ ...card, overflow: "hidden" }}>
          <div style={{ padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "#fff", margin: 0 }}>Frequently asked questions</h3>
          </div>
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={i} style={{ borderBottom: i < FAQS.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                <button onClick={() => setOpen(isOpen ? null : i)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "14px 20px", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: "#fff" }}>{f.q}</span>
                  <ChevronDown size={16} style={{ color: "rgba(255,255,255,0.4)", flexShrink: 0, transform: isOpen ? "rotate(180deg)" : "none", transition: "transform .15s" }} />
                </button>
                {isOpen && <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", margin: 0, padding: "0 20px 16px", lineHeight: 1.6 }}>{f.a}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
