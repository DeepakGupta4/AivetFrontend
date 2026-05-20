import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import { queryKeys, performanceMonitor } from "../queryClient";
import { useAuthStore } from "../stores/authStore";

export interface DashboardData {
  kpis: {
    totalPrompts: number;
    totalMentions: number;
    mentionFrequency: number;
    citationsFound: number;
    competitorsTracked: number;
    modelsActive: number;
    promptsChange?: number;
    mentionsChange?: number;
    mentionFreqChange?: number;
  };
  currentScore: number;
  scoreBand?: string;
  scoreChange: number;
  trend: Array<{ scoreDate: string; overallScore: number; totalMentions: number }>;
  modelDistribution: Array<{ model: string; score: number; mentions: number }>;
  competitors: Array<{ brand: string; score: number; isOwn: boolean }>;
  recentMentions: Array<{ model: string; prompt: string; sentiment: string; rank: number | null; time: string }>;
  scoreBreakdown: {
    mentionScore: number;
    rankingScore: number;
    sentimentScore: number;
    citationScore: number;
    diversityScore: number;
  } | null;
}

export function useDashboard(days: number = 30) {
  const projectId = useAuthStore((s) => s.projectId);

  const query = useQuery({
    queryKey: queryKeys.dashboard(projectId || "demo", days),
    queryFn: async (): Promise<DashboardData> => {
      // No project connected → illustrative demo data.
      if (!projectId) return getDemoData();
      const start = Date.now();
      const data = await api.get<DashboardData>(`/projects/${projectId}/dashboard?days=${days}`);
      performanceMonitor.logSlowQuery(queryKeys.dashboard(projectId, days), Date.now() - start);
      return data;
    },
    staleTime: projectId ? 2 * 60 * 1000 : Infinity,
    gcTime: projectId ? 5 * 60 * 1000 : Infinity,
    retry: (count) => !!projectId && count < 2,
  });

  return {
    data: query.data,
    loading: query.isLoading,
    error: query.error ? (query.error as Error).message : null,
    isFetching: query.isFetching,
    refetch: query.refetch,
  };
}

// Illustrative data shown only when no project is connected.
function getDemoData(): DashboardData {
  return {
    kpis: {
      totalPrompts: 1284, totalMentions: 487, mentionFrequency: 37.9,
      citationsFound: 93, competitorsTracked: 4, modelsActive: 4,
      promptsChange: 12, mentionsChange: 18, mentionFreqChange: 5,
    },
    currentScore: 72,
    scoreBand: "STRONG",
    scoreChange: 8.4,
    trend: [
      { scoreDate: "2024-01-01", overallScore: 65, totalMentions: 420 },
      { scoreDate: "2024-01-02", overallScore: 67, totalMentions: 435 },
      { scoreDate: "2024-01-03", overallScore: 69, totalMentions: 450 },
      { scoreDate: "2024-01-04", overallScore: 71, totalMentions: 470 },
      { scoreDate: "2024-01-05", overallScore: 72, totalMentions: 487 },
    ],
    modelDistribution: [
      { model: "chatgpt", score: 78, mentions: 142 },
      { model: "gemini", score: 65, mentions: 98 },
      { model: "claude", score: 82, mentions: 156 },
      { model: "perplexity", score: 71, mentions: 91 },
    ],
    competitors: [
      { brand: "Acme Corp", score: 72, isOwn: true },
      { brand: "RivalCo", score: 85, isOwn: false },
      { brand: "TechBrand", score: 61, isOwn: false },
      { brand: "StartupXYZ", score: 44, isOwn: false },
    ],
    recentMentions: [
      { model: "chatgpt", prompt: "Best CRM tools for startups", sentiment: "positive", rank: 1, time: "2m ago" },
      { model: "claude", prompt: "Top project management software", sentiment: "positive", rank: 2, time: "8m ago" },
      { model: "gemini", prompt: "Acme Corp vs competitors", sentiment: "neutral", rank: 1, time: "15m ago" },
      { model: "perplexity", prompt: "Enterprise software solutions", sentiment: "positive", rank: 3, time: "22m ago" },
    ],
    scoreBreakdown: {
      mentionScore: 76, rankingScore: 68, sentimentScore: 82, citationScore: 55, diversityScore: 100,
    },
  };
}
