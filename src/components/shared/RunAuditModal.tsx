"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, Loader2, AlertCircle, CheckCircle2, Sparkles, Search } from "lucide-react";
import { campaignsApi, type PromptRunDTO } from "@/lib/api/campaigns";

const LIME = "#C9F31D";

interface Props {
  projectId: string;
  brandName: string;
  defaultCategory?: string;
  onClose: () => void;
  onDone: () => void;
}

const STAGES = [
  "Generating category questions…",
  "Asking ChatGPT about your category…",
  "Asking Gemini…",
  "Asking Claude…",
  "Querying Perplexity (live web)…",
  "Pulling Google AI Overviews…",
  "Detecting brand mentions…",
  "Scoring visibility…",
];

export default function RunAuditModal({ projectId, brandName, defaultCategory, onClose, onDone }: Props) {
  const [category, setCategory] = useState(defaultCategory ?? "");
  const [phase, setPhase] = useState<"form" | "running" | "done">("form");
  const [error, setError] = useState<string | null>(null);
  const [prompts, setPrompts] = useState<string[]>([]);
  const [progress, setProgress] = useState(0); // 0-100
  const [stage, setStage] = useState(0);
  const cancelled = useRef(false);

  // Reset on mount AND clear on unmount. Without the reset, React StrictMode's
  // mount→unmount→remount in dev leaves cancelled=true, which made the polling
  // loop exit instantly and freeze the progress bar at 5%.
  useEffect(() => {
    cancelled.current = false;
    return () => { cancelled.current = true; };
  }, []);

  // Rotate stage labels while running (visual, like the reference app)
  useEffect(() => {
    if (phase !== "running") return;
    const id = setInterval(() => setStage((s) => (s + 1) % STAGES.length), 2200);
    return () => clearInterval(id);
  }, [phase]);

  async function start() {
    setError(null);
    setPhase("running");
    setProgress(5);
    try {
      const res = await campaignsApi.audit(projectId, category.trim() || undefined);
      setPrompts(res.prompts);
      const total = res.promptCount || 1;

      // Poll the audit campaign's runs until they settle (~3 min max headroom).
      for (let i = 0; i < 60; i++) {
        if (cancelled.current) return;
        await new Promise((r) => setTimeout(r, 3000));
        const runs: PromptRunDTO[] = await campaignsApi.runs(res.campaignId).catch(() => []);
        const settled = runs.filter((r) => r.status === "completed" || r.status === "failed").length;
        setProgress(Math.min(98, 5 + Math.round((settled / total) * 93)));
        if (runs.length > 0 && settled >= total) break;
      }
      if (cancelled.current) return;
      setProgress(100);
      setPhase("done");
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Audit failed");
      setPhase("form");
    }
  }

  const node = (
    <div onClick={phase === "running" ? undefined : onClose} style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} className="animate-fade-in" style={{ width: "100%", maxWidth: 460, background: "#141517", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 16, boxShadow: "0 24px 64px rgba(0,0,0,0.5)" }}>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(201,243,29,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Search size={17} style={{ color: LIME }} />
            </div>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: "#fff", margin: 0 }}>AI Visibility Audit</h2>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: "2px 0 0" }}>{brandName}</p>
            </div>
          </div>
          {phase !== "running" && (
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 4 }}>
              <X size={18} style={{ color: "rgba(255,255,255,0.45)" }} />
            </button>
          )}
        </div>

        <div style={{ padding: 20 }}>
          {error && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 10, fontSize: 12.5, marginBottom: 14, background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.25)", color: "#EF4444" }}>
              <AlertCircle size={15} /> {error}
            </div>
          )}

          {phase === "form" && (
            <>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", margin: "0 0 16px", lineHeight: 1.6 }}>
                We&apos;ll ask all AI engines real buyer questions about your category and measure whether <strong style={{ color: "#fff" }}>{brandName}</strong> shows up.
              </p>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.6)", marginBottom: 7 }}>
                What does {brandName} sell? <span style={{ color: "rgba(255,255,255,0.3)" }}>(category)</span>
              </label>
              <input className="auth-input" style={{ padding: "11px 13px" }} value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. black stone jewelry" autoFocus />
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", margin: "8px 0 0" }}>
                We generate the questions automatically from this — no brand name in them.
              </p>
              <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                <button onClick={onClose} className="btn-ghost" style={{ flex: 1, padding: "11px", fontSize: 13, cursor: "pointer" }}>Cancel</button>
                <button onClick={start} className="btn-lime" style={{ flex: 1, padding: "11px", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, cursor: "pointer" }}>
                  <Sparkles size={15} /> Run Audit
                </button>
              </div>
            </>
          )}

          {phase === "running" && (
            <div style={{ textAlign: "center", padding: "8px 0" }}>
              <Loader2 size={30} className="auth-spin" style={{ color: LIME }} />
              <p style={{ fontSize: 13.5, color: "#fff", fontWeight: 600, margin: "16px 0 4px" }}>{STAGES[stage]}</p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: "0 0 18px" }}>Querying live AI engines — this takes ~1–2 minutes.</p>
              <div style={{ height: 8, borderRadius: 5, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                <div style={{ height: "100%", borderRadius: 5, width: `${progress}%`, background: "linear-gradient(90deg,#C9F31D,#A8D017)", transition: "width 0.6s ease" }} />
              </div>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", margin: "8px 0 0" }}>{progress}%</p>
            </div>
          )}

          {phase === "done" && (
            <div style={{ textAlign: "center", padding: "8px 0" }}>
              <CheckCircle2 size={34} style={{ color: "#22C55E" }} />
              <p style={{ fontSize: 15, color: "#fff", fontWeight: 700, margin: "14px 0 4px" }}>Audit complete</p>
              <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.5)", margin: "0 0 18px" }}>
                We ran {prompts.length} questions across every AI engine. Your visibility score is updated.
              </p>
              <button onClick={onClose} className="btn-lime" style={{ width: "100%", padding: "11px", fontSize: 13, cursor: "pointer" }}>View results</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(node, document.body);
}
