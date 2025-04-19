
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
import { calculatePerformanceTrends } from '@/utils/aiDataAnalyzer';
import { formatAPIError } from '@/utils/errorHandling';

export function useDashboardData() {
  const { toast } = useToast();

  const { 
    data: clients,
    isLoading: isClientsLoading,
    error: clientsError,
    refetch: refetchClients
  } = useQuery({
    queryKey: ['clients'],
    queryFn: getAllClients,
    refetchInterval: 30000, // Refetch every 30 seconds
    refetchOnWindowFocus: true, // Refetch when window regains focus
    retry: 3, // Retry failed requests 3 times
    staleTime: 10000, // Consider data stale after 10 seconds
    meta: {
      onError: (error: Error) => {
        toast({
          title: "Error loading clients",
          description: formatAPIError(error),
          variant: "destructive",
        });
      },
    },
  });

  const { 
    data: clientCounts,
    isLoading: isCountsLoading,
    error: countsError,
    refetch: refetchCounts
  } = useQuery({
    queryKey: ['client-counts'],
    queryFn: getClientsCountByStatus,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
    retry: 3,
    staleTime: 10000,
    meta: {
      onError: (error: Error) => {
        toast({
          title: "Error loading client counts",
          description: formatAPIError(error),
          variant: "destructive",
        });
      },
    },
  });

  const {
    data: npsData,
    isLoading: isNPSLoading,
    error: npsError,
    refetch: refetchNPS
  } = useQuery({
    queryKey: ['nps-trend'],
    queryFn: getNPSMonthlyTrend,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
    retry: 3,
    staleTime: 10000,
    meta: {
      onError: (error: Error) => {
        toast({
          title: "Error loading NPS data",
          description: formatAPIError(error),
          variant: "destructive",
        });
      },
    },
  });

  const { 
    data: churnData,
    isLoading: isChurnLoading,
    error: churnError,
    refetch: refetchChurn
  } = useQuery({
    queryKey: ['churn-data'],
    queryFn: getChurnData,
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
    retry: 3,
    staleTime: 10000,
    meta: {
      onError: (error: Error) => {
        toast({
          title: "Error loading churn data",
          description: formatAPIError(error),
          variant: "destructive",
        });
      },
    },
  });

  const { 
    data: metricsData,
    isLoading: isMetricsLoading,
    error: metricsError,
    refetch: refetchMetrics
  } = useQuery({
    queryKey: ['client-metrics'],
    queryFn: () => getClientMetricsByTeam(),
    refetchInterval: 30000,
    refetchOnWindowFocus: true,
    retry: 3,
    staleTime: 10000,
    meta: {
      onError: (error: Error) => {
        toast({
          title: "Error loading client metrics",
          description: formatAPIError(error),
          variant: "destructive",
        });
      },
    },
  });

  // Combine all errors, prioritizing the first one found
  const error = clientsError || countsError || npsError || churnError || metricsError;

  // Process metrics to add missing required properties
  const metrics = metricsData ? {
    ...metricsData,
    performanceTrends: 'performanceTrends' in metricsData && Array.isArray(metricsData.performanceTrends)
      ? metricsData.performanceTrends 
      : (clients ? calculatePerformanceTrends(clients) : []),
    trends: 'trends' in metricsData
      ? metricsData.trends 
      : { 
          retentionTrend: 0, 
          atRiskTrend: 0, 
          churnTrend: 0 
        }
  } : undefined;

  const dataUpdatedAt = Math.max(
    ...[
      clients?.dataUpdatedAt,
      clientCounts?.dataUpdatedAt,
      npsData?.dataUpdatedAt,
      churnData?.dataUpdatedAt,
      metricsData?.dataUpdatedAt
    ].filter(Boolean).map(date => date instanceof Date ? date.getTime() : 0)
  );

  // Combined refetch function for all queries
  const refetch = async () => {
    const results = await Promise.allSettled([
      refetchClients(),
      refetchCounts(),
      refetchNPS(),
      refetchChurn(),
      refetchMetrics()
    ]);
    
    // Check for any rejected promises and handle accordingly
    const errors = results
      .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
      .map(result => result.reason);
      
    if (errors.length > 0) {
      console.error('Errors during data refetch:', errors);
      throw new Error('Some data could not be refreshed. Please try again.');
    }
    
    return results;
  };

  return {
    clients,
    clientCounts,
    npsData,
    churnData,
    metrics,
    isLoading: isClientsLoading || isCountsLoading || isNPSLoading || isChurnLoading || isMetricsLoading,
    error,
    refetch,
    dataUpdatedAt: dataUpdatedAt || undefined
  };
}
