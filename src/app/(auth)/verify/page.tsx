"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Bot, Loader2, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { authApi } from "@/lib/api/auth";
import { projectsApi } from "@/lib/api/projects";
import { useAuthStore } from "@/lib/stores/authStore";

const LIME = "#C9F31D";

function VerifyInner() {
  const router = useRouter();
  const params = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);
  const setProject = useAuthStore((s) => s.setProject);

  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [message, setMessage] = useState("Verifying your secure sign-in link…");
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const token = params.get("token");
    const email = params.get("email");
    if (!token || !email) {
      setStatus("error");
      setMessage("This sign-in link is missing required information.");
      return;
    }

    authApi.magicLinkVerify(token, email)
      .then(async (res) => {
        setAuth(res.token, { id: res.userId, email: res.email, full_name: res.fullName });
        const projects = await projectsApi.list().catch(() => []);
        if (projects.length) {
          const p = projects[0];
          setProject({ id: p._id, name: p.name, domain: p.domain, brandName: p.brandName });
        }
        setStatus("success");
        setMessage(`Welcome back, ${res.email}. Redirecting…`);
        setTimeout(() => router.push("/overview"), 700);
      })
      .catch((err: Error) => {
        setStatus("error");
        setMessage(err.message?.includes("expired") || err.message?.includes("Invalid")
          ? "This link has expired or was already used. Request a new one to continue."
          : err.message || "We couldn't verify this sign-in link.");
      });
  }, [params, router, setAuth, setProject]);

  const icon = status === "verifying"
    ? <Loader2 size={26} className="auth-spin" style={{ color: LIME }} />
    : status === "success"
    ? <CheckCircle2 size={26} style={{ color: "#22C55E" }} />
    : <AlertCircle size={26} style={{ color: "#EF4444" }} />;

  const title = status === "verifying" ? "Signing you in…" : status === "success" ? "Signed in" : "Sign-in failed";

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "#0E0F11" }}>
      <div style={{ width: "100%", maxWidth: 380, textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: LIME, display: "flex", alignItems: "center", justifyContent: "center" }}><Bot size={19} color="#000" strokeWidth={2.5} /></div>
          <span style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>AIVet</span>
        </div>
        <div style={{ width: 56, height: 56, borderRadius: 15, margin: "0 auto 18px", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>{icon}</div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#fff", margin: 0 }}>{title}</h1>
        <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.55)", marginTop: 8, lineHeight: 1.6 }}>{message}</p>
        {status === "error" && (
          <Link href="/login" style={{ display: "inline-flex", alignItems: "center", gap: 7, marginTop: 22, padding: "10px 18px", borderRadius: 9, background: LIME, color: "#000", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
            Request a new link <ArrowRight size={14} />
          </Link>
        )}
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#0E0F11" }} />}>
      <VerifyInner />
    </Suspense>
  );
}
