import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string | null;
}

interface ActiveProject {
  id: string;
  name: string;
  domain: string;
  brandName: string;
}

interface AuthState {
  token:     string | null;
  user:      AuthUser | null;
  projectId: string | null;
  project:   ActiveProject | null;

  // True once zustand has finished rehydrating from localStorage. Until then we
  // must NOT decide the user is signed-out — otherwise a page reload bounces to
  // /login before the persisted token is read back in.
  hasHydrated: boolean;

  setAuth:        (token: string, user: AuthUser) => void;
  setProject:     (project: ActiveProject) => void;
  setProjectId:   (id: string) => void;
  setHasHydrated: (v: boolean) => void;
  clearProject:   () => void;
  logout:         () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token:       null,
      user:        null,
      projectId:   null,
      project:     null,
      hasHydrated: false,

      setAuth: (token, user) => {
        if (typeof window !== "undefined") localStorage.setItem("access_token", token);
        // Clear any brand selected by a previous session/account — it may not
        // belong to this user. SessionBootstrap re-selects the right one.
        set({ token, user, project: null, projectId: null });
      },

      setProject: (project) => set({ project, projectId: project.id }),

      setProjectId: (id) => set({ projectId: id }),

      setHasHydrated: (v) => set({ hasHydrated: v }),

      clearProject: () => set({ project: null, projectId: null }),

      logout: () => {
        if (typeof window !== "undefined") localStorage.removeItem("access_token");
        set({ token: null, user: null, projectId: null, project: null });
      },
    }),
    {
      name: "aivet-auth",
      // hasHydrated is intentionally excluded — it's runtime-only state.
      partialize: (s) => ({ token: s.token, user: s.user, projectId: s.projectId, project: s.project }),
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    }
  )
);
