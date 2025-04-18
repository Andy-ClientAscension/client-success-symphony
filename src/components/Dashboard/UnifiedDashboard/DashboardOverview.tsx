
import React from "react";
import { UnifiedDashboardMetrics } from "../Metrics/UnifiedDashboardMetrics";
import { AIInsightsPanel } from "../AIInsights";
import { NPSChart } from "../NPSChart";
import { AIInsightsWidget } from "../AIInsightsWidget";
import { getStoredAIInsights } from "@/utils/aiDataAnalyzer";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { Card } from "@/components/ui/card";

export function DashboardOverview() {
  const {
    clients,
    clientCounts,
    metrics,
    npsData,
    error
  } = useDashboardData();

  if (error) {
    return null; // Error is handled by parent component
  }

  const statusCounts = {
    active: clientCounts?.active || 0,
    atRisk: clientCounts?.["at-risk"] || 0,
    churned: clientCounts?.churned || 0,
    total: clientCounts ? Object.values(clientCounts).reduce((a, b) => a + b, 0) : 0
  };

  const rates = {
    retentionRate: statusCounts.total > 0 ? Math.round((statusCounts.active / statusCounts.total) * 100) : 0,
    atRiskRate: statusCounts.total > 0 ? Math.round((statusCounts.atRisk / statusCounts.total) * 100) : 0,
    churnRate: statusCounts.total > 0 ? Math.round((statusCounts.churned / statusCounts.total) * 100) : 0
  };

  const consolidatedMetrics = {
    total: statusCounts.total,
    active: statusCounts.active,
    atRisk: statusCounts.atRisk,
    newClients: clientCounts?.new || 0,
    churn: rates.churnRate,
    success: rates.retentionRate,
    mrr: metrics?.totalMRR || 0,
    nps: npsData && npsData.length > 0 ? npsData[npsData.length - 1].score : undefined,
    growthRate: metrics?.performanceTrends?.[0]?.percentChange
  };

  const performanceData = {
    totalMRR: metrics?.totalMRR || 0,
    totalCallsBooked: metrics?.totalCallsBooked || 0,
    totalDealsClosed: metrics?.totalDealsClosed || 0,
    totalClients: statusCounts.total
  };

  return (
    <div className="space-y-6">
      <UnifiedDashboardMetrics 
        metrics={consolidatedMetrics}
        statusCounts={statusCounts}
        rates={rates}
        performanceData={performanceData}
      />
      
      <AIInsightsPanel 
        clients={clients || []}
        metrics={metrics || {}}
        statusCounts={statusCounts}
        rates={rates}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <NPSChart />
          </div>
        </Card>
        
        <AIInsightsWidget insights={getStoredAIInsights()} />
      </div>
    </div>
  );
}
