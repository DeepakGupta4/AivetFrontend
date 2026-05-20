import { api } from "./client";

export interface TrendPointDTO {
  scoreDate:        string;
  overallScore:     number;
  mentionScore:     number | null;
  rankingScore:     number | null;
  sentimentScore:   number | null;
  citationScore:    number | null;
  diversityScore:   number | null;
  totalPrompts:     number | null;
  totalMentions:    number | null;
  modelsBreakdown:  Record<string, number> | null;
}

export interface DashboardKpis {
  totalPrompts:       number;
  totalMentions:      number;
  mentionFrequency:   number;
  citationsFound:     number;
  competitorsTracked: number;
  modelsActive:       number;
  promptsChange:      number;
  mentionsChange:     number;
  mentionFreqChange:  number;
}

export interface ModelDistributionDTO {
  model:    string;
  score:    number;
  mentions: number;
}

export interface CompetitorShareDTO {
  brand: string;
  score: number;
  isOwn: boolean;
}

export interface RecentMentionDTO {
  model:     string;
  prompt:    string;
  sentiment: string;
  rank:      number | null;
  time:      string;
}

export interface ScoreBreakdownDTO {
  mentionScore:   number;
  rankingScore:   number;
  sentimentScore: number;
  citationScore:  number;
  diversityScore: number;
}

export interface DashboardData {
  currentScore:      number;
  scoreBand:         string;
  scoreChange:       number;
  kpis:              DashboardKpis;
  trend:             TrendPointDTO[];
  modelDistribution: ModelDistributionDTO[];
  competitors:       CompetitorShareDTO[];
  recentMentions:    RecentMentionDTO[];
  scoreBreakdown:    ScoreBreakdownDTO | null;
}

export interface ModelBreakdownDTO {
  model:     string;
  score:     number;
  mentions:  number;
  change:    number;
  sentiment: string;
  topPrompt: string | null;
  factors:   { mention: number; ranking: number; sentiment: number; citation: number };
}

export interface VisibilityData {
  currentScore: number;
  scoreBand:    string;
  scoreChange:  number;
  trend:        { scoreDate: string; overallScore: number; totalMentions: number }[];
  models:       ModelBreakdownDTO[];
}

export interface CompetitorEntity {
  name:     string;
  isOwn:    boolean;
  score:    number;
  mentions: number;
  perModel: Record<string, number>;
}

export interface CompetitorAnalysis {
  brandName: string;
  models:    string[];
  entities:  CompetitorEntity[];
}

export interface CitationSource {
  domain:    string;
  count:     number;
  isBrand:   boolean;
  authority: number;
  models:    string[];
}

export interface CitationsData {
  totalCitations: number;
  brandCitations: number;
  brandShare:     number;
  uniqueDomains:  number;
  sources:        CitationSource[];
  opportunities:  CitationSource[];
}

export const visibilityApi = {
  getDashboard: (projectId: string, days = 30) =>
    api.get<DashboardData>(`/projects/${projectId}/dashboard?days=${days}`),

  getVisibility: (projectId: string, days = 30) =>
    api.get<VisibilityData>(`/projects/${projectId}/visibility?days=${days}`),

  getCompetitorAnalysis: (projectId: string, days = 30) =>
    api.get<CompetitorAnalysis>(`/projects/${projectId}/competitor-analysis?days=${days}`),

  getCitations: (projectId: string, days = 30) =>
    api.get<CitationsData>(`/projects/${projectId}/citations?days=${days}`),

  getGeo: (projectId: string, days = 30) =>
    api.get<GeoData>(`/projects/${projectId}/geo?days=${days}`),
};

export interface GeoRecommendation {
  id:          string;
  type:        string;
  priority:    "high" | "medium" | "low";
  title:       string;
  description: string;
  impact:      number;
  effort:      number;
  actionItems: string[];
}

export interface GeoData {
  recommendations: GeoRecommendation[];
  counts:          { high: number; medium: number; low: number };
  hasData:         boolean;
}

