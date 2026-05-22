"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, ArrowRight, ArrowLeft, Loader2, AlertCircle, Sparkles } from "lucide-react";
import BrandLogo from "@/components/shared/BrandLogo";
import { onboardingApi, type BusinessSummary } from "@/lib/api/onboarding";
import type { ProjectDTO } from "@/lib/api/projects";
import {
  LIME, type CompetitorRow, type ClusterRow, type KeywordRow,
} from "./shared";
import BusinessSummaryStep from "./BusinessSummaryStep";
import CompetitorsStep from "./CompetitorsStep";
import PromptsStep from "./PromptsStep";
import KeywordsStep from "./KeywordsStep";

const TOPIC_PRESELECT = 5;
const PROMPT_PRESELECT = 10;
const KEYWORD_PRESELECT = 15;

const STEP_META = [
  { title: "Your business summary", subtitle: "Review the information we found about your business. We'll use it to tailor your SEO and GEO plan." },
  { title: "Competitor Websites", subtitle: "Review suggested competitors for you to track and continue." },
  { title: "AI prompts to track", subtitle: "Review suggested prompts to track your visibility in ChatGPT and Gemini." },
  { title: "Keywords to track", subtitle: "Review and select the keywords you want to track. We'll monitor your rankings for these." },
];

function cleanDomain(raw: string): string {
  return raw.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/.*$/, "");
}

interface Props {
  onClose: () => void;
  onCreated: (project: ProjectDTO) => void;
}

export default function OnboardingWizard({ onClose, onCreated }: Props) {
  const [step, setStep] = useState(0);            // 0 = domain entry, 1-4 = wizard steps
  const [domain, setDomain] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [summary, setSummary] = useState<BusinessSummary | null>(null);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [sitemaps, setSitemaps] = useState<string[]>([]);
  const [competitors, setCompetitors] = useState<CompetitorRow[]>([]);

  const [clusters, setClusters] = useState<ClusterRow[] | null>(null);
  const [activeCluster, setActiveCluster] = useState(0);
  const [promptsLoading, setPromptsLoading] = useState(false);

  const [keywords, setKeywords] = useState<KeywordRow[] | null>(null);
  const [keywordsLoading, setKeywordsLoading] = useState(false);

  const [creating, setCreating] = useState(false);

  const promptsRequested = useRef(false);
  const keywordsRequested = useRef(false);

  // Close on Escape (but not while a network op is mid-flight).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && !analyzing && !creating) onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, analyzing, creating]);

  const market = summary ? `${(summary.languageCode || "en").toUpperCase()}-${(summary.countryCode || "US").toUpperCase()}` : "EN-US";

  // ── Step 0 → analyze ──────────────────────────────────────────────────────
  async function handleAnalyze() {
    const d = cleanDomain(domain);
    if (!d) return setError("Enter a website domain to continue");
    setError(null);
    setAnalyzing(true);
    try {
      const s = await onboardingApi.analyze(d);
      setSummary(s);
      setSelectedTopics(s.topics.slice(0, TOPIC_PRESELECT));
      setCompetitors(s.competitors.map((c) => ({ ...c, selected: true })));
      setStep(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not analyze this website");
    } finally {
      setAnalyzing(false);
    }
  }

  const toggleTopic = (t: string) =>
    setSelectedTopics((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  // ── Lazy fetch: prompts on step 3, keywords on step 4 ─────────────────────
  useEffect(() => {
    if (step !== 3 || !summary || promptsRequested.current) return;
    promptsRequested.current = true;
    setPromptsLoading(true);
    onboardingApi
      .prompts({
        brandName: summary.brandName,
        domain: summary.domain,
        businessType: summary.businessType,
        topics: selectedTopics.length ? selectedTopics : summary.topics.slice(0, TOPIC_PRESELECT),
        country: summary.country,
        language: summary.language,
      })
      .then(({ clusters: cl }) => {
        let budget = PROMPT_PRESELECT;
        const rows: ClusterRow[] = cl.map((c) => ({
          topic: c.topic,
          prompts: c.prompts.map((text, i) => {
            const selected = i < 2 && budget > 0;
            if (selected) budget--;
            return { text, selected };
          }),
        }));
        setClusters(rows);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Could not generate prompts"))
      .finally(() => setPromptsLoading(false));
  }, [step, summary, selectedTopics]);

  useEffect(() => {
    if (step !== 4 || !summary || keywordsRequested.current) return;
    keywordsRequested.current = true;
    setKeywordsLoading(true);
    onboardingApi
      .keywords({
        domain: summary.domain,
        countryCode: summary.countryCode,
        languageCode: summary.languageCode,
        topics: selectedTopics.length ? selectedTopics : summary.topics,
        brandName: summary.brandName,
      })
      .then(({ keywords: kw }) => {
        setKeywords(kw.map((k, i) => ({ ...k, selected: i < KEYWORD_PRESELECT })));
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Could not fetch keywords"))
      .finally(() => setKeywordsLoading(false));
  }, [step, summary]);

  // ── Final create ──────────────────────────────────────────────────────────
  async function handleComplete() {
    if (!summary) return;
    setError(null);
    setCreating(true);
    try {
      const selectedPrompts =
        (clusters ?? []).flatMap((c) => c.prompts.filter((p) => p.selected).map((p) => ({ text: p.text, category: c.topic })));
      const project = await onboardingApi.complete({
        brandName: summary.brandName.trim() || cleanDomain(summary.domain),
        domain: cleanDomain(summary.domain),
        businessType: summary.businessType,
        language: summary.language,
        languageCode: summary.languageCode,
        country: summary.country,
        countryCode: summary.countryCode,
        about: summary.about.filter((x) => x.trim()),
        competitiveAdvantage: summary.competitiveAdvantage,
        keyFeatures: summary.keyFeatures.filter((x) => x.trim()),
        targetCustomers: summary.targetCustomers.filter((x) => x.trim()),
        topics: selectedTopics,
        sitemaps,
        competitors: competitors.filter((c) => c.selected).map((c) => ({ brandName: c.brandName, domain: c.domain })),
        keywords: (keywords ?? []).filter((k) => k.selected).map((k) => ({ keyword: k.keyword, searchVolume: k.searchVolume, difficulty: k.difficulty })),
        selectedPrompts,
      });
      onCreated(project.project);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the project");
      setCreating(false);
    }
  }

  const next = () => { setError(null); setStep((s) => Math.min(4, s + 1)); };
  const back = () => { setError(null); setStep((s) => Math.max(1, s - 1)); };

  // ── Render ──────────────────────────────────────────────────────────────
  const meta = step >= 1 ? STEP_META[step - 1] : null;

  const content = (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "#0E0F11", display: "flex", flexDirection: "column" }}>
      {/* Close */}
      <button onClick={onClose} disabled={analyzing || creating}
        style={{ position: "absolute", top: 18, right: 22, zIndex: 5, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 9, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", cursor: analyzing || creating ? "not-allowed" : "pointer" }}>
        <X size={17} style={{ color: "rgba(255,255,255,0.55)" }} />
      </button>

      {/* Scrollable body */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto", padding: "40px 32px 120px" }}>
          {/* Header pill + title */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 999, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", marginBottom: 18 }}>
              {summary ? (
                <>
                  <BrandLogo domain={summary.domain} name={summary.brandName} size={18} radius={5} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{summary.brandName}</span>
                </>
              ) : (
                <><Sparkles size={14} style={{ color: LIME }} /><span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>New Project</span></>
              )}
            </div>
            <h1 style={{ fontSize: 34, fontWeight: 800, color: "#fff", margin: "0 0 10px", letterSpacing: "-0.02em" }}>
              {step === 0 ? "Let's set up your brand" : meta?.title}
            </h1>
            <p style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", margin: 0, maxWidth: 620, marginInline: "auto" }}>
              {step === 0 ? "Enter your website and we'll auto-build your business profile, competitors, prompts and keywords." : meta?.subtitle}
            </p>
          </div>

          {error && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 14px", borderRadius: 10, fontSize: 13, background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.25)", color: "#EF4444", maxWidth: 620, margin: "0 auto 22px" }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} /> {error}
            </div>
          )}

          {/* ── Step 0: domain entry ── */}
          {step === 0 && (
            <div style={{ maxWidth: 460, margin: "0 auto" }}>
              <div className="card" style={{ padding: 22 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.55)", marginBottom: 9 }}>
                  Website domain <span style={{ color: LIME }}>*</span>
                </label>
                <input className="auth-input" autoFocus style={{ padding: "13px 14px", fontSize: 15 }}
                  value={domain} onChange={(e) => setDomain(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleAnalyze(); }}
                  placeholder="amazon.com" />
                <button onClick={handleAnalyze} disabled={analyzing} className="btn-lime"
                  style={{ width: "100%", marginTop: 16, padding: "13px", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, cursor: analyzing ? "not-allowed" : "pointer", opacity: analyzing ? 0.75 : 1 }}>
                  {analyzing ? <><Loader2 size={16} className="auth-spin" /> Analyzing your business…</> : <>Analyze <ArrowRight size={16} /></>}
                </button>
              </div>
            </div>
          )}

          {/* ── Steps 1-4 ── */}
          {step === 1 && summary && (
            <BusinessSummaryStep summary={summary} setSummary={setSummary}
              selectedTopics={selectedTopics} toggleTopic={toggleTopic}
              sitemaps={sitemaps} setSitemaps={setSitemaps} />
          )}
          {step === 2 && summary && (
            <CompetitorsStep competitors={competitors} setCompetitors={setCompetitors}
              market={market} countryCode={summary.countryCode} />
          )}
          {step === 3 && summary && (
            <PromptsStep clusters={clusters ?? []} setClusters={(c) => setClusters(c)}
              active={activeCluster} setActive={setActiveCluster}
              loading={promptsLoading} market={market} countryCode={summary.countryCode} />
          )}
          {step === 4 && summary && (
            <KeywordsStep keywords={keywords ?? []} setKeywords={(k) => setKeywords(k)}
              loading={keywordsLoading} market={market} countryCode={summary.countryCode} />
          )}
        </div>
      </div>

      {/* ── Sticky footer ── */}
      {step >= 1 && (
        <div style={{ flexShrink: 0, borderTop: "1px solid rgba(255,255,255,0.08)", background: "rgba(14,15,17,0.85)", backdropFilter: "blur(8px)" }}>
          <div style={{ maxWidth: 1080, margin: "0 auto", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {step > 1 && (
                <button onClick={back} className="btn-ghost" style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <ArrowLeft size={16} />
                </button>
              )}
              {(step === 2 || step === 3) && (
                <button onClick={next} className="btn-ghost" style={{ padding: "10px 18px", fontSize: 13.5, cursor: "pointer" }}>Skip</button>
              )}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
              <span style={{ fontSize: 14, color: "rgba(255,255,255,0.55)" }}>Step {step} of 4</span>
              {step < 4 ? (
                <button onClick={next} className="btn-lime" style={{ padding: "12px 26px", fontSize: 14, display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                  Continue <ArrowRight size={16} />
                </button>
              ) : (
                <button onClick={handleComplete} disabled={creating} className="btn-lime" style={{ padding: "12px 26px", fontSize: 14, display: "flex", alignItems: "center", gap: 8, cursor: creating ? "not-allowed" : "pointer", opacity: creating ? 0.75 : 1 }}>
                  {creating ? <><Loader2 size={16} className="auth-spin" /> Creating…</> : <>Create project <ArrowRight size={16} /></>}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(content, document.body);
}
