"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useAuthStore } from "@/lib/stores/authStore";
import { Bot, Search, BarChart3, Sparkles, ArrowRight, ArrowLeft } from "lucide-react";

const LIME = "#C9F31D";

const STEPS = [
  { icon: Bot, title: "Welcome to AIVet", body: "Track how AI engines — ChatGPT, Gemini, Claude, Perplexity and Google AI — talk about your brand, and who they recommend instead." },
  { icon: Search, title: "Run an audit", body: "Pick a brand in the top-left switcher, then hit Run Audit. We ask every engine real buyer questions and measure whether you show up — no brand-name prompts, so the score is honest." },
  { icon: BarChart3, title: "See where you stand", body: "Your AI Visibility Score, per-engine breakdown, competitor share-of-voice and the sources AI cites — all computed from real answers." },
  { icon: Sparkles, title: "Close the gaps", body: "GEO Recommendations and Citation Opportunities show exactly what to do to get AI engines recommending you." },
];

export default function ProductTour() {
  const token = useAuthStore((s) => s.token);
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!token) return;
    try {
      if (!localStorage.getItem("aivet-tour-done")) setShow(true);
    } catch { /* ignore */ }
  }, [token]);

  const finish = () => {
    try { localStorage.setItem("aivet-tour-done", "1"); } catch { /* ignore */ }
    setShow(false);
  };

  if (!show) return null;

  const s = STEPS[step];
  const Icon = s.icon;
  const isLast = step === STEPS.length - 1;

  const node = (
    <div style={{ position: "fixed", inset: 0, zIndex: 1100, background: "rgba(0,0,0,0.66)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div className="animate-fade-in" style={{ width: "100%", maxWidth: 440, background: "#141517", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 16, padding: 28, boxShadow: "0 24px 64px rgba(0,0,0,0.5)", textAlign: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: 15, margin: "0 auto 18px", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(201,243,29,0.12)" }}>
          <Icon size={26} style={{ color: LIME }} />
        </div>
        <h2 style={{ fontSize: 19, fontWeight: 700, color: "#fff", margin: "0 0 8px" }}>{s.title}</h2>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", margin: "0 auto 22px", lineHeight: 1.65, maxWidth: 360 }}>{s.body}</p>

        {/* Dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 22 }}>
          {STEPS.map((_, i) => (
            <span key={i} style={{ width: i === step ? 20 : 6, height: 6, borderRadius: 3, background: i === step ? LIME : "rgba(255,255,255,0.18)", transition: "all .2s" }} />
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <button onClick={finish} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.45)", fontSize: 13, cursor: "pointer" }}>Skip</button>
          <div style={{ display: "flex", gap: 8 }}>
            {step > 0 && (
              <button onClick={() => setStep((x) => x - 1)} className="btn-ghost" style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 14px", fontSize: 13, cursor: "pointer" }}>
                <ArrowLeft size={14} /> Back
              </button>
            )}
            <button onClick={() => (isLast ? finish() : setStep((x) => x + 1))} className="btn-lime" style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", fontSize: 13, cursor: "pointer" }}>
              {isLast ? "Get started" : "Next"} <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(node, document.body);
}
