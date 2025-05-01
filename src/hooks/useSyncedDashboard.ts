
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { getAllClients, getClientsCountByStatus, getAverageNPS, getChurnData } from "@/lib/data";
import { useEffect } from "react";

export const DATA_KEYS = {
  CLIENTS: 'clients',
  CLIENT_COUNTS: 'client-counts',
  NPS_DATA: 'nps-data',
  CHURN_DATA: 'churn-data',
  ALL_DATA: 'all-dashboard-data'
};

export function useSyncedDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get all clients with automatic background refresh
  const clientsQuery = useQuery({
    queryKey: [DATA_KEYS.CLIENTS],
    queryFn: getAllClients,
    staleTime: 10000, // 10 seconds
    refetchInterval: 30000, // 30 seconds
    refetchOnWindowFocus: true,
    retry: 3,
    meta: {
      onError: (error: Error) => {
        toast({
          title: "Error fetching clients",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  });

  // Get client counts with automatic background refresh
  const countQuery = useQuery({
    queryKey: [DATA_KEYS.CLIENT_COUNTS],
    queryFn: getClientsCountByStatus,
    staleTime: 10000, // 10 seconds
    refetchInterval: 30000, // 30 seconds
    refetchOnWindowFocus: true,
    retry: 3,
    meta: {
      onError: (error: Error) => {
        toast({
          title: "Error fetching client counts",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  });

  // Get NPS data with automatic background refresh
  const npsQuery = useQuery({
    queryKey: [DATA_KEYS.NPS_DATA],
    queryFn: getAverageNPS,
    staleTime: 10000, // 10 seconds
    refetchInterval: 60000, // 60 seconds (less frequent for NPS)
    refetchOnWindowFocus: true,
    retry: 3,
    meta: {
      onError: (error: Error) => {
        toast({
          title: "Error fetching NPS data",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  });

  // Get churn data with automatic background refresh
  const churnQuery = useQuery({
    queryKey: [DATA_KEYS.CHURN_DATA],
    queryFn: getChurnData,
    staleTime: 10000, // 10 seconds
    refetchInterval: 60000, // 60 seconds (less frequent for churn data)
    refetchOnWindowFocus: true,
    retry: 3,
    meta: {
      onError: (error: Error) => {
        toast({
          title: "Error fetching churn data",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  });

  // Force refresh all data
  const refreshAllData = () => {
    queryClient.invalidateQueries({ queryKey: [DATA_KEYS.CLIENTS] });
    queryClient.invalidateQueries({ queryKey: [DATA_KEYS.CLIENT_COUNTS] });
    queryClient.invalidateQueries({ queryKey: [DATA_KEYS.NPS_DATA] });
    queryClient.invalidateQueries({ queryKey: [DATA_KEYS.CHURN_DATA] });
    
    toast({
      title: "Refreshing dashboard data",
      description: "Fetching the latest data from the server.",
    });
  };

  // Monitor online/offline status for reconnection
  useEffect(() => {
    const handleOnline = () => {
      refreshAllData();
      toast({
        title: "Back online",
        description: "Reconnected to the server. Refreshing data...",
      });
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [queryClient]);

  const isLoading = clientsQuery.isLoading || countQuery.isLoading || npsQuery.isLoading || churnQuery.isLoading;
  const isRefreshing = clientsQuery.isFetching || countQuery.isFetching || npsQuery.isFetching || churnQuery.isFetching;
  
  const error = clientsQuery.error || countQuery.error || npsQuery.error || churnQuery.error;

  // Calculate the latest update timestamp
  const getLastUpdated = () => {
    const timestamps = [
      clientsQuery.dataUpdatedAt,
      countQuery.dataUpdatedAt,
      npsQuery.dataUpdatedAt,
      churnQuery.dataUpdatedAt
    ].filter(Boolean);
    
    return timestamps.length > 0 ? new Date(Math.max(...timestamps)) : null;
  };

  return {
    clients: clientsQuery.data || [],
    clientCounts: countQuery.data || { active: 0, 'at-risk': 0, new: 0, churned: 0 },
    npsScore: npsQuery.data || 0,
    churnData: churnQuery.data || [],
    isLoading,
    isRefreshing,
    error: error instanceof Error ? error : null,
    refreshData: refreshAllData,
    lastUpdated: getLastUpdated()
  };
}
