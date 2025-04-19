
import { useQuery } from '@tanstack/react-query';
import { getAllClients, getClientsCountByStatus, getAverageNPS, getNPSMonthlyTrend, getChurnData } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

export function useDashboardQuery() {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['dashboard-data'],
    queryFn: async () => {
      const [clients, clientCounts, npsData, npsTrend, churnData] = await Promise.all([
        getAllClients(),
        getClientsCountByStatus(),
        getAverageNPS(),
        getNPSMonthlyTrend(),
        getChurnData()
      ]);

      // Get the last NPS score from the trend data
      const lastNPSScore = npsTrend.length > 0 ? npsTrend[npsTrend.length - 1].score : 0;
      
      // Get the last churn rate from churn data
      const lastChurnRate = churnData.length > 0 ? churnData[churnData.length - 1].rate : 0;

      return {
        clients,
        clientCounts,
        npsData,
        npsTrend,
        churnData,
        metrics: {
          totalClients: Object.values(clientCounts).reduce((a, b) => a + b, 0),
          avgNPS: npsData.current,
          churnRate: lastChurnRate
        }
      };
    },
    refetchInterval: 30000,
    staleTime: 15000,
    retry: 3,
    meta: {
      onError: (error: Error) => {
        toast({
          title: "Error refreshing dashboard",
          description: error.message,
          variant: "destructive",
        });
      },
    },
  });
}
