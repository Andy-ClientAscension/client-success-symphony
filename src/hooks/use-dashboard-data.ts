
import { useQuery } from '@tanstack/react-query';
import { 
  getAllClients, 
  getClientsCountByStatus, 
  getAverageNPS, 
  getNPSMonthlyTrend, 
  getChurnData 
} from '@/lib/data';
import { calculateStatusCounts, calculateRates, getComprehensiveMetrics } from '@/utils/analyticsUtils';
import { useToast } from '@/hooks/use-toast';

export function useDashboardData() {
  const { toast } = useToast();

  const { 
    data: clients,
    isLoading: isClientsLoading,
    error: clientsError
  } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      try {
        return await getAllClients();
      } catch (error) {
        toast({
          title: "Error loading clients",
          description: error instanceof Error ? error.message : "Failed to load client data",
          variant: "destructive",
        });
        throw error;
      }
    },
    refetchInterval: 30000,
    refetchOnWindowFocus: true
  });

  const { 
    data: clientCounts,
    isLoading: isCountsLoading,
    error: countsError
  } = useQuery({
    queryKey: ['client-counts'],
    queryFn: async () => {
      try {
        return await getClientsCountByStatus();
      } catch (error) {
        toast({
          title: "Error loading client counts",
          description: error instanceof Error ? error.message : "Failed to load client statistics",
          variant: "destructive",
        });
        throw error;
      }
    },
    refetchInterval: 30000,
    refetchOnWindowFocus: true
  });

  const {
    data: npsData,
    isLoading: isNPSLoading,
    error: npsError
  } = useQuery({
    queryKey: ['nps-trend'],
    queryFn: async () => {
      try {
        return await getNPSMonthlyTrend();
      } catch (error) {
        toast({
          title: "Error loading NPS data",
          description: error instanceof Error ? error.message : "Failed to load NPS trends",
          variant: "destructive",
        });
        throw error;
      }
    },
    refetchInterval: 30000,
    refetchOnWindowFocus: true
  });

  const { 
    data: churnData,
    isLoading: isChurnLoading,
    error: churnError
  } = useQuery({
    queryKey: ['churn-data'],
    queryFn: async () => {
      try {
        return await getChurnData();
      } catch (error) {
        toast({
          title: "Error loading churn data",
          description: error instanceof Error ? error.message : "Failed to load churn data",
          variant: "destructive",
        });
        throw error;
      }
    },
    refetchInterval: 30000,
    refetchOnWindowFocus: true
  });

  const { 
    data: metrics,
    isLoading: isMetricsLoading,
    error: metricsError
  } = useQuery({
    queryKey: ['comprehensive-metrics', clients],
    queryFn: () => clients ? getComprehensiveMetrics(clients) : null,
    enabled: !!clients,
    refetchInterval: 30000,
    refetchOnWindowFocus: true
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
