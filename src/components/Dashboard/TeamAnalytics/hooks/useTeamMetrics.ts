
import { useMemo } from "react";
import { Client } from "@/lib/data";

export function useTeamMetrics(teamClients: Client[]) {
  const statusCounts = useMemo(() => ({
    active: teamClients.filter(client => client.status === 'active').length,
    atRisk: teamClients.filter(client => client.status === 'at-risk').length,
    churned: teamClients.filter(client => client.status === 'churned').length,
    new: teamClients.filter(client => client.status === 'new').length,
    total: teamClients.length
  }), [teamClients]);
  
  const retentionRate = useMemo(() => {
    return statusCounts.total > 0 
      ? Math.round((statusCounts.active / statusCounts.total) * 100) 
      : 0;
  }, [statusCounts]);
    
  const atRiskRate = useMemo(() => {
    return statusCounts.total > 0 
      ? Math.round((statusCounts.atRisk / statusCounts.total) * 100) 
      : 0;
  }, [statusCounts]);
    
  const churnRate = useMemo(() => {
    return statusCounts.total > 0 
      ? Math.round((statusCounts.churned / statusCounts.total) * 100) 
      : 0;
  }, [statusCounts]);
  
  const prevPeriodRetention = useMemo(() => {
    return Math.max(0, Math.round(retentionRate - (Math.random() * 10 - 5)));
  }, [retentionRate]);
  
  const prevPeriodAtRisk = useMemo(() => {
    return Math.max(0, Math.round(atRiskRate - (Math.random() * 10 - 3)));
  }, [atRiskRate]);
  
  const prevPeriodChurn = useMemo(() => {
    return Math.max(0, Math.round(churnRate - (Math.random() * 10 - 2)));
  }, [churnRate]);
  
  const retentionTrend = useMemo(() => retentionRate - prevPeriodRetention, [retentionRate, prevPeriodRetention]);
  const atRiskTrend = useMemo(() => atRiskRate - prevPeriodAtRisk, [atRiskRate, prevPeriodAtRisk]);
  const churnTrend = useMemo(() => churnRate - prevPeriodChurn, [churnRate, prevPeriodChurn]);

  return {
    statusCounts,
    rates: {
      retentionRate,
      atRiskRate,
      churnRate
    },
    trends: {
      retentionTrend,
      atRiskTrend,
      churnTrend
    }
  };
}
