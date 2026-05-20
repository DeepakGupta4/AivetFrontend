import { QueryClient } from '@tanstack/react-query';

// Create optimized query client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time - how long data is considered fresh
      staleTime: 5 * 60 * 1000, // 5 minutes
      
      // Cache time - how long data stays in cache after component unmounts
      gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime in v4)
      
      // Retry configuration
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      
      // Retry delay with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Refetch on window focus (disabled for better UX)
      refetchOnWindowFocus: false,
      
      // Refetch on reconnect
      refetchOnReconnect: true,
      
      // Refetch on mount if data is stale
      refetchOnMount: true,
    },
    mutations: {
      // Retry mutations once on network error
      retry: (failureCount, error: any) => {
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 1;
      },
    },
  },
});

// Query keys factory for consistent key management
export const queryKeys = {
  // Dashboard queries
  dashboard: (projectId: string, days: number) => ['dashboard', projectId, days] as const,
  dashboardKPIs: (projectId: string) => ['dashboard', 'kpis', projectId] as const,
  
  // Project queries
  projects: () => ['projects'] as const,
  project: (id: string) => ['projects', id] as const,
  projectCompetitors: (id: string) => ['projects', id, 'competitors'] as const,
  
  // Campaign queries
  campaigns: (projectId: string) => ['campaigns', projectId] as const,
  campaign: (id: string) => ['campaigns', id] as const,
  campaignRuns: (campaignId: string) => ['campaigns', campaignId, 'runs'] as const,
  
  // Visibility queries
  visibility: (projectId: string, timeframe: string) => ['visibility', projectId, timeframe] as const,
  visibilityTrend: (projectId: string, days: number) => ['visibility', 'trend', projectId, days] as const,
  visibilityScores: (projectId: string) => ['visibility', 'scores', projectId] as const,
  
  // Report queries
  reports: (projectId: string) => ['reports', projectId] as const,
  report: (id: string) => ['reports', id] as const,
  
  // Team queries
  team: () => ['team'] as const,
  teamMembers: () => ['team', 'members'] as const,
  
  // User queries
  user: () => ['user'] as const,
  userProfile: () => ['user', 'profile'] as const,
  
  // Billing queries
  billing: () => ['billing'] as const,
  subscription: () => ['billing', 'subscription'] as const,
};

// Prefetch helpers
export const prefetchHelpers = {
  // Prefetch dashboard data when hovering over project
  prefetchDashboard: (projectId: string, days: number = 30) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.dashboard(projectId, days),
      queryFn: () => fetch(`/api/projects/${projectId}/dashboard?days=${days}`).then(res => res.json()),
      staleTime: 2 * 60 * 1000, // 2 minutes for prefetched data
    });
  },
  
  // Prefetch project details
  prefetchProject: (projectId: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.project(projectId),
      queryFn: () => fetch(`/api/projects/${projectId}`).then(res => res.json()),
    });
  },
  
  // Prefetch campaigns for a project
  prefetchCampaigns: (projectId: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.campaigns(projectId),
      queryFn: () => fetch(`/api/campaigns?projectId=${projectId}`).then(res => res.json()),
    });
  },
};

// Cache invalidation helpers
export const invalidateHelpers = {
  // Invalidate all dashboard data
  invalidateDashboard: (projectId?: string) => {
    if (projectId) {
      queryClient.invalidateQueries({ queryKey: ['dashboard', projectId] });
    } else {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    }
  },
  
  // Invalidate project data
  invalidateProjects: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.projects() });
  },
  
  // Invalidate specific project
  invalidateProject: (projectId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.project(projectId) });
  },
  
  // Invalidate campaigns
  invalidateCampaigns: (projectId?: string) => {
    if (projectId) {
      queryClient.invalidateQueries({ queryKey: queryKeys.campaigns(projectId) });
    } else {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    }
  },
  
  // Invalidate visibility data
  invalidateVisibility: (projectId?: string) => {
    if (projectId) {
      queryClient.invalidateQueries({ queryKey: ['visibility', projectId] });
    } else {
      queryClient.invalidateQueries({ queryKey: ['visibility'] });
    }
  },
};

// Optimistic update helpers
export const optimisticHelpers = {
  // Optimistically update project
  updateProject: (projectId: string, updates: any) => {
    queryClient.setQueryData(queryKeys.project(projectId), (old: any) => ({
      ...old,
      data: { ...old?.data, ...updates }
    }));
  },
  
  // Optimistically add campaign
  addCampaign: (projectId: string, newCampaign: any) => {
    queryClient.setQueryData(queryKeys.campaigns(projectId), (old: any) => ({
      ...old,
      data: [...(old?.data || []), newCampaign]
    }));
  },
  
  // Optimistically remove campaign
  removeCampaign: (projectId: string, campaignId: string) => {
    queryClient.setQueryData(queryKeys.campaigns(projectId), (old: any) => ({
      ...old,
      data: old?.data?.filter((campaign: any) => campaign.id !== campaignId) || []
    }));
  },
};

// Background sync for critical data
export const backgroundSync = {
  // Sync dashboard data in background
  syncDashboard: (projectId: string, days: number = 30) => {
    queryClient.fetchQuery({
      queryKey: queryKeys.dashboard(projectId, days),
      queryFn: () => fetch(`/api/projects/${projectId}/dashboard?days=${days}`).then(res => res.json()),
    });
  },
  
  // Sync visibility scores
  syncVisibilityScores: (projectId: string) => {
    queryClient.fetchQuery({
      queryKey: queryKeys.visibilityScores(projectId),
      queryFn: () => fetch(`/api/projects/${projectId}/visibility/scores`).then(res => res.json()),
    });
  },
};

// Performance monitoring
export const performanceMonitor = {
  // Log slow queries
  logSlowQuery: (queryKey: any, duration: number) => {
    if (duration > 3000) { // Log queries taking more than 3 seconds
      console.warn('Slow query detected:', {
        queryKey,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
      });
    }
  },
  
  // Monitor cache hit rate
  getCacheStats: () => {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    
    return {
      totalQueries: queries.length,
      staleQueries: queries.filter(q => q.isStale()).length,
      fetchingQueries: queries.filter(q => q.state.fetchStatus === "fetching").length,
      errorQueries: queries.filter(q => q.state.status === 'error').length,
    };
  },
};