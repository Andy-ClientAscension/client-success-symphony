
import React, { useMemo } from "react";
import { Progress } from "@/components/ui/progress";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { Users, AlertTriangle, Clock, CheckCircle2, XCircle } from "lucide-react";
import { Client } from "@/lib/data";
import { TeamStatusMetric } from "../TeamStatusMetric";

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
  retentionTrend?: number;
  atRiskTrend?: number;
  churnTrend?: number;
}

interface StatusDistributionProps {
  clients?: Client[];
  statusCounts: StatusCounts;
  rates: StatusRates;
  variant?: "compact" | "detailed";
  showTrends?: boolean;
}

export function StatusDistribution({
  statusCounts,
  rates,
  variant = "detailed",
  showTrends = true
}: StatusDistributionProps) {
  const trendIndicators = useMemo(() => ({
    retention: rates.retentionTrend !== undefined && (
      <span className={rates.retentionTrend > 0 ? "text-green-600" : 
                      rates.retentionTrend < 0 ? "text-red-600" : "text-amber-600"}>
        {rates.retentionTrend > 0 ? "+" : ""}{rates.retentionTrend}%
      </span>
    ),
    atRisk: rates.atRiskTrend !== undefined && (
      <span className={rates.atRiskTrend < 0 ? "text-green-600" : 
                      rates.atRiskTrend > 0 ? "text-red-600" : "text-amber-600"}>
        {rates.atRiskTrend > 0 ? "+" : ""}{rates.atRiskTrend}%
      </span>
    ),
    churn: rates.churnTrend !== undefined && (
      <span className={rates.churnTrend < 0 ? "text-green-600" : 
                      rates.churnTrend > 0 ? "text-red-600" : "text-amber-600"}>
        {rates.churnTrend > 0 ? "+" : ""}{rates.churnTrend}%
      </span>
    )
  }), [rates]);

  if (variant === "compact") {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div className="flex items-center justify-between p-2 bg-card/50 border rounded-lg">
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-2 text-green-600" />
            <span className="text-sm">Active</span>
          </div>
          <span className="font-medium">{rates.retentionRate}%</span>
        </div>
        <div className="flex items-center justify-between p-2 bg-card/50 border rounded-lg">
          <div className="flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2 text-amber-600" />
            <span className="text-sm">At Risk</span>
          </div>
          <span className="font-medium">{rates.atRiskRate}%</span>
        </div>
        <div className="flex items-center justify-between p-2 bg-card/50 border rounded-lg">
          <div className="flex items-center">
            <XCircle className="h-4 w-4 mr-2 text-red-600" />
            <span className="text-sm">Churned</span>
          </div>
          <span className="font-medium">{rates.churnRate}%</span>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <TeamStatusMetric
        title="Retention Rate"
        value={rates.retentionRate}
        color="text-green-600"
        icon={<Users className="h-4 w-4 mr-1 text-green-600" />}
        count={statusCounts.active}
        label="active clients"
        trend={showTrends && rates.retentionTrend !== undefined ? {
          value: rates.retentionTrend,
          indicator: trendIndicators.retention
        } : undefined}
      />
      
      <TeamStatusMetric
        title="At Risk Rate"
        value={rates.atRiskRate}
        color="text-amber-600"
        icon={<AlertTriangle className="h-4 w-4 mr-1 text-amber-600" />}
        count={statusCounts.atRisk}
        label="at-risk clients"
        trend={showTrends && rates.atRiskTrend !== undefined ? {
          value: rates.atRiskTrend,
          indicator: trendIndicators.atRisk
        } : undefined}
      />
      
      <TeamStatusMetric
        title="Churn Rate"
        value={rates.churnRate}
        color="text-red-600"
        icon={<XCircle className="h-4 w-4 mr-1 text-red-600" />}
        count={statusCounts.churned}
        label="churned clients"
        trend={showTrends && rates.churnTrend !== undefined ? {
          value: rates.churnTrend,
          indicator: trendIndicators.churn
        } : undefined}
      />
    </div>
  );
}
