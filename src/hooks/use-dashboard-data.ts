
import { useQuery } from "@tanstack/react-query";
import { getAllClients, getClientsCountByStatus, getAverageNPS, getChurnData } from "@/lib/data";

export function useDashboardData() {
  const { 
    data: clients = [],
    isLoading: isClientsLoading, 
    error: clientsError 
  } = useQuery({
    queryKey: ['dashboard-clients'],
    queryFn: getAllClients,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  const { 
    data: clientCounts = { active: 0, "at-risk": 0, new: 0, churned: 0 },
    isLoading: isCountsLoading, 
    error: countsError 
  } = useQuery({
    queryKey: ['dashboard-client-counts'],
    queryFn: getClientsCountByStatus,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  const { 
    data: npsData = { current: 0, trend: [] },
    isLoading: isNpsLoading, 
    error: npsError 
  } = useQuery({
    queryKey: ['dashboard-nps'],
    queryFn: () => ({
      current: getAverageNPS(),
      trend: [
        { month: 'Jan', score: 7.5 },
        { month: 'Feb', score: 7.8 },
        { month: 'Mar', score: 8.1 },
        { month: 'Apr', score: 8.3 },
        { month: 'May', score: 8.0 },
        { month: 'Jun', score: 8.4 }
      ]
    }),
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  const { 
    data: churnData = [],
    isLoading: isChurnLoading, 
    error: churnError 
  } = useQuery({
    queryKey: ['dashboard-churn'],
    queryFn: getChurnData,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

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

  // Combine loading states
  const isLoading = isClientsLoading || isCountsLoading || isNpsLoading || isChurnLoading;
  
  // Combine errors
  const error = clientsError || countsError || npsError || churnError;

  return {
    clients,
    clientCounts,
    npsData,
    churnData,
    metrics,
    isLoading,
    error
  };
}
