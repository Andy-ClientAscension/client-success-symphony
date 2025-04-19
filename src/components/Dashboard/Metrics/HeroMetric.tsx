
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface HeroMetricProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    direction: 'up' | 'down';
    label?: string;
  };
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  "aria-label"?: string;
}

export function HeroMetric({
  title,
  value,
  icon,
  trend,
  size = 'md',
  className,
  "aria-label": ariaLabel,
}: HeroMetricProps) {
  const sizeClasses = {
    sm: {
      card: 'p-4',
      title: 'text-xs',
      value: 'text-xl',
      trend: 'text-xs',
      icon: 'p-1.5'
    },
    md: {
      card: 'p-5',
      title: 'text-sm',
      value: 'text-2xl',
      trend: 'text-sm',
      icon: 'p-2'
    },
    lg: {
      card: 'p-6',
      title: 'text-base',
      value: 'text-3xl',
      trend: 'text-sm',
      icon: 'p-3'
    }
  };

  return (
    <Card 
      className={cn(
        "border-border/30 shadow-sm hover:shadow-md transition-all duration-200",
        "bg-gradient-to-b from-white to-gray-50 dark:from-gray-800/90 dark:to-gray-900/80",
        sizeClasses[size].card,
        className
      )}
    >
      <CardContent className="p-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p 
              className={cn(
                "font-medium text-gray-600 dark:text-gray-300 mb-1",
                sizeClasses[size].title
              )}
            >
              {title}
            </p>
            <h3 
              className={cn(
                "font-bold text-gray-900 dark:text-white",
                sizeClasses[size].value
              )}
              aria-label={ariaLabel || `${title}: ${value}`}
            >
              {value}
            </h3>
          </div>
          {icon && (
            <div className={cn(
              "bg-brand-100 dark:bg-brand-800/50 rounded-full",
              sizeClasses[size].icon
            )}>
              {icon}
            </div>
          )}
        </div>
        {trend && (
          <div 
            className={cn(
              "flex items-center font-medium",
              trend.direction === 'up' 
                ? "text-emerald-600 dark:text-emerald-400" 
                : "text-red-500 dark:text-red-400",
              sizeClasses[size].trend
            )}
          >
            {trend.direction === 'up' ? (
              <ArrowUp className="h-4 w-4 mr-1" />
            ) : (
              <ArrowDown className="h-4 w-4 mr-1" />
            )}
            {trend.value}%
            {trend.label && <span className="ml-1">{trend.label}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
