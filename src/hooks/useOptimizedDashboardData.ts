import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { fetchDashboardData } from '@/services/api/supabase-dashboard-service';
import { useSupabaseRealtimeData } from './useSupabaseRealtimeData';

interface UseOptimizedDashboardDataOptions {
  teamFilter?: string;
  enableAutoSync?: boolean;
  priority?: 'high' | 'medium' | 'low';
}

export function useOptimizedDashboardData(options: UseOptimizedDashboardDataOptions = {}) {
  const { teamFilter, enableAutoSync = false, priority = 'high' } = options;
  const queryClient = useQueryClient();

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

  // Use real-time Supabase client data
  const realtimeClients = useSupabaseRealtimeData<any>({
    table: 'clients',
    orderBy: { column: 'created_at', ascending: false },
    enableToasts: false
  });

  // Main dashboard data query using real Supabase data
  const dashboardQuery = useQuery({
    queryKey: ['dashboard-data-supabase', teamFilter],
    queryFn: fetchDashboardData,
    staleTime: cacheConfig.staleTime,
    gcTime: cacheConfig.gcTime,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Memoized processed data using real Supabase data
  const processedData = useMemo(() => {
    const dashboardData = dashboardQuery.data;
    if (!dashboardData) {
      return {
        allClients: [],
        teamStatusCounts: { active: 0, 'at-risk': 0, new: 0, churned: 0 },
        rawCounts: { active: 0, 'at-risk': 0, new: 0, churned: 0 },
        teamMetrics: { totalMRR: 0, avgHealthScore: 0, retentionRate: 0 },
        npsScore: 0,
        churnData: []
      };
    }

    const { clients, clientCounts, metrics, npsData, churnData } = dashboardData;
    
    // Apply team filter if specified
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

    return {
      allClients: filteredClients,
      teamStatusCounts: {
        active: statusCounts.active || 0,
        'at-risk': statusCounts['at-risk'] || 0,
        new: statusCounts.new || 0,
        churned: statusCounts.churned || 0,
      },
      rawCounts: clientCounts,
      teamMetrics: {
        totalMRR: metrics.totalMRR,
        avgHealthScore: Math.round(avgHealthScore),
        retentionRate: Math.round(retentionRate),
      },
      npsScore: npsData.current,
      churnData
    };
  }, [dashboardQuery.data, teamFilter]);

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