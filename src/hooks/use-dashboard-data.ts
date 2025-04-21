
import { useQuery } from '@tanstack/react-query';
import { getAllClients, getClientsCountByStatus, getAverageNPS, getNPSMonthlyTrend, getChurnData } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

export function useDashboardData() {
  const { toast } = useToast();

  const {
    data: clients = [],
    isLoading: isClientsLoading,
    error: clientsError
  } = useQuery({
    queryKey: ['clients'],
    queryFn: getAllClients,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 3,
    meta: {
      onError: (error: Error) => {
        toast({
          title: "Error loading clients",
          description: error.message,
          variant: "destructive",
        });
      },
    },
  });

  const {
    data: clientCounts = { active: 0, "at-risk": 0, churned: 0, new: 0 },
    isLoading: isClientCountsLoading,
    error: clientCountsError
  } = useQuery({
    queryKey: ['client-counts'],
    queryFn: getClientsCountByStatus,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 3,
    meta: {
      onError: (error: Error) => {
        toast({
          title: "Error loading client counts",
          description: error.message,
          variant: "destructive",
        });
      },
    },
  });

  const {
    data: npsData = { current: 0, previous: 0, trend: [] },
    isLoading: isNpsLoading,
    error: npsError
  } = useQuery({
    queryKey: ['nps-data'],
    queryFn: getAverageNPS,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 3,
    meta: {
      onError: (error: Error) => {
        toast({
          title: "Error loading NPS data",
          description: error.message,
          variant: "destructive",
        });
      },
    },
  });

  const {
    data: npsTrend = [],
    isLoading: isNpsTrendLoading,
    error: npsTrendError
  } = useQuery({
    queryKey: ['nps-trend'],
    queryFn: getNPSMonthlyTrend,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 3,
    meta: {
      onError: (error: Error) => {
        toast({
          title: "Error loading NPS trend",
          description: error.message,
          variant: "destructive",
        });
      },
    },
  });

  const {
    data: churnData = [],
    isLoading: isChurnLoading,
    error: churnError
  } = useQuery({
    queryKey: ['churn-data'],
    queryFn: getChurnData,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 3,
    meta: {
      onError: (error: Error) => {
        toast({
          title: "Error loading churn data",
          description: error.message,
          variant: "destructive",
        });
      },
    },
  });

  // Calculate metrics based on fetched data
  const metrics = {
    totalClients: Object.values(clientCounts).reduce((a, b) => a + b, 0),
    totalMRR: clients.reduce((sum, client) => sum + (client.mrr || 0), 0),
    totalCallsBooked: clients.reduce((sum, client) => sum + (client.callsBooked || 0), 0),
    totalDealsClosed: clients.reduce((sum, client) => sum + (client.dealsClosed || 0), 0),
    performanceTrends: [
      {
        metric: "Growth",
        value: 12,
        previousValue: 10,
        percentChange: 20
      }
    ]
  };

  // Combine all loading states
  const isLoading = isClientsLoading || isClientCountsLoading || isNpsLoading || isNpsTrendLoading || isChurnLoading;
  
  // Combine all errors
  const error = clientsError || clientCountsError || npsError || npsTrendError || churnError;

  return {
    clients,
    clientCounts,
    npsData,
    npsTrend,
    churnData,
    metrics,
    isLoading,
    error: error as Error | null
  };
}
