"use client";

import { useCallback, useEffect, useState } from "react";
import Topbar from "@/components/shared/Topbar";
import { useAuthStore } from "@/lib/stores/authStore";
import { billingApi, type SubscriptionData } from "@/lib/api/billing";
import {
  CheckCircle2, Zap, Crown, Building2, CreditCard, Activity, Loader2, AlertCircle, RefreshCw,
} from "lucide-react";

const card: React.CSSProperties = { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 };

const PLANS = [
  { key: "starter", name: "Starter", price: 49, icon: Zap, color: "#22B8CF", features: ["3 projects", "1,000 prompts/month", "4 AI models", "Basic GEO recommendations", "CSV export"] },
  { key: "pro", name: "Pro", price: 149, icon: Crown, color: "#C9F31D", features: ["10 projects", "10,000 prompts/month", "All AI engines", "Advanced GEO engine", "PDF reports", "Competitor tracking", "Scheduled reports"] },
  { key: "enterprise", name: "Enterprise", price: 499, icon: Building2, color: "#C084FC", features: ["50 projects", "100,000 prompts/month", "All AI models", "White-label reports", "Custom integrations", "Dedicated support", "SLA guarantee"] },
];

export default function BillingPage() {
  const project = useAuthStore((s) => s.project);
  const [sub, setSub] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acting, setActing] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { setSub(await billingApi.getSubscription()); }
    catch (err) { setError(err instanceof Error ? err.message : "Failed to load billing"); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  async function upgrade(plan: string) {
    setActing(plan); setError(null);
    try {
      const { url } = await billingApi.checkout(plan);
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout unavailable");
      setActing(null);
    }
  }
  async function manage() {
    setActing("portal"); setError(null);
    try {
      const { url } = await billingApi.portal();
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Billing portal unavailable");
      setActing(null);
    }
  }

  const currentPlan = sub?.plan ?? "free";
  const promptLimit = sub?.limits?.promptLimit ?? 0;
  const projectLimit = sub?.limits?.projectLimit ?? 0;
  const promptsUsed = sub?.usage?.promptsUsed ?? 0;
  const projectsUsed = sub?.usage?.projectsUsed ?? 0;

  const usage = [
    { label: "Prompts (30d)", used: promptsUsed, total: promptLimit, color: "#C9F31D" },
    { label: "Projects", used: projectsUsed, total: projectLimit, color: "#22B8CF" },
  ];

  return (
    <div style={{ background: "#0E0F11", minHeight: "100vh" }}>
      <Topbar title="Billing" subtitle={project ? `${project.name} · ${project.domain}` : "Manage your subscription and usage"} />

      <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>

        {error && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: 10, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "rgba(255,255,255,0.65)" }}><AlertCircle size={14} style={{ color: "#EF4444" }} /> {error}</span>
            <button onClick={load} style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 7, border: "none", cursor: "pointer", background: "rgba(239,68,68,0.12)", color: "#EF4444", fontSize: 11, fontWeight: 600 }}><RefreshCw size={11} /> Retry</button>
          </div>
        )}

        {/* Current plan banner */}
        <div style={{ borderRadius: 12, padding: "18px 22px", background: "rgba(201,243,29,0.05)", border: "1px solid rgba(201,243,29,0.22)", display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 42, height: 42, borderRadius: 11, flexShrink: 0, background: "rgba(201,243,29,0.14)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Crown size={19} style={{ color: "#C9F31D" }} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#fff", margin: "0 0 3px 0", textTransform: "capitalize" }}>
              {loading ? "Loading…" : `${currentPlan} Plan`} {sub && <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: "rgba(34,197,94,0.14)", color: "#22C55E", marginLeft: 6, textTransform: "capitalize" }}>{sub.status}</span>}
            </p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.50)", margin: 0 }}>
              {promptLimit.toLocaleString()} prompts/mo · {projectLimit} projects included
            </p>
          </div>
          <button onClick={manage} disabled={acting === "portal"} style={{ padding: "8px 16px", borderRadius: 8, cursor: "pointer", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", color: "rgba(255,255,255,0.75)", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 7 }}>
            {acting === "portal" ? <Loader2 size={13} className="auth-spin" /> : <CreditCard size={13} />} Manage billing
          </button>
        </div>

        {/* Usage */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
          {usage.map(({ label, used, total, color }) => {
            const pct = total ? Math.min(100, Math.round((used / total) * 100)) : 0;
            const high = pct >= 80;
            const barColor = high ? "#EF4444" : color;
            return (
              <div key={label} style={{ ...card, padding: "18px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 7, background: `${barColor}15`, border: `1px solid ${barColor}25`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Activity size={13} style={{ color: barColor }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.60)" }}>{label}</span>
                  </div>
                  {high && <span style={{ fontSize: 9, fontWeight: 800, padding: "2px 7px", borderRadius: 20, background: "rgba(239,68,68,0.12)", color: "#EF4444" }}>HIGH USAGE</span>}
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 10 }}>
                  <span style={{ fontSize: 26, fontWeight: 800, color: "#fff", lineHeight: 1 }}>{loading ? "—" : used.toLocaleString()}</span>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.30)" }}>/ {total.toLocaleString()}</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 3, width: `${pct}%`, background: high ? "linear-gradient(90deg,#EF444499,#EF4444)" : `linear-gradient(90deg,${color}88,${color})`, transition: "width 0.8s ease" }} />
                </div>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", margin: "8px 0 0" }}>{pct}% used</p>
              </div>
            );
          })}
        </div>

        {/* Plans */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {PLANS.map((plan) => {
            const PlanIcon = plan.icon;
            const isCurrent = currentPlan === plan.key;
            return (
              <div key={plan.key} style={{ ...card, padding: "24px 22px", display: "flex", flexDirection: "column", gap: 20, position: "relative", border: isCurrent ? `1px solid ${plan.color}45` : "1px solid rgba(255,255,255,0.08)", background: isCurrent ? `${plan.color}06` : "rgba(255,255,255,0.03)" }}>
                {isCurrent && <div style={{ position: "absolute", top: 16, right: 16, fontSize: 9, fontWeight: 800, padding: "3px 9px", borderRadius: 20, background: plan.color, color: "#000", letterSpacing: "0.06em" }}>CURRENT</div>}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: `${plan.color}15`, border: `1px solid ${plan.color}28`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <PlanIcon size={18} style={{ color: plan.color }} />
                  </div>
                  <span style={{ fontSize: 16, fontWeight: 800, color: "#fff" }}>{plan.name}</span>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                  <span style={{ fontSize: 36, fontWeight: 900, color: "#fff", lineHeight: 1, letterSpacing: "-1px" }}>${plan.price}</span>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>/month</span>
                </div>
                <div style={{ height: 1, background: "rgba(255,255,255,0.07)" }} />
                <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
                  {plan.features.map((f) => (
                    <div key={f} style={{ display: "flex", alignItems: "center", gap: 9 }}>
                      <CheckCircle2 size={13} style={{ color: plan.color, flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: "rgba(255,255,255,0.68)" }}>{f}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => !isCurrent && upgrade(plan.key)}
                  disabled={isCurrent || acting === plan.key}
                  style={{ width: "100%", padding: "11px 0", borderRadius: 9, cursor: isCurrent ? "default" : "pointer", fontSize: 13, fontWeight: 700, border: "none", background: isCurrent ? `${plan.color}20` : plan.color, color: isCurrent ? plan.color : "#000", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}
                >
                  {acting === plan.key ? <Loader2 size={14} className="auth-spin" /> : null}
                  {isCurrent ? "Current Plan" : `Upgrade to ${plan.name}`}
                </button>
              </div>
            );
          })}
        </div>

        <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.35)", textAlign: "center", margin: 0 }}>
          Invoices &amp; payment methods are managed in the secure Stripe billing portal — click “Manage billing”.
        </p>
      </div>
    </div>
  );
}
