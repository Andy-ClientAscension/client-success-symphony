
import React from "react";

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
  return (
    <div className="p-3 bg-card/50 border rounded-lg">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center">
          {icon}
          <span className="text-xs font-medium ml-1">{title}</span>
        </div>
        {trend && (
          <div className={`text-xs flex items-center ${
            trend.value > 0
              ? "text-green-600 dark:text-green-400"
              : trend.value < 0
                ? "text-red-600 dark:text-red-400"
                : "text-amber-600 dark:text-amber-400"
          }`}>
            {trend.indicator}
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
      <div className="flex items-baseline">
        <span className={`text-xl font-bold ${color}`}>{value}%</span>
        <span className="text-xs text-muted-foreground ml-2">{count} {label}</span>
      </div>
    </div>
  );
}
