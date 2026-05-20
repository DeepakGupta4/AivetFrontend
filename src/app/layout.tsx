import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "AIVet — AI Visibility & GEO Platform",
  description: "Track your brand across ChatGPT, Gemini, Claude & Perplexity. AI Visibility Scoring, GEO Optimization, Competitor Analysis.",
  keywords: ["AI visibility", "GEO", "generative engine optimization", "brand tracking", "AI search"],
};

export const viewport: Viewport = {
  themeColor: "#0E0F11",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      {/* suppressHydrationWarning: browser extensions add attributes to <body> before
          React hydrates, which would otherwise flag a harmless hydration mismatch. */}
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
