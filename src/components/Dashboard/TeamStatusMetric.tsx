
import React from "react";
import { AlertTriangle, ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface TeamStatusMetricProps {
  title: string;
  value: number;
  color: string;
  icon: React.ReactNode;
  count: number;
  label: string;
  // trend example: { value: number, indicator: React.ReactNode }
  trend?: {
    value: number;
    indicator?: React.ReactNode;
  };
  // Optional context or correlation note (short)
  contextNote?: string;
}

export function TeamStatusMetric({
  title,
  value,
  color,
  icon,
  count,
  label,
  trend,
  contextNote,
}: TeamStatusMetricProps) {
  const isAnomaly = trend && (trend.value < 0 || (title === "Churn Rate" && value > 10));
  const statusColor = color ?? "text-gray-500";

  let trendDirection: "up" | "down" | "neutral" = "neutral";
  if (trend) {
    if (trend.value > 0) trendDirection = "up";
    else if (trend.value < 0) trendDirection = "down";
    else trendDirection = "neutral";
  }

  const arrowIcon =
    trendDirection === "up" ? (
      <ArrowUp className="h-4 w-4 text-green-600 inline-block" aria-label="Trend up" />
    ) : trendDirection === "down" ? (
      <ArrowDown className="h-4 w-4 text-red-600 inline-block" aria-label="Trend down" />
    ) : null;

  const valueColor =
    trendDirection === "up"
      ? "text-green-600 dark:text-green-400"
      : trendDirection === "down"
      ? "text-red-600 dark:text-red-400"
      : "text-gray-500";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "p-4 rounded-xl shadow bg-white dark:bg-card flex flex-col space-y-2 border",
              isAnomaly
                ? "border-red-400 bg-red-50 dark:border-red-600 dark:bg-red-950/10"
                : "border-border"
            )}
            tabIndex={0}
            role="group"
            aria-label={title}
          >
            <div className="flex items-center gap-2">
              {icon}
              <span className={cn("font-semibold", statusColor, "text-sm")}>{title}</span>
              {isAnomaly && (
                <AlertTriangle className="h-4 w-4 ml-1 text-red-600" aria-label="Anomaly" />
              )}
              {arrowIcon}
              {trend?.indicator && (
                <span className={cn("ml-1 font-semibold text-xs", valueColor)}>
                  {trend.indicator}
                </span>
              )}
            </div>
            <div className="flex items-end gap-1">
              <span className={cn("text-2xl font-bold", valueColor)}>{value}%</span>
              <span className="text-xs text-gray-600 dark:text-gray-400">{count} {label}</span>
            </div>
            {contextNote && (
              <div className="text-xs text-muted-foreground mt-1">
                {contextNote}
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div>
            {isAnomaly ? (
              <span className="text-red-600 font-bold mr-2">Alert: Unusual change in {title}!</span>
            ) : null}
            <span>
              {contextNote
                ? contextNote
                : `This shows latest ${title.toLowerCase()} (with trends and anomalies flagged).`}
            </span>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
