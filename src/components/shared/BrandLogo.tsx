"use client";

import { useEffect, useState } from "react";
import { getApiBase } from "@/lib/apiBase";

const LIME = "#C9F31D";

// Normalize "https://www.Acme.com/path" → "acme.com"
function cleanDomain(raw?: string): string {
  return (raw ?? "")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "");
}

/**
 * Renders a brand's logo from its domain (Clearbit logo API). Falls back to a
 * coloured initial when there's no domain or the logo can't be fetched, so
 * every brand always shows *something* — never a broken image.
 */
export default function BrandLogo({
  domain,
  name,
  size = 24,
  radius = 6,
  fallbackBg = LIME,
  fallbackColor = "#000",
}: {
  domain?: string;
  name: string;
  size?: number;
  radius?: number;
  fallbackBg?: string;
  fallbackColor?: string;
}) {
  const clean = cleanDomain(domain);

  // Load the domain's icon through OUR backend proxy (first-party), so privacy
  // /ad blockers and third-party flakiness can't break it. The backend resolves
  // Google → DuckDuckGo server-side and caches the result; if it has no real
  // icon it 404s and we fall back to the letter avatar below.
  const apiBase = getApiBase();
  const [failed, setFailed] = useState(false);

  // Reset the error state whenever the domain changes (switching brands).
  useEffect(() => { setFailed(false); }, [clean]);

  if (clean && !failed) {
    return (
      <img
        src={`${apiBase}/favicon?domain=${encodeURIComponent(clean)}`}
        alt={name}
        width={size}
        height={size}
        onError={() => setFailed(true)}
        style={{
          width: size, height: size, borderRadius: radius, flexShrink: 0,
          objectFit: "contain", background: "#fff",
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: size, height: size, borderRadius: radius, flexShrink: 0,
        background: fallbackBg, color: fallbackColor,
        fontSize: Math.round(size * 0.42), fontWeight: 700,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      {(name || "?").charAt(0).toUpperCase()}
    </div>
  );
}
