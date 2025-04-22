
import React from "react";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricTrendProps {
  value: string;
  direction: "up" | "down" | "neutral";
  text?: string;
  className?: string;
}

export function MetricTrend({ value, direction, text, className }: MetricTrendProps) {
  return (
    <div 
      className={cn(
        "flex items-center text-xs font-medium",
        direction === "up" ? "text-green-600 dark:text-green-400" : 
        direction === "down" ? "text-red-600 dark:text-red-400" : 
        "text-muted-foreground",
        className
      )}
    >
      {direction === "up" ? (
        <ArrowUp className="h-3 w-3 mr-1" />
      ) : direction === "down" ? (
        <ArrowDown className="h-3 w-3 mr-1" />
      ) : (
        <Minus className="h-3 w-3 mr-1" />
      )}
      {value}
      {text && <span className="ml-1 text-muted-foreground">{text}</span>}
    </div>
  );
}
