
/**
 * Dashboard Type Definitions
 */

declare namespace Dashboard {
  interface Metrics {
    totalMRR: number;
    totalCallsBooked: number;
    totalDealsClosed: number;
    performanceTrends: PerformanceTrend[];
    trends: {
      retentionTrend: number;
      atRiskTrend: number;
      churnTrend: number;
    };
  }
  
  interface PerformanceTrend {
    date: string;
    value: number;
    type: string;
  }
  
  interface ClientMetrics {
    total: number;
    active: number;
    atRisk: number;
    newClients: number;
    churn: number;
    success: number;
    growthRate: number;
  }
  
  interface ChurnData {
    month: string;
    rate: number;
  }
  
  interface NPSData {
    current: number;
    trend: NPSTrend[];
  }
  
  interface NPSTrend {
    month: string;
    score: number;
  }
  
  interface ClientCount {
    active: number;
    'at-risk': number;
    new: number;
    churned: number;
    [key: string]: number;
  }
}

export = Dashboard;
