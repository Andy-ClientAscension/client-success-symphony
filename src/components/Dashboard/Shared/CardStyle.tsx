
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StyledCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "tertiary";
  headerClassName?: string;
}

export function StyledCard({
  title,
  children,
  className,
  variant = "primary",
  headerClassName
}: StyledCardProps) {
  const variantClasses = {
    primary: "bg-gradient-to-br from-brand-50 to-brand-100/50 dark:from-brand-950/50 dark:to-brand-900/30",
    secondary: "bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-900/30",
    tertiary: "bg-white dark:bg-gray-800"
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
      <CardContent className={!title ? "pt-6" : undefined}>
        {children}
      </CardContent>
    </Card>
  );
}
