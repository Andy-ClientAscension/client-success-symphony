
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UnifiedMetricsGrid } from "./UnifiedMetricsGrid";
import { StatusDistribution } from "../Shared/StatusDistribution";
import { PerformanceMetrics } from "../Shared/PerformanceMetrics";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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
    new: number;
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
  const [isExpanded, setIsExpanded] = useState(true);
  
  const gridMetrics = [
    {
      title: "Total Clients",
      value: metrics.total,
      trend: metrics.growthRate ? {
        value: `+${metrics.growthRate}% growth`,
        direction: "up" as const 
      } : undefined,
      badge: { value: "Primary", variant: "green" as const }
    },
    {
      title: "Monthly Revenue",
      value: `$${metrics.mrr}`,
      trend: {
        value: "+8% from last month",
        direction: "up" as const
      },
      badge: { value: "Primary", variant: "green" as const }
    },
    {
      title: "Success Rate",
      value: `${metrics.success}%`,
      trend: {
        value: "+2.5% this quarter",
        direction: "up" as const
      }
    },
    {
      title: "Churn Rate",
      value: `${metrics.churn}%`,
      trend: {
        value: "-0.2% this month",
        direction: "down" as const
      }
    }
  ];

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <Card className="shadow-sm">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">Dashboard Overview</CardTitle>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              {isExpanded ? (
                <><ChevronUp className="h-4 w-4 mr-1" /> Collapse</>
              ) : (
                <><ChevronDown className="h-4 w-4 mr-1" /> Expand</>
              )}
            </Button>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent className="space-y-6 pt-2">
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
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
