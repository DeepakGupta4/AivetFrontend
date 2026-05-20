"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bot, Eye, EyeOff, ArrowRight, Loader2, AlertCircle, Mail, Lock,
  Check, Sparkles, TrendingUp, MailCheck, ChevronDown,
} from "lucide-react";
import { authApi, type AuthResult } from "@/lib/api/auth";
import { projectsApi } from "@/lib/api/projects";
import { useAuthStore } from "@/lib/stores/authStore";

const LIME = "#C9F31D";
const FEATURES = [
  "AI Visibility Score across every engine",
  "Competitor share-of-voice tracking",
  "GEO recommendations that move the needle",
];
const ENGINES = [
  { label: "ChatGPT", color: "#10A37F" },
  { label: "Gemini", color: "#1A73E8" },
  { label: "Claude", color: "#D97757" },
  { label: "Perplexity", color: "#22B8CF" },
];

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const setProject = useAuthStore((s) => s.setProject);

  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password (dev) fallback
  const [showPwd, setShowPwd] = useState(false);
  const [pwdEmail, setPwdEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);

  async function finishAuth(res: AuthResult) {
    setAuth(res.token, { id: res.userId, email: res.email, full_name: res.fullName });
    const projects = await projectsApi.list().catch(() => []);
    if (projects.length) {
      const p = projects[0];
      setProject({ id: p._id, name: p.name, domain: p.domain, brandName: p.brandName });
    }
    router.push("/overview");
  }

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return setError("Enter your email");
    setError(null); setSending(true);
    try {
      await authApi.magicLinkSend(email.trim());
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send link");
    } finally {
      setSending(false);
    }
  }

  async function passwordLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setPwdLoading(true);
    try {
      const res = await authApi.login(pwdEmail.trim(), password);
      await finishAuth(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
      setPwdLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: "#0E0F11" }}>

      {/* Left — brand showcase */}
      <div className="hidden lg:flex flex-col justify-between relative overflow-hidden" style={{ width: "46%", padding: "48px 56px", background: "linear-gradient(160deg, #111314 0%, #0B0C0E 60%, #0E0F11 100%)", borderRight: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="auth-glow" style={{ position: "absolute", top: "-120px", left: "-80px", width: 420, height: 420, borderRadius: "50%", background: "radial-gradient(circle, rgba(201,243,29,0.16) 0%, rgba(201,243,29,0) 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-140px", right: "-100px", width: 380, height: 380, borderRadius: "50%", background: "radial-gradient(circle, rgba(34,184,207,0.10) 0%, rgba(34,184,207,0) 70%)", pointerEvents: "none" }} />

        <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: LIME, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 24px rgba(201,243,29,0.35)" }}>
            <Bot size={22} color="#000" strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: 20, fontWeight: 700, color: "#fff", letterSpacing: "-0.4px" }}>AIVet</span>
          <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 7px", borderRadius: 5, background: "rgba(201,243,29,0.12)", color: LIME, letterSpacing: "0.04em" }}>PRO</span>
        </div>

        <div style={{ position: "relative" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 18, padding: "5px 11px", borderRadius: 20, background: "rgba(201,243,29,0.08)", border: "1px solid rgba(201,243,29,0.20)" }}>
            <Sparkles size={12} style={{ color: LIME }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: LIME }}>AI Visibility &amp; GEO Platform</span>
          </div>
          <h2 style={{ fontSize: 38, fontWeight: 700, color: "#fff", lineHeight: 1.12, letterSpacing: "-0.8px", margin: 0 }}>See how AI<br />sees your brand.</h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.55)", marginTop: 16, maxWidth: 380, lineHeight: 1.6 }}>Track your visibility across ChatGPT, Gemini, Claude &amp; Perplexity — all from one dashboard.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 32 }}>
            {FEATURES.map((f) => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 22, height: 22, borderRadius: 7, flexShrink: 0, background: "rgba(201,243,29,0.14)", display: "flex", alignItems: "center", justifyContent: "center" }}><Check size={13} style={{ color: LIME }} strokeWidth={3} /></div>
                <span style={{ fontSize: 14, color: "rgba(255,255,255,0.78)" }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 22 }}>
            {ENGINES.map((e) => (
              <span key={e.label} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 600, padding: "5px 10px", borderRadius: 7, background: `${e.color}14`, border: `1px solid ${e.color}30`, color: e.color }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: e.color }} />{e.label}
              </span>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", maxWidth: 320 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, flexShrink: 0, background: "rgba(201,243,29,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}><TrendingUp size={20} style={{ color: LIME }} /></div>
            <div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}><span style={{ fontSize: 24, fontWeight: 700, color: "#fff", lineHeight: 1 }}>+31%</span><span style={{ fontSize: 11, fontWeight: 600, color: LIME }}>this month</span></div>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: "4px 0 0" }}>avg. visibility growth for tracked brands</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right — sign-in */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full" style={{ maxWidth: 396 }}>
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div style={{ width: 36, height: 36, borderRadius: 10, background: LIME, display: "flex", alignItems: "center", justifyContent: "center" }}><Bot size={19} color="#000" strokeWidth={2.5} /></div>
            <span style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>AIVet</span>
          </div>

          {error && (
            <div className="flex items-center gap-2 mb-4" style={{ padding: "10px 12px", borderRadius: 10, fontSize: 12.5, background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.25)", color: "#EF4444" }}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} /> {error}
            </div>
          )}

          {sent ? (
            // Check your email
            <div>
              <div style={{ width: 48, height: 48, borderRadius: 13, background: "rgba(201,243,29,0.12)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
                <MailCheck size={24} style={{ color: LIME }} />
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: "#fff", letterSpacing: "-0.5px", margin: 0 }}>Check your email</h1>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", marginTop: 8, lineHeight: 1.6 }}>
                We sent a sign-in link to <span style={{ color: "#fff", fontWeight: 600 }}>{email}</span>. It expires in 15 minutes and can be used once.
              </p>
              <button onClick={() => setSent(false)} style={{ marginTop: 20, background: "none", border: "none", color: "rgba(255,255,255,0.5)", fontSize: 12.5, cursor: "pointer", textDecoration: "underline" }}>
                Use a different email
              </button>
            </div>
          ) : (
            <>
              <h1 style={{ fontSize: 26, fontWeight: 700, color: "#fff", letterSpacing: "-0.5px", margin: 0 }}>Welcome back</h1>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.50)", marginTop: 6, marginBottom: 24 }}>Sign in with a secure magic link — no password needed.</p>

              {/* Magic link form */}
              <form onSubmit={sendMagicLink} className="space-y-3">
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.60)", marginBottom: 7 }}>Email</label>
                  <div style={{ position: "relative" }}>
                    <Mail size={15} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.35)" }} />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" autoComplete="email" className="auth-input" style={{ padding: "11px 13px 11px 38px" }} />
                  </div>
                </div>
                <button type="submit" disabled={sending} className="w-full flex items-center justify-center gap-2 btn-lime" style={{ padding: "12px", fontSize: 14, cursor: sending ? "not-allowed" : "pointer", opacity: sending ? 0.7 : 1 }}>
                  {sending ? <><Loader2 size={15} className="auth-spin" /> Sending…</> : <>Send sign-in link <ArrowRight size={15} /></>}
                </button>
              </form>

              {/* Password (dev) fallback */}
              <div className="flex items-center gap-3" style={{ margin: "20px 0" }}>
                <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.30)" }}>or</span>
                <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
              </div>

              <button onClick={() => setShowPwd((v) => !v)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 10, padding: "10px", color: "rgba(255,255,255,0.7)", fontSize: 12.5, fontWeight: 500, cursor: "pointer" }}>
                <Lock size={13} /> Sign in with password (dev)
                <ChevronDown size={13} style={{ transform: showPwd ? "rotate(180deg)" : "none", transition: "transform .15s" }} />
              </button>

              {showPwd && (
                <form onSubmit={passwordLogin} className="space-y-3 animate-fade-in" style={{ marginTop: 12 }}>
                  <input type="email" value={pwdEmail} onChange={(e) => setPwdEmail(e.target.value)} placeholder="email" autoComplete="email" className="auth-input" style={{ padding: "10px 13px" }} />
                  <div style={{ position: "relative" }}>
                    <input type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" autoComplete="current-password" className="auth-input" style={{ padding: "10px 40px 10px 13px" }} />
                    <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", display: "flex" }}>
                      {showPass ? <EyeOff size={15} style={{ color: "rgba(255,255,255,0.4)" }} /> : <Eye size={15} style={{ color: "rgba(255,255,255,0.4)" }} />}
                    </button>
                  </div>
                  <button type="submit" disabled={pwdLoading} className="w-full flex items-center justify-center gap-2" style={{ padding: "11px", borderRadius: 10, fontSize: 13, fontWeight: 600, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "#fff", cursor: pwdLoading ? "not-allowed" : "pointer" }}>
                    {pwdLoading ? <><Loader2 size={14} className="auth-spin" /> Signing in…</> : "Sign In"}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
