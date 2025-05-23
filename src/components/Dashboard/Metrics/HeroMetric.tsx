
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

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
  variant?: 'primary' | 'secondary' | 'tertiary';
  isLoading?: boolean;
  "aria-label"?: string;
}

export function HeroMetric({
  title,
  value,
  icon,
  trend,
  size = 'md',
  variant = 'primary',
  className,
  isLoading = false,
  "aria-label": ariaLabel,
}: HeroMetricProps) {
  const sizeClasses = {
    sm: {
      card: 'p-4',
      title: 'text-xs',
      value: 'text-xl',
      trend: 'text-xs',
      icon: 'h-4 w-4'
    },
    md: {
      card: 'p-5',
      title: 'text-sm',
      value: 'text-2xl',
      trend: 'text-sm',
      icon: 'h-5 w-5'
    },
    lg: {
      card: 'p-6',
      title: 'text-base',
      value: 'text-3xl',
      trend: 'text-base',
      icon: 'h-6 w-6'
    }
  };

  const variantClasses = {
    primary: 'bg-gradient-to-br from-brand-50 to-brand-100/50 dark:from-brand-950/50 dark:to-brand-900/30',
    secondary: 'bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-900/30',
    tertiary: 'bg-white dark:bg-gray-800'
  };

  // Handle various "empty" values
  const isEmpty = 
    value === 0 || 
    value === "0%" || 
    value === "$0" || 
    value === "0";
  
  // Format value for display
  const displayValue = isEmpty 
    ? (typeof value === "string" && value.endsWith("%") ? "0%" : (typeof value === "string" && value.startsWith("$") ? "$0" : "0"))
    : value;

  if (isLoading) {
    return (
      <Card 
        className={cn(
          "border-border/30 shadow-sm hover:shadow-md transition-all duration-200",
          variantClasses[variant],
          sizeClasses[size].card,
          className
        )}
      >
        <CardContent className="p-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-7 w-16" />
            </div>
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
          <Skeleton className="h-4 w-24" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={cn(
        "border-border/30 shadow-sm hover:shadow-md transition-all duration-200",
        variantClasses[variant],
        sizeClasses[size].card,
        className
      )}
    >
      <CardContent className="p-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p 
              className={cn(
                "font-medium text-muted-foreground mb-1",
                sizeClasses[size].title
              )}
              id={`${title.toLowerCase().replace(/\s+/g, '-')}-label`}
            >
              {title}
            </p>
            <h3 
              className={cn(
                "font-bold text-foreground",
                sizeClasses[size].value,
                isEmpty ? "text-muted-foreground" : ""
              )}
              aria-label={ariaLabel || `${title}: ${value}`}
              aria-labelledby={`${title.toLowerCase().replace(/\s+/g, '-')}-label`}
            >
              {displayValue}
              {isEmpty && (
                <span className="text-sm font-normal ml-2 text-muted-foreground">
                  (No data)
                </span>
              )}
            </h3>
          </div>
          {icon && (
            <div 
              className={cn(
                "text-brand-500 dark:text-brand-400",
                sizeClasses[size].icon,
                isEmpty ? "opacity-50" : ""
              )}
              aria-hidden="true"
            >
              {icon}
            </div>
          )}
        </div>
        {trend && (
          <div 
            className={cn(
              "flex items-center font-medium",
              isEmpty ? "text-muted-foreground" : (
                trend.direction === 'up' 
                  ? "text-emerald-600 dark:text-emerald-400" 
                  : "text-red-500 dark:text-red-400"
              ),
              sizeClasses[size].trend
            )}
            role="status"
            aria-label={`Trend ${trend.direction === 'up' ? 'up' : 'down'} ${trend.value}% ${trend.label || ''}`}
          >
            {trend.direction === 'up' ? (
              <ArrowUp className="h-4 w-4 mr-1" aria-hidden="true" />
            ) : (
              <ArrowDown className="h-4 w-4 mr-1" aria-hidden="true" />
            )}
            {trend.value}%
            {trend.label && <span className="ml-1 text-muted-foreground">{trend.label}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
