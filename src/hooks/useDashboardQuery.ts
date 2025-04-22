
import { useQuery } from "@tanstack/react-query";
import { getAllClients, getClientsCountByStatus, getAverageNPS, getChurnData } from "@/lib/data";

export function useDashboardQuery() {
  return useQuery({
    queryKey: ['dashboard-data'],
    queryFn: async () => {
      const clients = getAllClients();
      const clientCounts = getClientsCountByStatus();
      const npsData = {
        current: getAverageNPS(),
        trend: [
          { month: 'Jan', score: 7.5 },
          { month: 'Feb', score: 7.8 },
          { month: 'Mar', score: 8.1 },
          { month: 'Apr', score: 8.3 },
          { month: 'May', score: 8.0 },
          { month: 'Jun', score: 8.4 }
        ]
      };
      const churnData = getChurnData();
      
      // Calculate aggregated metrics
      const totalMRR = clients.reduce((sum, client) => sum + (client.mrr || 0), 0);
      const totalCallsBooked = clients.reduce((sum, client) => sum + (client.callsBooked || 0), 0);
      const totalDealsClosed = clients.reduce((sum, client) => sum + (client.dealsClosed || 0), 0);
      
      const performanceTrends = [
        { metric: 'MRR', currentValue: totalMRR, previousValue: totalMRR * 0.92, percentChange: 8.7 },
        { metric: 'Calls Booked', currentValue: totalCallsBooked, previousValue: totalCallsBooked * 0.85, percentChange: 17.6 },
        { metric: 'Deals Closed', currentValue: totalDealsClosed, previousValue: totalDealsClosed * 0.94, percentChange: 6.4 }
      ];
      
      return {
        clients,
        clientCounts,
        npsData,
        churnData,
        metrics: {
          totalMRR,
          totalCallsBooked,
          totalDealsClosed,
          performanceTrends
        }
      };
    },
    staleTime: 1000 * 60 * 5 // 5 minutes
  });
}
