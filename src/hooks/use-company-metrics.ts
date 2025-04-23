
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getAllClients, getClientsCountByStatus } from '@/lib/data';
import { calculateRates } from '@/utils/analyticsUtils';

export function useCompanyMetrics() {
  const [metrics, setMetrics] = useState<Metrics.CompanyMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchMetrics() {
      try {
        setIsLoading(true);
        const clients = getAllClients();
        const clientCounts = getClientsCountByStatus();
        
        // Transform client counts to match StatusCounts interface
        const statusCounts: Metrics.StatusCounts = {
          active: clientCounts.active || 0,
          atRisk: clientCounts["at-risk"] || 0,
          churned: clientCounts.churned || 0,
          new: clientCounts.new || 0,
          total: Object.values(clientCounts).reduce((sum, count) => sum + count, 0)
        };
        
        const rates = calculateRates(statusCounts);
        
        // Add growthRate to meet the Rates interface requirements
        const enhancedRates: Metrics.Rates = {
          ...rates,
          growthRate: rates.retentionRate - rates.churnRate // Simple calculation for growth rate
        };
        
        // Calculate base metrics
        const baseMetrics = {
          totalMRR: clients.reduce((sum, client) => sum + (client.mrr || 0), 0),
          totalCallsBooked: clients.reduce((sum, client) => sum + (client.callsBooked || 0), 0),
          totalDealsClosed: clients.reduce((sum, client) => sum + (client.dealsClosed || 0), 0),
          clientCount: clients.length
        };

        setMetrics({
          ...baseMetrics,
          statusCounts,
          rates: enhancedRates,
          trends: [] // Would be populated from actual trend data
        });
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch metrics');
        setError(error);
        toast({
          title: "Error loading metrics",
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchMetrics();
  }, [toast]);

  return { metrics, isLoading, error };
}
