"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Plus, Trash2, Loader2, AlertCircle, Bot } from "lucide-react";
import { projectsApi, type ProjectDTO } from "@/lib/api/projects";

const LIME = "#C9F31D";

interface AddBrandModalProps {
  onClose: () => void;
  onCreated: (project: ProjectDTO) => void;
}

// Normalize "https://www.Acme.com/path" → "acme.com"
function cleanDomain(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "");
}

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 12, fontWeight: 500,
  color: "rgba(255,255,255,0.60)", marginBottom: 7,
};

export default function AddBrandModal({ onClose, onCreated }: AddBrandModalProps) {
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [industry, setIndustry] = useState("");
  const [competitors, setCompetitors] = useState<{ brandName: string; domain: string }[]>([
    { brandName: "", domain: "" },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const updateCompetitor = (i: number, key: "brandName" | "domain", value: string) =>
    setCompetitors((prev) => prev.map((c, idx) => (idx === i ? { ...c, [key]: value } : c)));

  const addCompetitorRow = () =>
    setCompetitors((prev) => (prev.length >= 6 ? prev : [...prev, { brandName: "", domain: "" }]));

  const removeCompetitorRow = (i: number) =>
    setCompetitors((prev) => prev.filter((_, idx) => idx !== i));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) return setError("Brand name is required");
    if (!domain.trim()) return setError("Website domain is required");

    setSubmitting(true);
    try {
      const project = await projectsApi.create({
        name: name.trim(),
        brandName: name.trim(),
        domain: cleanDomain(domain),
        industry: industry.trim() || undefined,
        competitors: competitors
          .filter((c) => c.brandName.trim() || c.domain.trim())
          .map((c) => ({ brandName: c.brandName.trim(), domain: cleanDomain(c.domain) })),
      });
      onCreated(project);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create brand");
      setSubmitting(false);
    }
  }

  const modal = (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.6)", backdropFilter: "blur(3px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-fade-in"
        style={{
          width: "100%", maxWidth: 460, maxHeight: "90vh", overflowY: "auto",
          background: "#141517", border: "1px solid rgba(255,255,255,0.10)",
          borderRadius: 16, boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(201,243,29,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Bot size={18} style={{ color: LIME }} />
            </div>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: "#fff", margin: 0 }}>Add a brand</h2>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: "2px 0 0" }}>Start tracking its AI visibility</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 4 }}>
            <X size={18} style={{ color: "rgba(255,255,255,0.45)" }} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
          {error && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", borderRadius: 10, fontSize: 12.5, background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.25)", color: "#EF4444" }}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              {error}
            </div>
          )}

          <div>
            <label style={labelStyle}>Brand name <span style={{ color: LIME }}>*</span></label>
            <input className="auth-input" style={{ padding: "11px 13px" }} value={name} onChange={(e) => setName(e.target.value)} placeholder="Acme Corp" autoFocus />
          </div>

          <div>
            <label style={labelStyle}>Website domain <span style={{ color: LIME }}>*</span></label>
            <input className="auth-input" style={{ padding: "11px 13px" }} value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="acmecorp.com" />
          </div>

          <div>
            <label style={labelStyle}>Industry <span style={{ color: "rgba(255,255,255,0.30)" }}>(optional)</span></label>
            <input className="auth-input" style={{ padding: "11px 13px" }} value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="B2B SaaS" />
          </div>

          {/* Competitors */}
          <div>
            <label style={labelStyle}>Competitors <span style={{ color: "rgba(255,255,255,0.30)" }}>(optional)</span></label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {competitors.map((c, i) => (
                <div key={i} style={{ display: "flex", gap: 8 }}>
                  <input className="auth-input" style={{ padding: "9px 11px", flex: 1 }} value={c.brandName} onChange={(e) => updateCompetitor(i, "brandName", e.target.value)} placeholder="Competitor name" />
                  <input className="auth-input" style={{ padding: "9px 11px", flex: 1 }} value={c.domain} onChange={(e) => updateCompetitor(i, "domain", e.target.value)} placeholder="rival.com" />
                  <button type="button" onClick={() => removeCompetitorRow(i)} title="Remove" style={{ flexShrink: 0, width: 36, borderRadius: 9, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Trash2 size={14} style={{ color: "rgba(255,255,255,0.40)" }} />
                  </button>
                </div>
              ))}
            </div>
            {competitors.length < 6 && (
              <button type="button" onClick={addCompetitorRow} style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 10, background: "none", border: "none", cursor: "pointer", color: LIME, fontSize: 12.5, fontWeight: 500, padding: 0 }}>
                <Plus size={14} /> Add competitor
              </button>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button type="button" onClick={onClose} className="btn-ghost" style={{ flex: 1, padding: "11px", fontSize: 13, cursor: "pointer" }}>
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-lime" style={{ flex: 1, padding: "11px", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, opacity: submitting ? 0.7 : 1, cursor: submitting ? "not-allowed" : "pointer" }}>
              {submitting ? <><Loader2 size={15} className="auth-spin" /> Creating…</> : "Create brand"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(modal, document.body);
}
