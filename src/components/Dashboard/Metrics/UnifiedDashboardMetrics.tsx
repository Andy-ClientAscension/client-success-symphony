
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UnifiedMetricsGrid } from "./UnifiedMetricsGrid";
import { StatusDistribution } from "../Shared/StatusDistribution";
import { PerformanceMetrics } from "../Shared/PerformanceMetrics";

interface UnifiedDashboardMetricsProps {
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
  };
  performanceData: {
    totalMRR: number;
    totalCallsBooked: number;
    totalDealsClosed: number;
    totalClients: number;
  };
  variant?: "compact" | "detailed";
}

export function UnifiedDashboardMetrics({
  metrics,
  statusCounts,
  rates,
  performanceData,
  variant = "detailed"
}: UnifiedDashboardMetricsProps) {
  const gridMetrics = [
    {
      title: "Total Clients",
      value: metrics.total,
      trend: metrics.growthRate ? {
        value: `+${metrics.growthRate}% growth`,
        direction: "up"
      } : undefined
    },
    {
      title: "Monthly Revenue",
      value: `$${metrics.mrr}`,
      trend: {
        value: "+8% from last month",
        direction: "up"
      }
    },
    {
      title: "Success Rate",
      value: `${metrics.success}%`,
      trend: {
        value: "+2.5% this quarter",
        direction: "up"
      }
    },
    {
      title: "Churn Rate",
      value: `${metrics.churn}%`,
      trend: {
        value: "-0.2% this month",
        direction: "down"
      }
    }
  ];

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Dashboard Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <UnifiedMetricsGrid 
          metrics={gridMetrics}
          columns={4}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatusDistribution 
            statusCounts={statusCounts}
            rates={rates}
            variant={variant === "compact" ? "compact" : "detailed"}
          />
          <PerformanceMetrics 
            data={performanceData}
            variant={variant === "compact" ? "compact" : "detailed"}
          />
        </div>
      </CardContent>
    </Card>
  );
}
