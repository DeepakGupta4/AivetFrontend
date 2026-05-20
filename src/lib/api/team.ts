import { api } from "./client";

export interface TeamMember {
  userId:    string;
  role:      string;
  joinedAt?: string;
  fullName:  string;
  email:     string;
}

export interface TeamData {
  id:      string;
  name:    string;
  slug:    string;
  plan:    string;
  members: TeamMember[];
}

export const teamApi = {
  get: () => api.get<TeamData>("/team"),
};
