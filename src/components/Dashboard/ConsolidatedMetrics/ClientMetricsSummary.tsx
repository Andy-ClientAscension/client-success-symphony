
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusDistribution } from "../Shared";
import { PerformanceMetrics } from "../Shared";
import { UnifiedMetricsGrid, generateClientMetrics } from "../Metrics/UnifiedMetricsGrid";

interface ClientMetricsSummaryProps {
  metrics: {
    total: number;
    active: number;
    atRisk: number;
    newClients: number;
    churn: number;
    success: number;
    mrr: number;
    nps?: number;
    growthRate?: number;
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
  performanceData: {
    totalMRR: number;
    totalCallsBooked: number;
    totalDealsClosed: number;
    totalClients: number;
  };
}

export function ClientMetricsSummary({
  metrics,
  statusCounts,
  rates,
  performanceData
}: ClientMetricsSummaryProps) {
  const gridMetrics = generateClientMetrics({
    total: metrics.total,
    active: metrics.active,
    atRisk: metrics.atRisk,
    newClients: metrics.newClients,
    churn: metrics.churn,
    success: metrics.success,
    nps: metrics.nps,
    growthRate: metrics.growthRate || 0
  });

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Client Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <UnifiedMetricsGrid 
          metrics={gridMetrics} 
          role="region"
          aria-label="Client metrics overview"
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Status Distribution</h3>
            <StatusDistribution 
              statusCounts={statusCounts}
              rates={rates}
              variant="detailed"
            />
          </div>
          
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Performance Overview</h3>
            <PerformanceMetrics 
              data={performanceData}
              variant="compact"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
