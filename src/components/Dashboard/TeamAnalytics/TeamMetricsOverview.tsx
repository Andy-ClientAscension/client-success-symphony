
import React, { useMemo } from "react";
import { StatusDistribution, PerformanceMetrics } from "../Shared";

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
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Status Distribution</h3>
        <StatusDistribution
          statusCounts={statusCounts}
          rates={rates}
          showTrends={true}
        />
      </div>
      
      <div className="space-y-2">
        <PerformanceMetrics
          data={performanceData}
          title="Performance Metrics"
        />
      </div>
    </div>
  );
}
