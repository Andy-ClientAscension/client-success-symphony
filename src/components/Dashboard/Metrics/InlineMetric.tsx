
import React from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface InlineMetricProps {
  label: string;
  value: string | number;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  icon?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export function InlineMetric({
  label,
  value,
  trend,
  icon,
  className,
  variant = 'default'
}: InlineMetricProps) {
  const variantClasses = {
    default: 'text-muted-foreground',
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-amber-600 dark:text-amber-400',
    danger: 'text-red-600 dark:text-red-400'
  };
  
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {icon && <span className="text-muted-foreground">{icon}</span>}
      <span className="text-sm font-medium">{label}:</span>
      <span className="text-sm font-bold">{value}</span>
      {trend && (
        <span className={cn(
          "text-xs flex items-center",
          trend.direction === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
        )}>
          {trend.direction === 'up' ? (
            <TrendingUp className="h-3 w-3 mr-0.5" />
          ) : (
            <TrendingDown className="h-3 w-3 mr-0.5" />
          )}
          {trend.value}%
        </span>
      )}
    </div>
  );
}
