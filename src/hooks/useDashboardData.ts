import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { getAllClients, getClientsCountByStatus, getAverageNPS, getChurnData, getClientMetricsByTeam } from "@/lib/data";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useAutoSync } from "@/hooks/useAutoSync";

export const DATA_KEYS = {
  CLIENTS: 'clients',
  CLIENT_COUNTS: 'client-counts',
  NPS_DATA: 'nps-data',
  CHURN_DATA: 'churn-data',
  TEAM_METRICS: 'team-metrics',
  ALL_DATA: 'all-dashboard-data'
};

export const DASHBOARD_KEYS = DATA_KEYS; // Alias for compatibility

interface UseDashboardDataOptions {
  teamFilter?: string;
  enableAutoSync?: boolean;
}

export function useDashboardData(options: UseDashboardDataOptions = {}) {
  const { teamFilter = 'all', enableAutoSync = true } = options;
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isInitialDataFetched, setIsInitialDataFetched] = useState(false);
  const [errorState, setErrorState] = useState<Error | null>(null);
  const { triggerSync, isSyncing } = useAutoSync();

  // Simplified query options to prevent TypeScript issues
  const clientsQuery = useQuery({
    queryKey: [DATA_KEYS.CLIENTS],
    queryFn: getAllClients,
    staleTime: 30000,
    refetchOnWindowFocus: true,
    retry: 2,
  });

  const countQuery = useQuery({
    queryKey: [DATA_KEYS.CLIENT_COUNTS],
    queryFn: getClientsCountByStatus,
    staleTime: 30000,
    refetchOnWindowFocus: true,
    retry: 2,
  });

  const npsQuery = useQuery({
    queryKey: [DATA_KEYS.NPS_DATA],
    queryFn: getAverageNPS,
    staleTime: 60000,
    refetchOnWindowFocus: true,
    retry: 2,
  });

  const churnQuery = useQuery({
    queryKey: [DATA_KEYS.CHURN_DATA],
    queryFn: getChurnData,
    staleTime: 60000,
    refetchOnWindowFocus: true,
    retry: 2,
  });

  const teamMetricsQuery = useQuery({
    queryKey: [DATA_KEYS.TEAM_METRICS, teamFilter],
    queryFn: () => getClientMetricsByTeam(teamFilter),
    staleTime: 30000,
    refetchOnWindowFocus: true,
    retry: 2,
    enabled: !!teamFilter && teamFilter !== 'all',
  });

  // Process and filter data based on team selection
  const processedData = useMemo(() => {
    const clients = clientsQuery.data || [];
    const filteredClients = teamFilter === 'all' 
      ? clients 
      : clients.filter(client => client.team === teamFilter);

    // Calculate team-specific status counts
    const teamStatusCounts = {
      active: filteredClients.filter(c => c.status === 'active').length,
      atRisk: filteredClients.filter(c => c.status === 'at-risk').length,
      churned: filteredClients.filter(c => c.status === 'churned').length,
      new: filteredClients.filter(c => c.status === 'new').length,
      total: filteredClients.length
    };

    // Calculate average health score for team
    const totalHealth = filteredClients.reduce((sum, client) => {
      return sum + (client?.npsScore ?? 0);
    }, 0);
    
    const averageHealth = teamStatusCounts.total > 0 
      ? totalHealth / teamStatusCounts.total 
      : 0;

    // Calculate team metrics
    const teamMetrics = {
      retentionRate: teamStatusCounts.total > 0 ? (teamStatusCounts.active / teamStatusCounts.total) * 100 : 0,
      atRiskRate: teamStatusCounts.total > 0 ? (teamStatusCounts.atRisk / teamStatusCounts.total) * 100 : 0,
      churnRate: teamStatusCounts.total > 0 ? (teamStatusCounts.churned / teamStatusCounts.total) * 100 : 0,
      averageHealth,
      totalMRR: teamMetricsQuery.data?.totalMRR || 0,
      totalClients: teamStatusCounts.total,
      totalCallsBooked: teamMetricsQuery.data?.totalCallsBooked || 0,
      totalDealsClosed: teamMetricsQuery.data?.totalDealsClosed || 0,
    };

    return {
      allClients: clients,
      filteredClients,
      teamStatusCounts,
      teamMetrics,
      averageHealth,
      globalCounts: countQuery.data || { active: 0, 'at-risk': 0, new: 0, churned: 0 },
      npsScore: npsQuery.data || 0,
      churnData: churnQuery.data || [],
      rawTeamMetrics: teamMetricsQuery.data
    };
  }, [
    clientsQuery.data,
    countQuery.data,
    npsQuery.data,
    churnQuery.data,
    teamMetricsQuery.data,
    teamFilter
  ]);

  // Error handling with memoized callback
  const handleErrors = useCallback(() => {
    const errors = [
      clientsQuery.error,
      countQuery.error,
      npsQuery.error,
      churnQuery.error,
      teamMetricsQuery.error
    ].filter(Boolean);

    if (errors.length > 0) {
      const firstError = errors[0];
      const errorObj = firstError instanceof Error ? firstError : new Error(String(firstError));
      setErrorState(errorObj);
      
      // Only show toast if it's a new error
      toast({
        title: "Dashboard Data Error",
        description: errorObj.message,
        variant: "destructive",
      });
    } else {
      setErrorState(null);
    }
  }, [
    clientsQuery.error,
    countQuery.error,
    npsQuery.error,
    churnQuery.error,
    teamMetricsQuery.error,
    toast
  ]);

  useEffect(() => {
    handleErrors();
  }, [handleErrors]);

  // Mark initial data as fetched
  useEffect(() => {
    if (clientsQuery.data && !isInitialDataFetched) {
      console.log("Initial dashboard data fetched successfully");
      setIsInitialDataFetched(true);
    }
  }, [clientsQuery.data, isInitialDataFetched]);

  // Force refresh all data with memoized callback
  const refreshAllData = useCallback(async () => {
    console.log("Manual refresh of dashboard data initiated");
    setErrorState(null);
    
    // Invalidate all relevant queries
    queryClient.invalidateQueries({ queryKey: [DATA_KEYS.CLIENTS] });
    queryClient.invalidateQueries({ queryKey: [DATA_KEYS.CLIENT_COUNTS] });
    queryClient.invalidateQueries({ queryKey: [DATA_KEYS.NPS_DATA] });
    queryClient.invalidateQueries({ queryKey: [DATA_KEYS.CHURN_DATA] });
    queryClient.invalidateQueries({ queryKey: [DATA_KEYS.TEAM_METRICS] });
    
    if (enableAutoSync) {
      try {
        await triggerSync();
        console.log("Manual refresh completed successfully");
      } catch (error) {
        console.error("Error during manual refresh:", error);
        setErrorState(error instanceof Error ? error : new Error(String(error)));
      }
    }
  }, [enableAutoSync, triggerSync, queryClient]);

  // Network status monitoring
  useEffect(() => {
    if (!enableAutoSync) return;

    const handleOnline = async () => {
      console.log("Network connection restored, refreshing data");
      refreshAllData();
      toast({
        title: "Back online",
        description: "Reconnected to the server. Refreshing data...",
      });
    };

    const handleOffline = () => {
      console.log("Network connection lost");
      toast({
        title: "Connection lost",
        description: "You are currently offline. Some features may be unavailable.",
        variant: "destructive",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast, enableAutoSync, refreshAllData]);

  // Combined loading state
  const isLoading = (
    (clientsQuery.isLoading && !isInitialDataFetched) || 
    (countQuery.isLoading && !countQuery.data) || 
    (npsQuery.isLoading && !npsQuery.data) || 
    (churnQuery.isLoading && !churnQuery.data) ||
    (teamMetricsQuery.isLoading && !teamMetricsQuery.data && teamFilter !== 'all')
  );

  const isRefreshing = isSyncing || 
    clientsQuery.isFetching || 
    countQuery.isFetching || 
    npsQuery.isFetching || 
    churnQuery.isFetching ||
    teamMetricsQuery.isFetching;
  
  // Calculate last updated timestamp
  const getLastUpdated = useCallback(() => {
    const timestamps = [
      clientsQuery.dataUpdatedAt,
      countQuery.dataUpdatedAt,
      npsQuery.dataUpdatedAt,
      churnQuery.dataUpdatedAt,
      teamMetricsQuery.dataUpdatedAt
    ].filter(Boolean);
    
    return timestamps.length > 0 ? new Date(Math.max(...timestamps)) : null;
  }, [
    clientsQuery.dataUpdatedAt,
    countQuery.dataUpdatedAt,
    npsQuery.dataUpdatedAt,
    churnQuery.dataUpdatedAt,
    teamMetricsQuery.dataUpdatedAt
  ]);

  return {
    // Processed data
    ...processedData,
    
    // Backwards compatibility with existing interfaces
    data: processedData,
    refetchData: refreshAllData,
    clients: processedData.allClients,
    clientCounts: processedData.globalCounts,
    npsData: { current: processedData.npsScore, trend: [] },
    churnData: processedData.churnData,
    metrics: processedData.teamMetrics,
    
    // Loading states
    isLoading,
    isRefreshing,
    error: errorState,
    isInitialDataFetched,
    
    // Actions
    refreshData: refreshAllData,
    
    // Metadata
    lastUpdated: getLastUpdated(),
    teamFilter,
    
    // Raw query states for debugging
    rawQueries: {
      clients: clientsQuery,
      counts: countQuery,
      nps: npsQuery,
      churn: churnQuery,
      teamMetrics: teamMetricsQuery
    }
  };
}