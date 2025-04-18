
import { useQuery } from '@tanstack/react-query';
import { 
  getAllClients, 
  getClientsCountByStatus, 
  getAverageNPS, 
  getNPSMonthlyTrend, 
  getChurnData,
  getClientMetricsByTeam
} from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

export function useDashboardData() {
  const { toast } = useToast();

  const { 
    data: clients,
    isLoading: isClientsLoading,
    error: clientsError
  } = useQuery({
    queryKey: ['clients'],
    queryFn: getAllClients,
    refetchInterval: 30000, // Refetch every 30 seconds
    refetchOnWindowFocus: true, // Refetch when window regains focus
    retry: 3, // Retry failed requests 3 times
    staleTime: 10000, // Consider data stale after 10 seconds
  });

  const { 
    data: clientCounts,
    isLoading: isCountsLoading,
    error: countsError
  } = useQuery({
    queryKey: ['client-counts'],
    queryFn: getClientsCountByStatus,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
    retry: 3,
    staleTime: 10000,
  });

  const {
    data: npsData,
    isLoading: isNPSLoading,
    error: npsError
  } = useQuery({
    queryKey: ['nps-trend'],
    queryFn: getNPSMonthlyTrend,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
    retry: 3,
    staleTime: 10000,
  });

  const { 
    data: churnData,
    isLoading: isChurnLoading,
    error: churnError
  } = useQuery({
    queryKey: ['churn-data'],
    queryFn: getChurnData,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
    retry: 3,
    staleTime: 10000,
  });

  const { 
    data: metrics,
    isLoading: isMetricsLoading,
    error: metricsError
  } = useQuery({
    queryKey: ['client-metrics'],
    queryFn: () => getClientMetricsByTeam(),
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
    retry: 3,
    staleTime: 10000,
  });

  const error = clientsError || countsError || npsError || churnError || metricsError;

  return {
    clients,
    clientCounts,
    npsData,
    churnData,
    metrics,
    isLoading: isClientsLoading || isCountsLoading || isNPSLoading || isChurnLoading || isMetricsLoading,
    error
  };
}
