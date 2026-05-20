// ============================================
// AIVET DESIGN SYSTEM — COLOR TOKENS
// ============================================

export const colors = {
  // Brand
  lime:        "#C9F31D",
  limeDark:    "#A8D017",

  // Dark Surfaces
  black:       "#000000",
  darkBase:    "#0E0F11",
  nearBlack:   "#04000B",
  cardAlt:     "#18191B",

  // Card Backgrounds
  darkCard:    "rgba(255,255,255,0.03)",
  listItem:    "rgba(255,255,255,0.04)",
  highlight:   "rgba(255,255,255,0.06)",
  inputBg:     "rgba(255,255,255,0.08)",
  toggleOff:   "rgba(255,255,255,0.15)",
  limeChip:    "rgba(201,243,29,0.06)",
  limePill:    "rgba(201,243,29,0.12)",
  successChip: "rgba(34,197,94,0.12)",
  warnBanner:  "rgba(245,158,11,0.08)",
  errorCard:   "rgba(239,68,68,0.10)",

  // Text
  textPrimary:  "#FFFFFF",
  textStrong:   "rgba(255,255,255,0.85)",
  textBody:     "rgba(255,255,255,0.75)",
  textDim:      "rgba(255,255,255,0.70)",
  textMuted:    "rgba(255,255,255,0.55)",
  textDisabled: "rgba(255,255,255,0.40)",
  textOnLime:   "#000000",

  // Borders
  borderSubtle:  "rgba(255,255,255,0.08)",
  borderInput:   "rgba(255,255,255,0.12)",
  borderSecBtn:  "rgba(255,255,255,0.20)",
  borderForm:    "rgba(255,255,255,0.30)",
  borderLime:    "rgba(201,243,29,0.25)",
  borderLimeDash:"rgba(201,243,29,0.50)",

  // Semantic
  success:  "#22C55E",
  warning:  "#FBBF24",
  partial:  "#F59E0B",
  weak:     "#F8961E",
  softYellow:"#F9C74F",
  error:    "#EF4444",

  // AI Engine Colors
  chatgpt:    "#10A37F",
  claude:     "#D97757",
  gemini:     "#1A73E8",
  perplexity: "#22B8CF",
  googleAI:   "#1A73E8",

  // Special
  googleHover: "#8AB4F8",
  liveBadge:   "#C084FC",
} as const;

// Visibility Score Bands
export function getScoreBand(score: number): {
  label: string;
  color: string;
  bg: string;
} {
  if (score >= 80) return { label: "DOMINANT",  color: colors.success,    bg: colors.successChip };
  if (score >= 60) return { label: "STRONG",    color: colors.lime,       bg: colors.limePill };
  if (score >= 40) return { label: "BUILDING",  color: colors.softYellow, bg: "rgba(249,199,79,0.12)" };
  if (score >= 20) return { label: "WEAK",      color: colors.weak,       bg: "rgba(248,150,30,0.12)" };
  return              { label: "CRITICAL",  color: colors.error,      bg: colors.errorCard };
}

export const engineColors: Record<string, string> = {
  chatgpt:    colors.chatgpt,
  claude:     colors.claude,
  gemini:     colors.gemini,
  perplexity: colors.perplexity,
  "google-ai": colors.googleAI,
};
