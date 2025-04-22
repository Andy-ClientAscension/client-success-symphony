
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useState, useEffect } from "react";
import type Dashboard from "@/types/dashboard";
import type API from "@/types/api";

interface DashboardDataResult {
  data: API.DashboardResponse | undefined;
  isLoading: boolean;
  error: Error | null;
  refetchData: () => Promise<void>;
  lastUpdated: Date | null;
  isRefreshing: boolean;
}

/**
 * Hook for fetching and synchronizing dashboard data
 * - Auto-refreshes every 30 seconds
 * - Revalidates on window focus
 * - Handles errors with retries
 * - Provides loading states and timestamps
 */
export function useDashboardData(): DashboardDataResult {
  const [lastLocalUpdate, setLastLocalUpdate] = useState<Date | null>(null);

  const result = useQuery({
    queryKey: ['dashboard-data'],
    queryFn: () => apiClient.getDashboardData(),
    staleTime: 30 * 1000, // Consider data stale after 30 seconds
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
    refetchOnWindowFocus: true, // Refetch when window regains focus
    retry: 3, // Retry failed requests 3 times
    refetchOnMount: true, // Refetch when component mounts
  });

  // Update local timestamp whenever new data is fetched
  useEffect(() => {
    if (result.dataUpdatedAt && !result.isError) {
      setLastLocalUpdate(new Date(result.dataUpdatedAt));
    }
  }, [result.dataUpdatedAt, result.isError]);

  // Force refetch method with lastUpdate timestamp update
  const refetchData = async (): Promise<void> => {
    await result.refetch();
    setLastLocalUpdate(new Date());
  };

  return {
    data: result.data,
    isLoading: result.isLoading,
    error: result.error instanceof Error ? result.error : null,
    refetchData,
    lastUpdated: lastLocalUpdate,
    isRefreshing: result.isFetching && !result.isLoading
  };
}
