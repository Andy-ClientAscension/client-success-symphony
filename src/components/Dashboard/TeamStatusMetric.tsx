
import React from "react";
import { Progress } from "@/components/ui/progress";

interface TeamStatusMetricProps {
  title: string;
  value: number;
  color: string;
  icon: React.ReactNode;
  count: number;
  label: string;
}

export function TeamStatusMetric({ title, value, color, icon, count, label }: TeamStatusMetricProps) {
  return (
    <div className="flex flex-col p-3 bg-card/50 border rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium">{title}</span>
        <span className={`text-sm font-semibold ${color}`}>{value}%</span>
      </div>
      <Progress value={value} className="h-2" />
      <div className="flex items-center mt-2 text-xs text-muted-foreground">
        {icon}
        <span>{count} {label}</span>
      </div>
    </div>
  );
}
