
declare namespace Metrics {
  interface BaseMetrics {
    totalMRR: number;
    totalCallsBooked: number;
    totalDealsClosed: number;
    clientCount: number;
  }

  interface StatusCounts {
    active: number;
    atRisk: number;
    churned: number;
    new: number;
    total: number;
  }

  interface Rates {
    retentionRate: number;
    atRiskRate: number;
    churnRate: number;
    growthRate: number;
  }

  interface PerformanceTrend {
    month: string;
    value: number;
    trend: number;
  }

  interface CompanyMetrics extends BaseMetrics {
    statusCounts: StatusCounts;
    rates: Rates;
    trends: PerformanceTrend[];
  }

  interface TeamMetrics extends BaseMetrics {
    teamId: string;
    teamName: string;
    teamLead: string;
    memberCount: number;
    performance: {
      avgResponseTime: number;
      taskCompletion: number;
      clientSatisfaction: number;
    };
  }
}
