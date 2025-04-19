
import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface MetricTrendProps {
  value: string;
  direction: "up" | "down" | "neutral";
  text?: string;
}

export function MetricTrend({ value, direction, text }: MetricTrendProps) {
  return (
    <div className={`flex items-center text-xs ${
      direction === "up" ? "text-green-600" : 
      direction === "down" ? "text-red-600" : ""
    }`}>
      {direction === "up" ? (
        <ArrowUpRight className="h-3 w-3 mr-1" />
      ) : direction === "down" ? (
        <ArrowDownRight className="h-3 w-3 mr-1" />
      ) : null}
      <span>{text || value}</span>
    </div>
  );
}
