
import { useQuery } from '@tanstack/react-query';
import { 
  getAllClients, 
  getClientsCountByStatus, 
  getAverageNPS, 
  getNPSMonthlyTrend, 
  getChurnData 
} from '@/lib/data';
import { calculateStatusCounts, calculateRates, getComprehensiveMetrics } from '@/utils/analyticsUtils';

export function useDashboardData() {
  const { 
    data: clients,
    isLoading: isClientsLoading
  } = useQuery({
    queryKey: ['clients'],
    queryFn: getAllClients,
    refetchInterval: 30000, // 30 seconds
    refetchOnWindowFocus: true
  });

  const { 
    data: clientCounts,
    isLoading: isCountsLoading
  } = useQuery({
    queryKey: ['client-counts'],
    queryFn: getClientsCountByStatus,
    refetchInterval: 30000,
    refetchOnWindowFocus: true
  });

  const {
    data: npsData,
    isLoading: isNPSLoading
  } = useQuery({
    queryKey: ['nps-trend'],
    queryFn: getNPSMonthlyTrend,
    refetchInterval: 30000,
    refetchOnWindowFocus: true
  });

  const { 
    data: churnData,
    isLoading: isChurnLoading 
  } = useQuery({
    queryKey: ['churn-data'],
    queryFn: getChurnData,
    refetchInterval: 30000,
    refetchOnWindowFocus: true
  });

  const { 
    data: metrics,
    isLoading: isMetricsLoading
  } = useQuery({
    queryKey: ['comprehensive-metrics', clients],
    queryFn: () => clients ? getComprehensiveMetrics(clients) : null,
    enabled: !!clients,
    refetchInterval: 30000,
    refetchOnWindowFocus: true
  });

  return {
    clients,
    clientCounts,
    npsData,
    churnData,
    metrics,
    isLoading: isClientsLoading || isCountsLoading || isNPSLoading || isChurnLoading || isMetricsLoading
  };
}
