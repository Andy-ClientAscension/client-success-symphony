
import React from "react";
import { cn } from "@/lib/utils";

interface MetricValueProps {
  value: string | number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function MetricValue({ value, size = "md", className }: MetricValueProps) {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl"
  };

  return (
    <div className={cn("font-bold", sizeClasses[size], className)}>
      {value}
    </div>
  );
}
