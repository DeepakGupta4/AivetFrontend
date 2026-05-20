export type Tier = "free" | "starter" | "pro" | "enterprise";

export const TIER_RANK: Record<Tier, number> = { free: 0, starter: 1, pro: 2, enterprise: 3 };
export const TIER_LABEL: Record<Tier, string> = { free: "Free", starter: "Starter", pro: "Pro", enterprise: "Enterprise" };
export const NEXT_TIER: Record<Tier, Tier | null> = { free: "starter", starter: "pro", pro: "enterprise", enterprise: null };

// Minimum tier required to use a feature (keyed by route slug).
export const FEATURE_MIN_TIER: Record<string, Tier> = {
  competitors: "pro",
  geo: "pro",
  reports: "pro",
};

export function tierAllows(userTier: Tier, feature: string): boolean {
  const need = FEATURE_MIN_TIER[feature];
  if (!need) return true;
  return TIER_RANK[userTier] >= TIER_RANK[need];
}

export function normalizeTier(plan?: string | null): Tier {
  const p = (plan ?? "free").toLowerCase();
  return (["free", "starter", "pro", "enterprise"].includes(p) ? p : "free") as Tier;
}
