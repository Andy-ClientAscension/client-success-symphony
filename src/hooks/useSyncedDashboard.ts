
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { getAllClients, getClientsCountByStatus, getAverageNPS, getChurnData } from "@/lib/data";
import { useEffect, useState } from "react";
import { useAutoSync } from "@/hooks/useAutoSync";

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
  const [isInitialDataFetched, setIsInitialDataFetched] = useState(false);
  const [errorState, setErrorState] = useState<Error | null>(null);
  const { triggerSync, isSyncing } = useAutoSync();

  // Get all clients with automatic background refresh
  const clientsQuery = useQuery({
    queryKey: [DATA_KEYS.CLIENTS],
    queryFn: getAllClients,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
    retry: 2,
    meta: {
      onError: (error: Error) => {
        console.error("Clients query error:", error);
        setErrorState(error);
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
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
    retry: 2,
    meta: {
      onError: (error: Error) => {
        console.error("Count query error:", error);
        setErrorState(error);
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
    staleTime: 60000, // 60 seconds (less frequent for NPS)
    refetchOnWindowFocus: true,
    retry: 2,
    meta: {
      onError: (error: Error) => {
        console.error("NPS query error:", error);
        setErrorState(error);
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
    staleTime: 60000, // 60 seconds (less frequent for churn data)
    refetchOnWindowFocus: true,
    retry: 2,
    meta: {
      onError: (error: Error) => {
        console.error("Churn query error:", error);
        setErrorState(error);
        toast({
          title: "Error fetching churn data",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  });

  // Mark initial data as fetched when at least clients data is available
  useEffect(() => {
    if (clientsQuery.data && !isInitialDataFetched) {
      console.log("Initial dashboard data fetched successfully");
      setIsInitialDataFetched(true);
    }
  }, [clientsQuery.data, isInitialDataFetched]);

  // Force refresh all data using the auto-sync engine
  const refreshAllData = async () => {
    console.log("Manual refresh of dashboard data initiated");
    
    // Clear any previous errors when manually refreshing
    setErrorState(null);
    
    // First invalidate queries to ensure React Query fetches fresh data
    queryClient.invalidateQueries({ queryKey: [DATA_KEYS.CLIENTS] });
    queryClient.invalidateQueries({ queryKey: [DATA_KEYS.CLIENT_COUNTS] });
    queryClient.invalidateQueries({ queryKey: [DATA_KEYS.NPS_DATA] });
    queryClient.invalidateQueries({ queryKey: [DATA_KEYS.CHURN_DATA] });
    
    // Then trigger a comprehensive auto-sync
    try {
      await triggerSync();
      console.log("Manual refresh completed successfully");
    } catch (error) {
      console.error("Error during manual refresh:", error);
      setErrorState(error instanceof Error ? error : new Error(String(error)));
    }
  };

  // Monitor online/offline status for reconnection
  useEffect(() => {
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
  }, [toast]);

  // Handle errors centrally
  useEffect(() => {
    if (clientsQuery.error || countQuery.error || npsQuery.error || churnQuery.error) {
      const firstError = clientsQuery.error || countQuery.error || npsQuery.error || churnQuery.error;
      setErrorState(firstError instanceof Error ? firstError : new Error(String(firstError)));
    } else if (!clientsQuery.error && !countQuery.error && !npsQuery.error && !churnQuery.error) {
      // Clear error state if all queries are successful
      setErrorState(null);
    }
  }, [clientsQuery.error, countQuery.error, npsQuery.error, churnQuery.error]);

  // Combined loading state that properly reflects when data is ready
  const isLoading = (
    (clientsQuery.isLoading && !isInitialDataFetched) || 
    (countQuery.isLoading && !countQuery.data) || 
    (npsQuery.isLoading && !npsQuery.data) || 
    (churnQuery.isLoading && !churnQuery.data)
  );

  const isRefreshing = isSyncing || clientsQuery.isFetching || countQuery.isFetching || npsQuery.isFetching || churnQuery.isFetching;
  
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
    error: errorState,
    refreshData: refreshAllData,
    lastUpdated: getLastUpdated(),
    isInitialDataFetched
  };
}
