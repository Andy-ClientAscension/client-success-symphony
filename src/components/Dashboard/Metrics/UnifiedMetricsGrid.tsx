
import React from "react";
import { MetricCard } from "./MetricCard";
import { 
  ArrowUp, 
  ArrowDown,
  Users,
  AlertTriangle,
  CheckCircle,
  TrendingUp
} from "lucide-react";

export interface MetricItem {
  title: string;
  value: number | string;
  trend?: {
    value: string;
    direction: "up" | "down" | "neutral";
  };
  badge?: {
    value: string;
    variant: "default" | "outline" | "green" | "amber" | "blue" | "red";
  };
  icon?: React.ReactNode;
}

interface UnifiedMetricsGridProps {
  metrics: MetricItem[];
  columns?: 2 | 3 | 4 | 6 | 7;
  className?: string;
}

export function UnifiedMetricsGrid({
  metrics,
  columns = 4,
  className = ""
}: UnifiedMetricsGridProps) {
  // Determine grid columns class based on prop
  const gridClass = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-2 md:grid-cols-4",
    6: "grid-cols-2 sm:grid-cols-3 lg:grid-cols-6",
    7: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7"
  }[columns];
  
  return (
    <div className={`grid ${gridClass} gap-3 ${className}`}>
      {metrics.map((metric, index) => (
        <MetricCard 
          key={`metric-${index}`}
          title={metric.title}
          value={metric.value}
          trend={metric.trend}
          badge={metric.badge}
        />
      ))}
    </div>
  );
}

// Helper function to generate metrics array from common dashboard data
export function generateClientMetrics({
  total,
  active,
  atRisk,
  newClients,
  churn,
  success,
  nps,
  growthRate
}: {
  total: number;
  active: number;
  atRisk: number;
  newClients: number;
  churn: number;
  success: number;
  nps?: number;
  growthRate?: number;
}) {
  // Calculate percentages
  const totalClients = total || 1; // Prevent division by zero
  const activePercent = Math.round((active / totalClients) * 100);
  const atRiskPercent = Math.round((atRisk / totalClients) * 100);
  const newPercent = Math.round((newClients / totalClients) * 100);
  
  const metrics: MetricItem[] = [
    {
      title: "Total Clients",
      value: total,
      trend: growthRate ? {
        value: `+${growthRate}% growth`,
        direction: "up"
      } : undefined,
      icon: <Users className="h-4 w-4" />
    },
    {
      title: "Active Clients",
      value: active,
      badge: {
        value: `${activePercent}%`,
        variant: "green"
      },
      icon: <CheckCircle className="h-4 w-4" />
    },
    {
      title: "At Risk",
      value: atRisk,
      badge: {
        value: `${atRiskPercent}%`,
        variant: "amber"
      },
      icon: <AlertTriangle className="h-4 w-4" />
    },
    {
      title: "New Clients",
      value: newClients,
      badge: {
        value: `${newPercent}%`,
        variant: "blue"
      },
      icon: <Users className="h-4 w-4" />
    },
    {
      title: "Success Rate",
      value: `${success}%`,
      trend: {
        value: "+2.5% this quarter",
        direction: "up"
      }
    },
    {
      title: "Churn Rate",
      value: `${churn}%`,
      trend: {
        value: "-0.2% this month",
        direction: "down"
      }
    }
  ];
  
  // Add NPS if provided
  if (nps !== undefined) {
    metrics.push({
      title: "NPS Score",
      value: nps,
      trend: {
        value: "+0.3 points",
        direction: "up"
      },
      icon: <TrendingUp className="h-4 w-4" />
    });
  }
  
  return metrics;
}
