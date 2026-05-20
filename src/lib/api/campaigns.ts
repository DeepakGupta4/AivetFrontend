import { api } from "./client";

export interface CampaignPrompt {
  _id?:      string;
  text:      string;
  category?: string;
  intent?:   string;
  isActive?: boolean;
}

export interface CampaignDTO {
  _id:          string;
  projectId:    string;
  name:         string;
  description?: string;
  frequency:    "hourly" | "daily" | "weekly";
  isActive:     boolean;
  nextRunAt?:   string;
  prompts:      CampaignPrompt[];
  createdAt:    string;
  updatedAt:    string;
}

export interface ResponseDTO {
  model:        string;
  provider:     string;
  responseText: string;
  mentions?:    { entityName: string; rankPosition?: number; sentiment?: string }[];
  citations?:   { citedUrl: string; citedDomain: string }[];
}

export interface PromptRunDTO {
  _id:           string;
  campaignId:    string;
  projectId:     string;
  promptText:    string;
  status:        "pending" | "running" | "completed" | "failed";
  startedAt?:    string;
  completedAt?:  string;
  errorMessage?: string;
  responses?:    ResponseDTO[];
  createdAt:     string;
}

export interface CreateCampaignPayload {
  projectId:    string;
  name:         string;
  description?: string;
  frequency:    "hourly" | "daily" | "weekly";
  prompts:      CampaignPrompt[];
}

export interface AuditResult {
  campaignId:  string;
  prompts:     string[];
  promptCount: number;
}

export const campaignsApi = {
  list:   (projectId: string) => api.get<CampaignDTO[]>(`/campaigns?projectId=${projectId}`),
  create: (payload: CreateCampaignPayload) => api.post<CampaignDTO>("/campaigns", payload),
  audit:  (projectId: string, category?: string) => api.post<AuditResult>("/campaigns/audit", { projectId, category }),
  update: (id: string, payload: Partial<CampaignDTO>) => api.put<CampaignDTO>(`/campaigns/${id}`, payload),
  remove: (id: string) => api.delete<{ success: boolean }>(`/campaigns/${id}`),
  run:    (id: string) => api.post<{ queued: number }>(`/campaigns/${id}/run`, {}),
  runs:   (id: string) => api.get<PromptRunDTO[]>(`/campaigns/${id}/runs`),
};
