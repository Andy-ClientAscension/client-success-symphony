
import { useState, useEffect } from 'react';
import { getAllClients, getClientMetricsByTeam } from '@/lib/data';

// Add initial trends object to avoid undefined errors
const defaultTrends = {
  retentionTrend: 0,
  atRiskTrend: 0,
  churnTrend: 0
};

export function useTeamData(selectedTeam: string = 'all') {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [teamData, setTeamData] = useState<any>({
    metrics: {
      totalMRR: 0,
      totalCallsBooked: 0,
      totalDealsClosed: 0
    },
    statusCounts: {
      active: 0,
      atRisk: 0,
      churned: 0,
      total: 0
    },
    averageHealth: 0,
    trends: defaultTrends
  });

  useEffect(() => {
    const fetchTeamData = async () => {
      setLoading(true);
      try {
        const clients = getAllClients();
        const filteredClients = selectedTeam === 'all' 
          ? clients 
          : clients.filter(client => client.team === selectedTeam);
          
        const teamMetrics = getClientMetricsByTeam(selectedTeam);
        
        // Calculate status counts
        const statusCounts = {
          active: filteredClients.filter(c => c.status === 'active').length,
          atRisk: filteredClients.filter(c => c.status === 'at-risk').length,
          churned: filteredClients.filter(c => c.status === 'churned').length,
          total: filteredClients.length
        };
        
        // Calculate average health score
        // Use optional chaining and nullish coalescing
        // Change from client.healthScore to client.npsScore as per the Client interface
        const totalHealth = filteredClients.reduce((sum, client) => {
          // Use npsScore instead of healthScore and handle nullish values
          return sum + (client?.npsScore ?? 0);
        }, 0);
        
        const averageHealth = statusCounts.total > 0 
          ? totalHealth / statusCounts.total 
          : 0;
        
        // Since teamMetrics doesn't have a trends property, we'll use our default trends
        // or any mock data we want to provide
        
        setTeamData({
          metrics: teamMetrics,
          statusCounts,
          averageHealth,
          trends: defaultTrends // Use the default trends since it doesn't exist in teamMetrics
        });
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch team data'));
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, [selectedTeam]);

  return {
    loading,
    error,
    teamData,
    refetch: () => {
      setLoading(true);
      // This will trigger the useEffect again
      setTeamData({...teamData});
    }
  };
}
