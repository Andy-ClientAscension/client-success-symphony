
/**
 * Metrics Type Definitions
 */

declare namespace Metrics {
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

  interface CompanyMetrics {
    totalMRR: number;
    totalCallsBooked: number;
    totalDealsClosed: number;
    clientCount: number;
    statusCounts: StatusCounts;
    rates: Rates;
    trends: TrendPoint[];
  }

  interface TrendPoint {
    date: string;
    value: number;
    type: string;
  }

  interface PerformanceMetrics {
    successRate: number;
    responseTime: number;
    npsScore: number;
    completionRate: number;
  }

  interface TeamMember {
    id: string;
    name: string;
    role: string;
    metrics: PerformanceMetrics;
  }
}

export = Metrics;
