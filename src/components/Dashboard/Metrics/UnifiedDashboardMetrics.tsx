
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { HeroMetric } from "./HeroMetric";
import { Users, DollarSign, Phone, Calendar, CheckCircle2, AlertTriangle, XCircle, UserPlus } from "lucide-react";
import { StatusDistribution } from "../Shared/StatusDistribution";
import { PerformanceMetrics } from "../Shared/PerformanceMetrics";
import { cn } from "@/lib/utils";

interface StatusCounts {
  active: number;
  atRisk: number;
  churned: number;
  new?: number;
  total: number;
}

interface StatusRates {
  retentionRate: number;
  atRiskRate: number;
  churnRate: number;
}

interface PerformanceData {
  totalMRR: number;
  totalCallsBooked: number;
  totalDealsClosed: number;
  totalClients: number;
}

interface ConsolidatedMetrics {
  total: number;
  active: number;
  atRisk: number;
  newClients: number;
  churn: number;
  success: number;
  mrr?: number;
  nps?: number;
  growthRate?: number;
}

interface UnifiedDashboardMetricsProps {
  metrics: ConsolidatedMetrics;
  statusCounts: StatusCounts;
  rates: StatusRates;
  performanceData: PerformanceData;
  variant?: "compact" | "detailed";
  className?: string;
}

export function UnifiedDashboardMetrics({
  metrics,
  statusCounts,
  rates,
  performanceData,
  variant = "detailed",
  className
}: UnifiedDashboardMetricsProps) {
  const isCompact = variant === "compact";
  
  return (
    <div className={cn("space-y-8", className)}>
      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <HeroMetric
          title="Total Clients"
          value={metrics.total}
          icon={<Users className="h-6 w-6" />}
          trend={metrics.growthRate ? {
            value: metrics.growthRate,
            direction: 'up',
            label: "vs last month"
          } : undefined}
          size="lg"
          variant="primary"
        />
        
        <HeroMetric
          title="Monthly Revenue"
          value={`$${metrics.mrr || performanceData.totalMRR}`}
          icon={<DollarSign className="h-6 w-6" />}
          trend={{
            value: 12,
            direction: 'up',
            label: "vs last month"
          }}
          size="lg"
          variant="primary"
        />
      </div>
      
      {/* Secondary Metrics - Client Status */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <HeroMetric
          title="Active Clients"
          value={metrics.active}
          icon={<CheckCircle2 className="h-5 w-5" />}
          trend={{
            value: rates.retentionRate,
            direction: 'up'
          }}
          size="md"
          variant="secondary"
        />
        
        <HeroMetric
          title="At Risk Clients"
          value={metrics.atRisk}
          icon={<AlertTriangle className="h-5 w-5" />}
          trend={{
            value: rates.atRiskRate,
            direction: 'down'
          }}
          size="md"
          variant="secondary"
        />
        
        <HeroMetric
          title="New Clients"
          value={metrics.newClients}
          icon={<UserPlus className="h-5 w-5" />}
          trend={{
            value: Math.round((metrics.newClients / metrics.total) * 100),
            direction: 'up'
          }}
          size="md"
          variant="secondary"
        />
        
        <HeroMetric
          title="Churn Rate"
          value={`${metrics.churn}%`}
          icon={<XCircle className="h-5 w-5" />}
          trend={{
            value: metrics.churn - 2,
            direction: 'down',
            label: "vs last month"
          }}
          size="md"
          variant="secondary"
        />
      </div>
      
      {/* Performance Metrics */}
      {!isCompact && (
        <div className="space-y-6">
          <PerformanceMetrics
            data={performanceData}
            variant={isCompact ? "compact" : "detailed"}
          />
          
          <StatusDistribution
            statusCounts={statusCounts}
            rates={rates}
            variant={isCompact ? "compact" : "detailed"}
          />
        </div>
      )}
    </div>
  );
}
