
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export function useDashboardData() {
  return useQuery({
    queryKey: ['dashboard-data'],
    queryFn: () => apiClient.getDashboardData(),
    staleTime: 30 * 1000, // Consider data stale after 30 seconds
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
    refetchOnWindowFocus: true, // Refetch when window regains focus
    retry: 3, // Retry failed requests 3 times
  });
}
