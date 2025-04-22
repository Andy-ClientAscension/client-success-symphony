
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useState, useEffect } from "react";

/**
 * Hook for fetching and synchronizing dashboard data
 * - Auto-refreshes every 30 seconds
 * - Revalidates on window focus
 * - Handles errors with retries
 * - Provides loading states and timestamps
 */
export function useDashboardData() {
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
  const refetchData = async () => {
    await result.refetch();
    setLastLocalUpdate(new Date());
  };

  return {
    ...result,
    lastUpdated: lastLocalUpdate,
    refetchData,
    isRefreshing: result.isFetching && !result.isLoading
  };
}
