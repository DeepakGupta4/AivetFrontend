import { api } from "./client";

export interface AuthResult {
  token:    string;
  userId:   string;
  email:    string;
  fullName: string;
  teamId:   string;
}

export interface MeData {
  id:           string;
  email:        string;
  fullName:     string;
  avatarUrl?:   string | null;
  createdAt?:   string;
  lastLoginAt?: string;
}

export const authApi = {
  login: (email: string, password: string) =>
    api.post<AuthResult>("/auth/login", { email, password }),

  me: () => api.get<MeData>("/auth/me"),

  updateProfile: (payload: { fullName?: string; avatarUrl?: string }) =>
    api.put<MeData>("/auth/me", payload),

  register: (email: string, password: string, fullName: string) =>
    api.post<AuthResult>("/auth/register", { email, password, fullName }),

  magicLinkSend: (email: string, deviceId?: string) =>
    api.post<{ message: string; devLink?: string }>("/auth/magic-link/send", { email, deviceId }),

  magicLinkVerify: (token: string, email: string) =>
    api.post<AuthResult>("/auth/magic-link/verify", { token, email }),

  // Cross-device sign-in: poll until the link is opened on any device.
  magicLinkPoll: (deviceId: string) =>
    api.post<{ pending?: boolean } & Partial<AuthResult>>("/auth/magic-link/poll", { deviceId }),
};
