
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StyledCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "tertiary" | "info" | "success";
  headerClassName?: string;
  contentClassName?: string;
}

export function StyledCard({
  title,
  children,
  className,
  variant = "primary",
  headerClassName,
  contentClassName
}: StyledCardProps) {
  const variantClasses = {
    primary: "bg-gradient-to-br from-brand-50 to-brand-100/50 dark:from-brand-950/50 dark:to-brand-900/30",
    secondary: "bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-900/30",
    tertiary: "bg-white dark:bg-gray-800",
    info: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
    success: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
  };

  return (
    <Card className={cn(
      "border-border/30 shadow-sm hover:shadow-md transition-all duration-200",
      variantClasses[variant],
      className
    )}>
      {title && (
        <CardHeader className={cn("pb-2", headerClassName)}>
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className={cn(!title ? "pt-6" : undefined, contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}

// Add the MetricItem component
interface MetricItemProps {
  icon: React.ReactNode;
  title: string;
  value: React.ReactNode;
  className?: string;
}

export function MetricItem({ icon, title, value, className }: MetricItemProps) {
  return (
    <div className={cn("flex flex-col space-y-1", className)}>
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-xs font-medium text-muted-foreground">{title}</span>
      </div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}
