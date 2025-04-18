
import React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";

export type CardSize = "sm" | "md" | "lg";
export type CardVariant = "default" | "primary" | "success" | "warning" | "danger" | "info" | "outline";

interface StyledCardProps {
  title?: string;
  description?: string;
  variant?: CardVariant;
  size?: CardSize;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
  isLoading?: boolean;
}

export function StyledCard({
  title,
  description,
  variant = "default",
  size = "md",
  className,
  headerClassName,
  contentClassName,
  footerClassName,
  footer,
  children,
  isLoading = false
}: StyledCardProps) {
  const variantStyles = {
    default: "bg-white dark:bg-gray-800/70 border-border/10",
    outline: "border-2 border-border dark:border-gray-700",
    primary: "border-brand-100 dark:border-brand-900/50 bg-brand-50/30 dark:bg-brand-950/30",
    success: "border-success-100 dark:border-success-900/50 bg-success-50/30 dark:bg-success-950/30",
    warning: "border-warning-100 dark:border-warning-900/50 bg-warning-50/30 dark:bg-warning-950/30",
    danger: "border-danger-100 dark:border-danger-900/50 bg-danger-50/30 dark:bg-danger-950/30",
    info: "border-blue-100 dark:border-blue-900/50 bg-blue-50/30 dark:bg-blue-950/30"
  };

  const sizeStyles = {
    sm: "p-2",
    md: "p-4",
    lg: "p-6"
  };

  return (
    <Card 
      className={cn(
        "shadow-sm hover:shadow-md transition-all duration-200",
        variantStyles[variant], 
        sizeStyles[size], 
        className
      )}
    >
      {(title || description) && (
        <CardHeader className={cn(
          size === "sm" ? "pb-1 px-3 pt-3" : "pb-2",
          headerClassName
        )}>
          {title && (
            <CardTitle className={cn(
              size === "sm" ? "text-base" : "text-lg",
              "font-bold text-foreground"
            )}>
              {title}
            </CardTitle>
          )}
          {description && (
            <CardDescription className="text-muted-foreground">
              {description}
            </CardDescription>
          )}
        </CardHeader>
      )}
      <CardContent className={cn(
        size === "sm" ? "pt-0 px-3 pb-3" : "",
        contentClassName
      )}>
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : (
          children
        )}
      </CardContent>
      {footer && (
        <CardFooter className={cn(
          size === "sm" ? "pt-0 px-3 pb-3" : "",
          "border-t border-border/10",
          footerClassName
        )}>
          {footer}
        </CardFooter>
      )}
    </Card>
  );
}

// Metric Item component that can be reused across dashboard
export interface MetricItemProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  trend?: {
    value: number;
    label: string;
  };
  className?: string;
  valueClassName?: string;
}

export function MetricItem({ 
  icon, 
  title, 
  value, 
  trend, 
  className,
  valueClassName
}: MetricItemProps) {
  return (
    <div className={cn("border border-border/10 rounded-lg p-3 bg-white dark:bg-gray-800/70 shadow-sm", className)}>
      <div className="flex items-center gap-2 mb-2">
        <div className="bg-brand-50 dark:bg-brand-900/30 p-2 rounded-md">
          {icon}
        </div>
        <span className="font-medium">{title}</span>
      </div>
      <p className={cn("text-xl font-bold", valueClassName)}>{value}</p>
      {trend && (
        <div className="mt-1 text-xs flex items-center">
          <span className={cn(
            trend.value > 0 ? "text-success-600 dark:text-success-400" : 
            trend.value < 0 ? "text-danger-600 dark:text-danger-400" : 
            "text-muted-foreground"
          )}>
            {trend.value > 0 ? "↑ " : trend.value < 0 ? "↓ " : "→ "}
            {Math.abs(trend.value)}% {trend.label}
          </span>
        </div>
      )}
    </div>
  );
}
