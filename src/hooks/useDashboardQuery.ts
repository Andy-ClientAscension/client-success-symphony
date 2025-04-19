
import { useQuery } from '@tanstack/react-query';
import { getAllClients, getClientsCountByStatus, getAverageNPS, getNPSMonthlyTrend, getChurnData } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

export function useDashboardQuery() {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['dashboard-data'],
    queryFn: async () => {
      const [clients, clientCounts, npsData, churnData] = await Promise.all([
        getAllClients(),
        getClientsCountByStatus(),
        getAverageNPS(),
        getNPSMonthlyTrend()
      ]);

      return {
        clients,
        clientCounts,
        npsData,
        churnData,
        metrics: {
          totalClients: Object.values(clientCounts).reduce((a, b) => a + b, 0),
          avgNPS: npsData.current,
          churnRate: churnData[churnData.length - 1]?.rate || 0
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
