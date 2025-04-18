
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: number | string;
  trend?: {
    value: string;
    direction: "up" | "down" | "neutral";
    text?: string;
  };
  badge?: {
    value: string;
    variant: "default" | "outline" | "green" | "amber" | "blue" | "red";
  };
}

export function MetricCard({ title, value, trend, badge }: MetricCardProps) {
  return (
    <Card className="border shadow-none">
      <CardContent className="p-3">
        <div className="flex flex-col">
          <p className="text-xs text-muted-foreground">{title}</p>
          <h3 className="text-lg font-bold">{value}</h3>
          {trend && (
            <div className={`flex items-center text-xs ${
              trend.direction === "up" ? "text-green-600" : 
              trend.direction === "down" ? "text-red-600" : ""
            }`}>
              {trend.direction === "up" ? (
                <ArrowUpRight className="h-3 w-3 mr-1" />
              ) : trend.direction === "down" ? (
                <ArrowDownRight className="h-3 w-3 mr-1" />
              ) : null}
              <span>{trend.text || trend.value}</span>
            </div>
          )}
          {badge && (
            <div className="flex items-center text-xs">
              <Badge 
                variant="outline" 
                className={`px-1 py-0 h-4 text-[10px] ${
                  badge.variant === "green" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200" :
                  badge.variant === "amber" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200" :
                  badge.variant === "blue" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200" :
                  badge.variant === "red" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200" : ""
                }`}
              >
                {badge.value}
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
