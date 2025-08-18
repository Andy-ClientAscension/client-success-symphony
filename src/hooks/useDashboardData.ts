import { useDashboardClientData } from './useUnifiedClientData';

export const DATA_KEYS = {
  CLIENTS: 'clients',
  CLIENT_COUNTS: 'client-counts',
  NPS_DATA: 'nps-data',
  CHURN_DATA: 'churn-data',
  TEAM_METRICS: 'team-metrics',
  ALL_DATA: 'all-dashboard-data'
};

export const DASHBOARD_KEYS = DATA_KEYS; // Alias for compatibility

interface UseDashboardDataOptions {
  teamFilter?: string;
  enableAutoSync?: boolean;
}

export function useDashboardData(options: UseDashboardDataOptions = {}) {
  const { teamFilter } = options;
  
  // Use unified client data
  const { clients, metrics, counts, isLoading, error, refetch } = useDashboardClientData(teamFilter);

  return {
    allClients: clients,
    teamStatusCounts: counts || { active: 0, 'at-risk': 0, new: 0, churned: 0 },
    teamMetrics: metrics || { totalMRR: 0, avgHealthScore: 0, retentionRate: 0 },
    isLoading,
    error,
    refreshData: refetch,
    lastUpdated: new Date(),
  };
}