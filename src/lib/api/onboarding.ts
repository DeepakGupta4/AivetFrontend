import { api } from "./client";
import type { ProjectDTO } from "./projects";

export interface CompetitorSuggestion {
  brandName: string;
  domain: string;
}

export interface BusinessSummary {
  brandName: string;
  domain: string;
  businessType: string;
  language: string;
  languageCode: string;
  country: string;
  countryCode: string;
  about: string[];
  competitiveAdvantage: string;
  keyFeatures: string[];
  targetCustomers: string[];
  topics: string[];
  competitors: CompetitorSuggestion[];
}

export interface PromptCluster {
  topic: string;
  prompts: string[];
}

export interface KeywordIdea {
  keyword: string;
  searchVolume: number;
  searchVolumeLabel: string;
  difficulty: number;
  market: string;
}

export interface CompletePayload {
  brandName: string;
  domain: string;
  businessType?: string;
  language?: string;
  languageCode?: string;
  country?: string;
  countryCode?: string;
  about?: string[];
  competitiveAdvantage?: string;
  keyFeatures?: string[];
  targetCustomers?: string[];
  topics?: string[];
  sitemaps?: string[];
  competitors?: CompetitorSuggestion[];
  keywords?: { keyword: string; searchVolume: number; difficulty: number }[];
  selectedPrompts?: { text: string; category?: string }[];
}

export const onboardingApi = {
  analyze: (domain: string) =>
    api.post<BusinessSummary>("/onboarding/analyze", { domain }),

  prompts: (payload: {
    brandName: string;
    domain: string;
    businessType?: string;
    topics: string[];
    country?: string;
    language?: string;
  }) => api.post<{ clusters: PromptCluster[] }>("/onboarding/prompts", payload),

  keywords: (payload: { domain: string; countryCode?: string; languageCode?: string }) =>
    api.post<{ keywords: KeywordIdea[] }>("/onboarding/keywords", payload),

  complete: (payload: CompletePayload) =>
    api.post<{ project: ProjectDTO; campaignId: string | null }>("/onboarding/complete", payload),
};
