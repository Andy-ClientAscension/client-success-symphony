
export type DashboardSectionKey = 'metrics' | 'clients' | 'performance' | 'health';

export interface TeamMetrics {
  totalMRR: number;
  totalCallsBooked: number;
  totalDealsClosed: number;
  clientCount?: number;
}

export interface StatusCounts {
  active: number;
  atRisk: number; 
  churned: number;
  total: number;
}

export interface Rates {
  retentionRate: number;
  atRiskRate: number;
  churnRate: number;
  retentionTrend?: number;
  atRiskTrend?: number;
  churnTrend?: number;
}
