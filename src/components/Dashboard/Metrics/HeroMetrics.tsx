
import React from "react";
import { HeroMetric } from "./HeroMetric";
import { useQuery } from "@tanstack/react-query";
import { Users, DollarSign, Heart, Gauge, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/analyticsUtils";
import { dataSyncService } from "@/utils/dataSyncService";

interface HeroMetricsProps {
  className?: string;
}

export function HeroMetrics({ className }: HeroMetricsProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['hero-metrics'],
    queryFn: async () => {
      const clients = dataSyncService.loadData('clients', []);
      const metrics = {
        activeStudents: clients.filter(c => c.status === 'active').length,
        retentionRate: Math.round((clients.filter(c => c.status === 'active').length / clients.length) * 100),
        mrr: clients.reduce((sum, client) => sum + (client.mrr || 0), 0),
        npsAverage: Math.round(clients.reduce((sum, client) => sum + (client.npsScore || 0), 0) / clients.length),
        healthScore: Math.round(clients.reduce((sum, client) => sum + (client.progress || 0), 0) / clients.length)
      };
      return metrics;
    },
    refetchInterval: 30000, // 30 seconds
    refetchOnWindowFocus: true,
    retry: 3,
    staleTime: 15000, // Consider data fresh for 15 seconds
  });

  if (error) {
    console.error('Error fetching metrics:', error);
  }

  const heroMetrics = [
    {
      title: "Active Students",
      value: data?.activeStudents ?? 0,
      icon: <Users />,
      trend: {
        value: 12,
        direction: 'up' as const,
        label: 'vs last month'
      }
    },
    {
      title: "Retention Rate",
      value: `${data?.retentionRate ?? 0}%`,
      icon: <Heart />,
      trend: {
        value: 5,
        direction: 'up' as const,
        label: 'vs last month'
      }
    },
    {
      title: "Monthly Revenue",
      value: formatCurrency(data?.mrr ?? 0),
      icon: <DollarSign />,
      trend: {
        value: 8,
        direction: 'up' as const,
        label: 'vs last month'
      }
    },
    {
      title: "NPS Score",
      value: data?.npsAverage ?? 0,
      icon: <TrendingUp />,
      trend: {
        value: 2,
        direction: 'up' as const,
        label: 'vs last month'
      }
    },
    {
      title: "Health Score",
      value: `${data?.healthScore ?? 0}%`,
      icon: <Gauge />,
      trend: {
        value: 3,
        direction: 'up' as const,
        label: 'vs last month'
      }
    }
  ];

  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4", className)}>
      {heroMetrics.map((metric, index) => (
        <HeroMetric
          key={metric.title}
          title={metric.title}
          value={metric.value}
          icon={metric.icon}
          trend={metric.trend}
          variant={index === 0 ? 'primary' : 'secondary'}
          size="md"
          aria-label={`${metric.title}: ${metric.value}`}
        />
      ))}
    </div>
  );
}
