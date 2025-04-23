
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { getAllClients, getClientsCountByStatus } from "@/lib/data";

export interface SyncedDataResult {
  data: {
    clients: any[];
    clientCounts: {
      active: number;
      'at-risk': number;
      new: number;
      churned: number;
    };
  } | null;
  isLoading: boolean;
  error: Error | null;
  lastUpdated: Date | null;
  isRefreshing: boolean;
}

export function useSyncedData(): SyncedDataResult {
  const { toast } = useToast();
  
  const { 
    data,
    error, 
    isLoading,
    dataUpdatedAt,
    isRefetching,
    failureCount
  } = useQuery({
    queryKey: ['synced-data'],
    queryFn: async () => {
      const [clients, clientCounts] = await Promise.all([
        getAllClients(),
        getClientsCountByStatus()
      ]);
      
      return { clients, clientCounts };
    },
    staleTime: 15000, // Consider data fresh for 15 seconds
    refetchInterval: 30000, // Refetch every 30 seconds
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnReconnect: true, // Refetch on network reconnection
    retry: 3, // Retry failed requests 3 times
    meta: {
      onError: () => {
        if (failureCount === 3) { // Show toast only after all retries fail
          toast({
            title: "Sync Error",
            description: "Failed to refresh data. Will retry automatically.",
            variant: "destructive",
          });
        }
      }
    },
  });

  return {
    data,
    isLoading,
    error: error instanceof Error ? error : null,
    lastUpdated: dataUpdatedAt ? new Date(dataUpdatedAt) : null,
    isRefreshing: isRefetching,
  };
}
