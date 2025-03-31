
import React from "react";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TeamStatusMetricProps {
  title: string;
  value: number;
  color: string;
  icon: React.ReactNode;
  count: number;
  label: string;
  trend?: {
    value: number;
    indicator: React.ReactNode;
  };
}

export function TeamStatusMetric({ 
  title, 
  value, 
  color, 
  icon, 
  count, 
  label, 
  trend 
}: TeamStatusMetricProps) {
  // Determine progress color based on value
  let progressColor = "bg-green-500";
  if (title.includes("Churn") || title.includes("Risk")) {
    progressColor = value > 20 ? "bg-red-500" : value > 10 ? "bg-amber-500" : "bg-green-500";
  } else {
    progressColor = value < 60 ? "bg-red-500" : value < 80 ? "bg-amber-500" : "bg-green-500";
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex flex-col p-3 bg-card/50 border rounded-lg hover:bg-card/80 transition-colors cursor-default">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium">{title}</span>
              <span className={`text-sm font-semibold ${color}`}>{value}%</span>
            </div>
            <Progress 
              value={value} 
              className="h-2" 
              indicatorClassName={progressColor} 
            />
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center text-xs text-muted-foreground">
                {icon}
                <span>{count} {label}</span>
              </div>
              {trend && (
                <div className="flex items-center text-xs">
                  <span className={trend.value > 0 ? "text-green-600" : trend.value < 0 ? "text-red-600" : "text-amber-600"}>
                    {trend.value > 0 ? "+" : ""}{trend.value}%
                  </span>
                  {trend.indicator}
                </div>
              )}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="text-xs">{title}: {value}% ({count} {label})</p>
          {trend && (
            <p className="text-xs mt-1">
              {trend.value > 0 ? "Increased" : trend.value < 0 ? "Decreased" : "No change"} by {Math.abs(trend.value)}% from last period
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
