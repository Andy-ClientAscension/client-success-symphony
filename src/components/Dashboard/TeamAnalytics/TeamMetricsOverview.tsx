
import React, { useMemo } from "react";
import { StatusDistribution, PerformanceMetrics } from "../Shared";
import { StyledCard } from "../Shared/CardStyle";

interface TeamMetricsOverviewProps {
  metrics: {
    totalMRR: number;
    totalCallsBooked: number;
    totalDealsClosed: number;
    clientCount?: number;
  };
  statusCounts: {
    active: number;
    atRisk: number;
    churned: number;
    total: number;
  };
  rates: {
    retentionRate: number;
    atRiskRate: number;
    churnRate: number;
    retentionTrend?: number;
    atRiskTrend?: number;
    churnTrend?: number;
  };
}

export function TeamMetricsOverview({
  metrics,
  statusCounts,
  rates
}: TeamMetricsOverviewProps) {
  const performanceData = useMemo(() => ({
    totalClients: statusCounts.total,
    totalMRR: metrics.totalMRR,
    totalCallsBooked: metrics.totalCallsBooked,
    totalDealsClosed: metrics.totalDealsClosed,
  }), [metrics, statusCounts.total]);

  return (
    <div className="space-y-6">
      <StyledCard 
        variant="primary"
        title="Status Distribution"
        contentClassName="pt-4"
      >
        <StatusDistribution
          statusCounts={statusCounts}
          rates={rates}
          showTrends={true}
        />
      </StyledCard>
      
      <StyledCard 
        variant="success"
        title="Performance Metrics"
        contentClassName="pt-4"
      >
        <PerformanceMetrics
          data={performanceData}
        />
      </StyledCard>
    </div>
  );
}
