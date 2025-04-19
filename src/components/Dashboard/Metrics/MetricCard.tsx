
import React from "react";
import { Badge } from "@/components/ui/badge";
import { BaseMetricCard } from "./BaseMetricCard";
import { MetricValue } from "./MetricValue";
import { MetricTrend } from "./MetricTrend";
import { withMetricErrorBoundary } from "./withMetricErrorBoundary";

interface MetricCardProps {
  title: string;
  value: number | string;
  trend?: {
    value: string;
    direction: "up" | "down" | "neutral";
    text?: string;
  };
  badge?: {
    value: string;
    variant: "default" | "outline" | "green" | "amber" | "blue" | "red";
  };
}

function MetricCardComponent({ title, value, trend, badge }: MetricCardProps) {
  return (
    <BaseMetricCard title={title}>
      <MetricValue value={value} />
      {trend && <MetricTrend {...trend} />}
      {badge && (
        <div className="flex items-center text-xs">
          <Badge 
            variant="outline" 
            className={`px-1 py-0 h-4 text-[10px] ${
              badge.variant === "green" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200" :
              badge.variant === "amber" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200" :
              badge.variant === "blue" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200" :
              badge.variant === "red" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200" : ""
            }`}
          >
            {badge.value}
          </Badge>
        </div>
      )}
    </BaseMetricCard>
  );
}

export const MetricCard = withMetricErrorBoundary(MetricCardComponent, "metric");
