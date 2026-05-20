import { api } from "./client";

export interface SubscriptionData {
  plan:              string;
  status:            string;
  currentPeriodEnd:  string | null;
  cancelAtPeriodEnd: boolean;
  limits:            { promptLimit: number; projectLimit: number };
  usage:             { promptsUsed: number; projectsUsed: number };
}

export const billingApi = {
  getSubscription: () => api.get<SubscriptionData>("/billing/subscription"),
  checkout: (plan: string) => api.post<{ url: string }>("/billing/checkout", { plan }),
  portal:   () => api.post<{ url: string }>("/billing/portal", {}),
};
