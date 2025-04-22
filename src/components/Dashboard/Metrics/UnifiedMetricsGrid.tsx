import React from "react";
import { HeroMetric } from "./HeroMetric";
import { Users, ArrowUp, DollarSign, Ban, UserPlus, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ClientMetrics {
  total: number;
  active: number;
  atRisk: number;
  newClients: number;
  churn: number;
  success: number;
  growthRate: number;
  mrr?: number;
  nps?: number;
}

interface MetricItem {
  id: string;
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    direction: 'up' | 'down';
    label?: string;
  } | null;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'tertiary';
  className?: string;
}

interface UnifiedMetricsGridProps {
  metrics: MetricItem[];
  className?: string;
}

export function UnifiedMetricsGrid({ metrics, className }: UnifiedMetricsGridProps) {
  // Group metrics by size for visual hierarchy
  const largeMetrics = metrics.filter(m => m.size === 'lg');
  const mediumMetrics = metrics.filter(m => m.size === 'md');
  const smallMetrics = metrics.filter(m => m.size === 'sm' || !m.size);

  return (
    <div className={cn("space-y-6", className)} role="region" aria-label="Dashboard metrics">
      {largeMetrics.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {largeMetrics.map((metric) => (
            <HeroMetric
              key={metric.id}
              title={metric.title}
              value={metric.value}
              icon={metric.icon}
              trend={metric.trend || undefined}
              size="lg"
              variant={metric.variant || "primary"}
              className={metric.className}
              aria-label={`${metric.title}: ${metric.value}`}
            />
          ))}
        </div>
      )}
      
      {mediumMetrics.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {mediumMetrics.map((metric) => (
            <HeroMetric
              key={metric.id}
              title={metric.title}
              value={metric.value}
              icon={metric.icon}
              trend={metric.trend || undefined}
              size="md"
              variant={metric.variant || "secondary"}
              className={metric.className}
              aria-label={`${metric.title}: ${metric.value}`}
            />
          ))}
        </div>
      )}
      
      {smallMetrics.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {smallMetrics.map((metric) => (
            <HeroMetric
              key={metric.id}
              title={metric.title}
              value={metric.value}
              icon={metric.icon}
              trend={metric.trend || undefined}
              size="sm"
              variant={metric.variant || "tertiary"}
              className={metric.className}
              aria-label={`${metric.title}: ${metric.value}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Utility function to generate metrics from client data
export function generateClientMetrics(data: ClientMetrics): MetricItem[] {
  return [
    {
      id: "total-clients",
      title: "Total Clients",
      value: data.total,
      icon: <Users className="h-5 w-5" />,
      trend: {
        value: data.growthRate,
        direction: 'up',
        label: "vs last month"
      },
      size: 'lg'
    },
    {
      id: "active-clients",
      title: "Active Clients",
      value: data.active,
      icon: <CheckCircle2 className="h-5 w-5" />,
      trend: {
        value: Math.round((data.active / data.total) * 100),
        direction: 'up'
      },
      size: 'md'
    },
    {
      id: "at-risk-clients",
      title: "At Risk",
      value: data.atRisk,
      icon: <Ban className="h-5 w-5" />,
      trend: {
        value: Math.round((data.atRisk / data.total) * 100),
        direction: 'down'
      },
      size: 'md'
    },
    {
      id: "new-clients",
      title: "New Clients",
      value: data.newClients,
      icon: <UserPlus className="h-5 w-5" />,
      trend: {
        value: Math.round((data.newClients / data.total) * 100),
        direction: 'up'
      },
      size: 'md'
    },
    {
      id: "churn-rate",
      title: "Churn Rate",
      value: `${data.churn}%`,
      icon: <XCircle className="h-5 w-5" />,
      size: 'sm'
    },
    {
      id: "success-rate",
      title: "Success Rate",
      value: `${data.success}%`,
      icon: <ArrowUp className="h-5 w-5" />,
      size: 'sm'
    }
  ];
}
