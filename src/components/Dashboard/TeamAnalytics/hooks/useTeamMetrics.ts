
import { useState, useEffect } from 'react';
import { useTeamData } from './useTeamData';

export function useTeamMetrics(teamId: string) {
  const { teamData, loading, error, refetch } = useTeamData(teamId);
  const [metrics, setMetrics] = useState({
    retentionRate: 0,
    atRiskRate: 0,
    churnRate: 0,
    averageHealth: 0,
    totalMRR: 0,
    totalClients: 0
  });

  useEffect(() => {
    if (!loading && !error) {
      const { statusCounts, averageHealth, metrics: teamMetrics } = teamData;
      const total = statusCounts.total || 1; // Avoid division by zero
      
      setMetrics({
        retentionRate: (statusCounts.active / total) * 100,
        atRiskRate: (statusCounts.atRisk / total) * 100,
        churnRate: (statusCounts.churned / total) * 100,
        averageHealth,
        totalMRR: teamMetrics.totalMRR || 0,
        totalClients: statusCounts.total
      });
    }
  }, [teamData, loading, error]);

  return {
    metrics,
    loading,
    error,
    refetch,
    rawData: teamData
  };
}
