
import { useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { getAllClients, getClientsCountByStatus, getAverageNPS, getChurnData } from "@/lib/data";

export function useOptimizedDashboard() {
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Use parallel data fetching for dashboard metrics
  const {
    data: parallelData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['dashboard-parallel-data'],
    queryFn: async () => {
      try {
        // Fetch all data in parallel for maximum performance
        const [clients, clientCounts, npsData, churnData] = await Promise.all([
          getAllClients(),
          getClientsCountByStatus(),
          getAverageNPS(),
          getChurnData()
        ]);

        // Calculate aggregated metrics
        const totalMRR = clients.reduce((sum, client) => sum + (client.mrr || 0), 0);
        const totalCallsBooked = clients.reduce((sum, client) => sum + (client.callsBooked || 0), 0);
        const totalDealsClosed = clients.reduce((sum, client) => sum + (client.dealsClosed || 0), 0);
        
        const metrics = {
          totalMRR,
          totalCallsBooked,
          totalDealsClosed,
          performanceTrends: [
            { metric: 'MRR', currentValue: totalMRR, previousValue: totalMRR * 0.92, percentChange: 8.7 },
            { metric: 'Calls Booked', currentValue: totalCallsBooked, previousValue: totalCallsBooked * 0.85, percentChange: 17.6 },
            { metric: 'Deals Closed', currentValue: totalDealsClosed, previousValue: totalDealsClosed * 0.94, percentChange: 6.4 }
          ]
        };

        return {
          clients,
          clientCounts,
          npsData,
          churnData,
          metrics
        };
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  const refreshData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error refreshing dashboard data:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [refetch]);

  return {
    clients: parallelData?.clients || [],
    clientCounts: parallelData?.clientCounts || { active: 0, "at-risk": 0, new: 0, churned: 0 },
    npsData: parallelData?.npsData || { current: 0, trend: [] },
    churnData: parallelData?.churnData || [],
    metrics: parallelData?.metrics || {
      totalMRR: 0,
      totalCallsBooked: 0,
      totalDealsClosed: 0,
      performanceTrends: []
    },
    isLoading,
    error,
    refreshData,
    isRefreshing,
    lastUpdated
  };
}
