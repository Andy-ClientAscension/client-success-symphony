
import React from "react";
import { UnifiedDashboardMetrics } from "../Metrics/UnifiedDashboardMetrics";

export function DashboardOverviewTab({ clients, clientMetrics }: any) {
  // You may add more logic/stats here as needed.
  return (
    <div className="space-y-6">
      <UnifiedDashboardMetrics
        metrics={clientMetrics}
        statusCounts={{
          active: clientMetrics.active,
          atRisk: clientMetrics.atRisk,
          churned: clientMetrics.churn,
          new: clientMetrics.newClients,
          total: clientMetrics.total,
        }}
        rates={{
          retentionRate: clientMetrics.success,
          atRiskRate: clientMetrics.atRisk / clientMetrics.total * 100,
          churnRate: clientMetrics.churn / clientMetrics.total * 100,
        }}
        performanceData={{
          totalMRR: clientMetrics.mrr,
          totalCallsBooked: 0,
          totalDealsClosed: 0,
          totalClients: clientMetrics.total,
        }}
      />
    </div>
  );
}
