import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { getAllClients, getClientsCountByStatus, getChurnData } from '@/lib/data';

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

  // Mock NPS data function
  const getNPSData = async () => ({ current: 8.2, trend: [] });

  // Optimized parallel data fetching with intelligent caching
  const clientsQuery = useQuery({
    queryKey: ['dashboard-clients', teamFilter],
    queryFn: getAllClients,
    staleTime: cacheConfig.staleTime,
    gcTime: cacheConfig.gcTime,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const countsQuery = useQuery({
    queryKey: ['dashboard-counts', teamFilter],
    queryFn: getClientsCountByStatus,
    staleTime: cacheConfig.staleTime,
    gcTime: cacheConfig.gcTime,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 2,
    enabled: !!clientsQuery.data, // Only fetch after clients are loaded
  });

  const npsQuery = useQuery({
    queryKey: ['dashboard-nps', teamFilter],
    queryFn: getNPSData,
    staleTime: cacheConfig.staleTime * 2, // NPS data is less volatile
    gcTime: cacheConfig.gcTime * 2,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
    enabled: !!clientsQuery.data,
  });

  const churnQuery = useQuery({
    queryKey: ['dashboard-churn', teamFilter],
    queryFn: getChurnData,
    staleTime: cacheConfig.staleTime * 3, // Churn data is least volatile
    gcTime: cacheConfig.gcTime * 3,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 1,
    enabled: !!clientsQuery.data,
  });

  // Memoized processed data with efficient filtering
  const processedData = useMemo(() => {
    const clients = clientsQuery.data || [];
    const filteredClients = teamFilter 
      ? clients.filter(client => client.team === teamFilter)
      : clients;

    // Calculate metrics efficiently
    const statusCounts = filteredClients.reduce((acc, client) => {
      acc[client.status] = (acc[client.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalMRR = filteredClients.reduce((sum, client) => sum + (client.mrr || 0), 0);
    const avgHealthScore = filteredClients.length > 0 
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
      teamMetrics: {
        totalMRR,
        avgHealthScore,
        retentionRate: filteredClients.length > 0 
          ? ((statusCounts.active || 0) / filteredClients.length) * 100 
          : 0,
      },
      rawCounts: countsQuery.data,
      npsScore: (npsQuery.data as any)?.current || 0,
      churnData: churnQuery.data || [],
    };
  }, [clientsQuery.data, countsQuery.data, npsQuery.data, churnQuery.data, teamFilter]);

  // Optimized refresh function that only refreshes stale data
  const refreshData = useCallback(async () => {
    const queries = ['dashboard-clients', 'dashboard-counts', 'dashboard-nps', 'dashboard-churn'];
    
    await Promise.allSettled(
      queries.map(queryKey => 
        queryClient.invalidateQueries({ 
          queryKey: [queryKey, teamFilter],
          refetchType: 'active'
        })
      )
    );
  }, [queryClient, teamFilter]);

  // Determine loading state more intelligently
  const isInitialLoading = clientsQuery.isLoading;
  const isRefreshing = clientsQuery.isFetching || countsQuery.isFetching || 
                      npsQuery.isFetching || churnQuery.isFetching;

  // Combine errors more effectively
  const error = clientsQuery.error || countsQuery.error || npsQuery.error || churnQuery.error;

  // Get the most recent update time
  const getLastUpdated = useCallback(() => {
    const times = [
      clientsQuery.dataUpdatedAt,
      countsQuery.dataUpdatedAt,
      npsQuery.dataUpdatedAt,
      churnQuery.dataUpdatedAt,
    ].filter(Boolean);
    
    return times.length > 0 ? new Date(Math.max(...times)) : null;
  }, [clientsQuery.dataUpdatedAt, countsQuery.dataUpdatedAt, npsQuery.dataUpdatedAt, churnQuery.dataUpdatedAt]);

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
      clients: clientsQuery,
      counts: countsQuery,
      nps: npsQuery,
      churn: churnQuery,
    },
  };
}