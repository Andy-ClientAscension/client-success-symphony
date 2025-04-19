
import React from "react";

interface MetricValueProps {
  value: number | string;
  className?: string;
}

export function MetricValue({ value, className = "text-lg font-bold" }: MetricValueProps) {
  return <h3 className={className}>{value}</h3>;
}
