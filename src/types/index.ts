// ============================================
// AIVET — GLOBAL TYPE DEFINITIONS
// ============================================

export type AIModel = "chatgpt" | "gemini" | "claude" | "perplexity" | "google-ai";
export type ScoreBand = "DOMINANT" | "STRONG" | "BUILDING" | "WEAK" | "CRITICAL";
export type Sentiment = "positive" | "neutral" | "negative" | "mixed";
export type PromptStatus = "pending" | "running" | "completed" | "failed";
export type UserRole = "owner" | "admin" | "member" | "viewer";
export type Plan = "free" | "starter" | "pro" | "enterprise";

// ---- User & Auth ----
export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  oauthProvider?: string;
  createdAt: string;
}

export interface Team {
  id: string;
  name: string;
  slug: string;
  plan: Plan;
  ownerId: string;
}

// ---- Project ----
export interface Project {
  id: string;
  teamId: string;
  name: string;
  domain: string;
  brandName: string;
  industry?: string;
  targetRegion: string;
  isActive: boolean;
  createdAt: string;
}

export interface Competitor {
  id: string;
  projectId: string;
  domain: string;
  brandName: string;
}

// ---- Prompts ----
export interface PromptCampaign {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  frequency: "hourly" | "daily" | "weekly";
  isActive: boolean;
  nextRunAt?: string;
  createdAt: string;
  promptCount?: number;
}

export interface Prompt {
  id: string;
  campaignId: string;
  text: string;
  category: "brand" | "product" | "comparison" | "generic";
  intent: "informational" | "commercial" | "navigational";
  isActive: boolean;
}

export interface PromptRun {
  id: string;
  promptId: string;
  campaignId: string;
  status: PromptStatus;
  startedAt?: string;
  completedAt?: string;
  errorMessage?: string;
  createdAt: string;
}

// ---- AI Responses ----
export interface AIResponse {
  id: string;
  promptRunId: string;
  model: string;
  provider: string;
  responseText: string;
  tokensUsed: number;
  latencyMs: number;
  createdAt: string;
}

// ---- Mentions ----
export interface Mention {
  id: string;
  aiResponseId: string;
  entityName: string;
  entityType: "brand" | "product" | "person" | "competitor";
  mentionCount: number;
  rankPosition: number;
  sentiment: Sentiment;
  sentimentScore: number;
  confidence: number;
  contextSnippet?: string;
  createdAt: string;
}

// ---- Visibility Score ----
export interface VisibilityScore {
  id: string;
  projectId: string;
  scoreDate: string;
  overallScore: number;
  mentionScore: number;
  rankingScore: number;
  sentimentScore: number;
  citationScore: number;
  diversityScore: number;
  totalPrompts: number;
  totalMentions: number;
  modelsBreakdown: Record<AIModel, number>;
}

// ---- Citations ----
export interface Citation {
  id: string;
  aiResponseId: string;
  citedUrl: string;
  citedDomain: string;
  isBrandDomain: boolean;
  authorityScore: number;
  createdAt: string;
}

// ---- Dashboard KPIs ----
export interface DashboardKPIs {
  visibilityScore: number;
  scoreBand: ScoreBand;
  scoreChange: number;          // delta vs last period
  totalPrompts: number;
  mentionFrequency: number;     // percentage
  sentimentScore: number;
  citationCount: number;
  competitorCount: number;
  modelsTracked: number;
}

// ---- Chart Data ----
export interface TrendPoint {
  date: string;
  score: number;
  mentions: number;
}

export interface CompetitorShare {
  brand: string;
  score: number;
  color: string;
}

export interface ModelDistribution {
  model: AIModel;
  score: number;
  mentions: number;
  color: string;
}

// ---- GEO Recommendations ----
export interface GEORecommendation {
  id: string;
  type: "content_gap" | "entity" | "schema" | "faq" | "topical" | "ai_friendly";
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  impact: number;   // 0-100
  effort: number;   // 0-100
  actionItems: string[];
}

// ---- API ----
export interface APIResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
