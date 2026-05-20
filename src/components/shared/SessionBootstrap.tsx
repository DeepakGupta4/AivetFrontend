"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/authStore";
import { projectsApi } from "@/lib/api/projects";

/**
 * Runs once on the client inside the dashboard. Guards the dashboard behind
 * auth and makes sure an active project is selected so data hooks can load.
 */
export default function SessionBootstrap() {
  const router      = useRouter();
  const token       = useAuthStore((s) => s.token);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  // Not signed in → go to login. Wait for rehydration first, otherwise a reload
  // sees token=null for one render and bounces a logged-in user to /login.
  useEffect(() => {
    if (!hasHydrated) return;
    if (!token) router.replace("/login");
  }, [hasHydrated, token, router]);

  // Reconcile the selected brand against the user's actual team projects. This
  // runs once per session and fixes the case where localStorage still holds a
  // brand from a previous account (which would otherwise show a "phantom" brand
  // that vanishes the moment you add a new one).
  useEffect(() => {
    if (!hasHydrated || !token) return;
    let cancelled = false;

    projectsApi
      .list()
      .then((projects) => {
        if (cancelled) return;
        const { projectId, setProject, clearProject } = useAuthStore.getState();
        if (!projects.length) {
          // User has no brands → drop any stale stored brand.
          if (projectId) clearProject();
          return;
        }
        // Keep the stored brand only if it actually belongs to this user;
        // otherwise fall back to their first brand.
        const chosen = projects.find((p) => p._id === projectId) ?? projects[0];
        setProject({ id: chosen._id, name: chosen.name, domain: chosen.domain, brandName: chosen.brandName });
      })
      .catch(() => { /* leave as-is → dashboard shows demo data */ });

    return () => { cancelled = true; };
  }, [hasHydrated, token]);

  return null;
}
