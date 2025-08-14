import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState, useEffect } from 'react';
import { fetchDashboardData } from '@/services/api/supabase-dashboard-service';
import { useSupabaseRealtimeData } from './useSupabaseRealtimeData';
import { fallbackClients, fallbackMetrics, fallbackStatusCounts, fallbackRates } from '@/utils/dashboardFallbackData';

interface UseOptimizedDashboardDataOptions {
  teamFilter?: string;
  enableAutoSync?: boolean;
  priority?: 'high' | 'medium' | 'low';
}

export function useOptimizedDashboardData(options: UseOptimizedDashboardDataOptions = {}) {
  const { teamFilter, enableAutoSync = false, priority = 'high' } = options;
  const queryClient = useQueryClient();
  const [useFallback, setUseFallback] = useState(false);

  // Configure cache settings based on priority
  const cacheConfig = useMemo(() => {
    switch (priority) {
      case 'high':
        return { staleTime: 30000, gcTime: 300000 }; // 30s stale, 5min cache
      case 'medium':
        return { staleTime: 60000, gcTime: 600000 }; // 1min stale, 10min cache
      case 'low':
        return { staleTime: 300000, gcTime: 1800000 }; // 5min stale, 30min cache
      default:
        return { staleTime: 60000, gcTime: 300000 };
    }
  }, [priority]);

  // Use real-time Supabase client data with error handling
  const realtimeClients = useSupabaseRealtimeData<any>({
    table: 'clients',
    orderBy: { column: 'created_at', ascending: false },
    enableToasts: false
  });

  // Monitor errors and switch to fallback mode
  useEffect(() => {
    if (realtimeClients.error && realtimeClients.error.includes('No API key')) {
      console.warn('Supabase API key issue detected, switching to fallback data');
      setUseFallback(true);
    }
  }, [realtimeClients.error]);

  // Main dashboard data query with fallback handling
  const dashboardQuery = useQuery({
    queryKey: ['dashboard-data-supabase', teamFilter],
    queryFn: async () => {
      if (useFallback) {
        // Return fallback data structure
        return {
          clients: fallbackClients,
          metrics: fallbackMetrics,
          statusCounts: fallbackStatusCounts,
          rates: fallbackRates
        };
      }
      return fetchDashboardData();
    },
    staleTime: cacheConfig.staleTime,
    gcTime: cacheConfig.gcTime,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: (failureCount, error) => {
      // If API key error, don't retry and switch to fallback
      if (error?.message?.includes('No API key')) {
        setUseFallback(true);
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Memoized processed data with fallback support
  const processedData = useMemo(() => {
    // Use fallback data if enabled or if real data is unavailable
    if (useFallback || (!dashboardQuery.data && !realtimeClients.data?.length)) {
      const clients = fallbackClients;
      return {
        allClients: clients,
        teamStatusCounts: fallbackStatusCounts,
        rawCounts: fallbackStatusCounts,
        teamMetrics: fallbackMetrics,
        npsScore: 7.6,
        churnData: [
          { month: 'Jan', churn: 5, retention: 95 },
          { month: 'Feb', churn: 7, retention: 93 },
          { month: 'Mar', churn: 6, retention: 94 },
          { month: 'Apr', churn: 8, retention: 92 },
          { month: 'May', churn: 9, retention: 91 },
          { month: 'Jun', churn: 8, retention: 92 }
        ]
      };
    }

    const dashboardData = dashboardQuery.data;
    const realtimeData = realtimeClients.data || [];
    
    // Use realtime data if available, otherwise dashboard data
    const clients = realtimeData.length > 0 ? realtimeData : (dashboardData?.clients || []);
    
    if (!clients.length) {
      return {
        allClients: [],
        teamStatusCounts: { active: 0, 'at-risk': 0, new: 0, churned: 0 },
        rawCounts: { active: 0, 'at-risk': 0, new: 0, churned: 0 },
        teamMetrics: { totalMRR: 0, avgHealthScore: 0, retentionRate: 0 },
        npsScore: 0,
        churnData: []
      };
    }

    // Process the actual data
    const filteredClients = teamFilter && teamFilter !== 'all'
      ? clients.filter(client => client.team === teamFilter)
      : clients;

    // Calculate team-specific counts
    const statusCounts = filteredClients.reduce((acc, client) => {
      acc[client.status] = (acc[client.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate team metrics
    const avgHealthScore = filteredClients.length > 0 
      ? filteredClients.reduce((sum, client) => sum + (client.progress || 0), 0) / filteredClients.length
      : 0;
    
    const retentionRate = filteredClients.length > 0
      ? ((statusCounts.active || 0) / filteredClients.length) * 100
      : 0;

    const totalMRR = filteredClients.reduce((sum, client) => sum + (client.mrr || 0), 0);
    const avgNPS = filteredClients.length > 0 
      ? filteredClients.reduce((sum, client) => sum + (client.npsScore || 0), 0) / filteredClients.length
      : 0;

    return {
      allClients: filteredClients,
      teamStatusCounts: {
        active: statusCounts.active || 0,
        'at-risk': statusCounts['at-risk'] || 0,
        new: statusCounts.new || 0,
        churned: statusCounts.churned || 0,
      },
      rawCounts: statusCounts,
      teamMetrics: {
        totalMRR,
        avgHealthScore: Math.round(avgHealthScore),
        retentionRate: Math.round(retentionRate),
      },
      npsScore: Math.round(avgNPS * 10) / 10,
      churnData: [
        { month: 'Jan', churn: 5, retention: 95 },
        { month: 'Feb', churn: 7, retention: 93 },
        { month: 'Mar', churn: 6, retention: 94 },
        { month: 'Apr', churn: 8, retention: 92 },
        { month: 'May', churn: 9, retention: 91 },
        { month: 'Jun', churn: 8, retention: 92 }
      ]
    };
  }, [dashboardQuery.data, realtimeClients.data, teamFilter, useFallback]);

  // Optimized refresh function for real-time data
  const refreshData = useCallback(async () => {
    await Promise.allSettled([
      queryClient.invalidateQueries({ 
        queryKey: ['dashboard-data-supabase', teamFilter],
        refetchType: 'active'
      }),
      realtimeClients.refresh()
    ]);
  }, [queryClient, teamFilter, realtimeClients]);

  // Loading states with real-time data awareness
  const isInitialLoading = dashboardQuery.isLoading || realtimeClients.isLoading;
  const isRefreshing = dashboardQuery.isFetching;

  // Aggregate errors from all sources
  const error = dashboardQuery.error || realtimeClients.error;

  // Get the most recent update timestamp
  const getLastUpdated = useCallback(() => {
    const times = [
      dashboardQuery.dataUpdatedAt,
      realtimeClients.lastUpdated?.getTime()
    ].filter(Boolean);
    
    return times.length > 0 ? new Date(Math.max(...times)) : null;
  }, [dashboardQuery.dataUpdatedAt, realtimeClients.lastUpdated]);

  return {
    // Processed data
    ...processedData,
    
    // Loading states
    isLoading: isInitialLoading,
    isRefreshing,
    
    // Error handling
    error: error as Error | null,
    
    // Actions
    refreshData,
    
    // Metadata
    lastUpdated: getLastUpdated(),
    
    // Raw query states for debugging
    queries: {
      dashboard: dashboardQuery,
      realtime: realtimeClients,
    },
  };
}