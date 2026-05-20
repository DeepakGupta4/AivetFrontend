import { useQuery } from "@tanstack/react-query";
import { billingApi, type SubscriptionData } from "../api/billing";
import { useAuthStore } from "../stores/authStore";
import { normalizeTier, tierAllows, type Tier } from "../tiers";

/**
 * Resolves the current plan tier from the subscription (React Query cached) and
 * exposes a feature-gating helper.
 */
export function useTier() {
  const token = useAuthStore((s) => s.token);

  const { data, isLoading } = useQuery<SubscriptionData>({
    queryKey: ["subscription"],
    queryFn: () => billingApi.getSubscription(),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
  });

  const tier: Tier = normalizeTier(data?.plan);

  return {
    tier,
    loading: isLoading,
    // Only true once the plan is actually known — gate features on this so we
    // never flash a "locked" overlay before the subscription resolves.
    resolved: !!data,
    limits: data?.limits,
    usage: data?.usage,
    allows: (feature: string) => tierAllows(tier, feature),
  };
}
