
import React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type CardVariant = "default" | "primary" | "success" | "warning" | "danger" | "info";

interface StyledCardProps {
  title?: string;
  variant?: CardVariant;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  children: React.ReactNode;
}

export function StyledCard({
  title,
  variant = "default",
  className,
  headerClassName,
  contentClassName,
  children
}: StyledCardProps) {
  const variantStyles = {
    default: "",
    primary: "border-brand-100 dark:border-brand-900/50 bg-brand-50/30 dark:bg-brand-950/30",
    success: "border-success-100 dark:border-success-900/50 bg-success-50/30 dark:bg-success-950/30",
    warning: "border-warning-100 dark:border-warning-900/50 bg-warning-50/30 dark:bg-warning-950/30",
    danger: "border-danger-100 dark:border-danger-900/50 bg-danger-50/30 dark:bg-danger-950/30",
    info: "border-blue-100 dark:border-blue-900/50 bg-blue-50/30 dark:bg-blue-950/30"
  };

  return (
    <Card className={cn(variantStyles[variant], className)}>
      {title && (
        <CardHeader className={cn("pb-2", headerClassName)}>
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className={cn(contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}
