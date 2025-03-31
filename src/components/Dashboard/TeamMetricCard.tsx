
import React from "react";
import { ArrowUpRight } from "lucide-react";

interface TeamMetricCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: number;
}

export function TeamMetricCard({ title, value, icon, trend }: TeamMetricCardProps) {
  return (
    <div className="flex flex-col p-3 bg-card/50 border rounded-lg">
      <span className="text-xs text-muted-foreground">{title}</span>
      <div className="flex items-baseline mt-1">
        <span className="text-xl font-bold">{value}</span>
        {trend !== undefined && (
          <span className="ml-2 text-xs text-green-600 flex items-center">
            <ArrowUpRight className="h-3 w-3 mr-1" />
            {trend}%
          </span>
        )}
      </div>
      {icon && (
        <div className="flex items-center mt-2 text-xs text-muted-foreground">
          {icon}
        </div>
      )}
    </div>
  );
}
