import { api } from "./client";

export interface ProjectDTO {
  _id:          string;
  name:         string;
  domain:       string;
  brandName:    string;
  industry?:    string;
  targetRegion: string;
  competitors?: { domain: string; brandName: string }[];
}

export interface CreateProjectPayload {
  name:          string;
  domain:        string;
  brandName:     string;
  industry?:     string;
  targetRegion?: string;
  competitors?:  { brandName: string; domain: string }[];
}

export interface CompetitorEntry {
  _id?:      string;
  brandName: string;
  domain:    string;
}

export const projectsApi = {
  list:   () => api.get<ProjectDTO[]>("/projects"),
  create: (payload: CreateProjectPayload) => api.post<ProjectDTO>("/projects", payload),
  update: (id: string, payload: Partial<CreateProjectPayload>) => api.put<ProjectDTO>(`/projects/${id}`, payload),

  listCompetitors:  (id: string) => api.get<CompetitorEntry[]>(`/projects/${id}/competitors`),
  addCompetitor:    (id: string, payload: { brandName: string; domain: string }) =>
    api.post<CompetitorEntry[]>(`/projects/${id}/competitors`, payload),
  removeCompetitor: (id: string, competitorId: string) =>
    api.delete<CompetitorEntry[]>(`/projects/${id}/competitors/${competitorId}`),
};
