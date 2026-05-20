"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { X, Plus, Trash2, Loader2, AlertCircle, Zap } from "lucide-react";
import { campaignsApi, type CampaignDTO } from "@/lib/api/campaigns";

const LIME = "#C9F31D";

interface Props {
  projectId: string;
  brandName: string;
  industry?: string;
  onClose: () => void;
  onCreated: (c: CampaignDTO) => void;
}

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 12, fontWeight: 500,
  color: "rgba(255,255,255,0.60)", marginBottom: 7,
};

export default function CreateCampaignModal({ projectId, brandName, industry, onClose, onCreated }: Props) {
  const [name, setName] = useState(`${brandName} Visibility Tracking`);
  const [frequency, setFrequency] = useState<"hourly" | "daily" | "weekly">("daily");
  const [category, setCategory] = useState(industry ?? "");
  const [prompts, setPrompts] = useState<string[]>([""]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Category / buyer-intent questions — NOT brand-name questions. This is what
  // measures real visibility: does your brand surface when buyers ask about the
  // category? (e.g. "best black stone jewelry brands") — like Ubersuggest.
  const suggestions = useMemo(() => {
    const cat = category.trim() || "products";
    return [
      `Best ${cat} brands`,
      `Top ${cat} brands in India with affordable prices`,
      `Where can I buy the best ${cat} online?`,
      `Best ${cat} for gifting`,
      `Which ${cat} brand is most trusted?`,
      `Recommend lightweight and durable ${cat}`,
    ];
  }, [category]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const setPrompt = (i: number, v: string) => setPrompts((p) => p.map((x, idx) => (idx === i ? v : x)));
  const addRow = () => setPrompts((p) => (p.length >= 12 ? p : [...p, ""]));
  const removeRow = (i: number) => setPrompts((p) => (p.length === 1 ? p : p.filter((_, idx) => idx !== i)));

  const addSuggestion = (s: string) => {
    setPrompts((p) => {
      if (p.includes(s)) return p;
      const firstEmpty = p.findIndex((x) => !x.trim());
      if (firstEmpty >= 0) return p.map((x, idx) => (idx === firstEmpty ? s : x));
      return p.length >= 12 ? p : [...p, s];
    });
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const cleaned = prompts.map((p) => p.trim()).filter(Boolean);
    if (!name.trim()) return setError("Campaign name is required");
    if (cleaned.length === 0) return setError("Add at least one prompt");

    setSubmitting(true);
    try {
      const campaign = await campaignsApi.create({
        projectId,
        name: name.trim(),
        frequency,
        prompts: cleaned.map((text) => ({ text, category: "generic", intent: "informational", isActive: true })),
      });
      onCreated(campaign);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create campaign");
      setSubmitting(false);
    }
  }

  const modal = (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-fade-in"
        style={{ width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto", background: "#141517", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 16, boxShadow: "0 24px 64px rgba(0,0,0,0.5)" }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(201,243,29,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Zap size={18} style={{ color: LIME }} />
            </div>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: "#fff", margin: 0 }}>New campaign</h2>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: "2px 0 0" }}>Prompts run against every AI engine</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 4 }}>
            <X size={18} style={{ color: "rgba(255,255,255,0.45)" }} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
          {error && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 10, fontSize: 12.5, background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.25)", color: "#EF4444" }}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}

          <div>
            <label style={labelStyle}>Campaign name</label>
            <input className="auth-input" style={{ padding: "11px 13px" }} value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div>
            <label style={labelStyle}>Frequency</label>
            <div style={{ display: "flex", gap: 8 }}>
              {(["hourly", "daily", "weekly"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFrequency(f)}
                  style={{
                    flex: 1, padding: "9px", borderRadius: 9, cursor: "pointer", fontSize: 12.5, fontWeight: 600, textTransform: "capitalize",
                    background: frequency === f ? "rgba(201,243,29,0.12)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${frequency === f ? "rgba(201,243,29,0.4)" : "rgba(255,255,255,0.10)"}`,
                    color: frequency === f ? LIME : "rgba(255,255,255,0.65)",
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={labelStyle}>What does your brand sell? <span style={{ color: "rgba(255,255,255,0.3)" }}>(category / topic)</span></label>
            <input className="auth-input" style={{ padding: "11px 13px" }} value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. black stone jewelry" />
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", margin: "8px 0 0" }}>Drives the category questions below — we measure if AI recommends you for these.</p>
          </div>

          <div>
            <label style={labelStyle}>Prompts</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {prompts.map((p, i) => (
                <div key={i} style={{ display: "flex", gap: 8 }}>
                  <input className="auth-input" style={{ padding: "9px 11px", flex: 1 }} value={p} onChange={(e) => setPrompt(i, e.target.value)} placeholder="e.g. Best CRM tools for startups" />
                  <button type="button" onClick={() => removeRow(i)} title="Remove" style={{ flexShrink: 0, width: 36, borderRadius: 9, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Trash2 size={14} style={{ color: "rgba(255,255,255,0.40)" }} />
                  </button>
                </div>
              ))}
            </div>
            {prompts.length < 12 && (
              <button type="button" onClick={addRow} style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 10, background: "none", border: "none", cursor: "pointer", color: LIME, fontSize: 12.5, fontWeight: 500, padding: 0 }}>
                <Plus size={14} /> Add prompt
              </button>
            )}
          </div>

          {/* Suggestions */}
          <div>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.40)", margin: "0 0 8px" }}>Category questions — click to add. Tip: don&apos;t put your brand name in the prompt; that inflates the score.</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => addSuggestion(s)}
                  style={{ fontSize: 11.5, padding: "6px 10px", borderRadius: 7, cursor: "pointer", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.70)" }}
                >
                  + {s}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button type="button" onClick={onClose} className="btn-ghost" style={{ flex: 1, padding: "11px", fontSize: 13, cursor: "pointer" }}>
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-lime" style={{ flex: 1, padding: "11px", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, opacity: submitting ? 0.7 : 1, cursor: submitting ? "not-allowed" : "pointer" }}>
              {submitting ? <><Loader2 size={15} className="auth-spin" /> Creating…</> : "Create campaign"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(modal, document.body);
}
