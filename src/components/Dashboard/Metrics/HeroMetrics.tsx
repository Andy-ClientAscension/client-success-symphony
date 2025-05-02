
import React from "react";
import { HeroMetric } from "./HeroMetric";
import { useQuery } from "@tanstack/react-query";
import { Users, DollarSign, Heart, Gauge, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency, calculateStatusCounts, calculateRates } from "@/utils/analyticsUtils";
import { dataSyncService } from "@/utils/dataSyncService";
import { useSyncedDashboard } from "@/hooks/useSyncedDashboard";

interface HeroMetricsProps {
  className?: string;
}

export function HeroMetrics({ className }: HeroMetricsProps) {
  // Use the shared dashboard hook to ensure consistent data across components
  const { clients, clientCounts, npsScore, isLoading, error } = useSyncedDashboard();
  
  const { data, isLoading: isMetricsLoading } = useQuery({
    queryKey: ['hero-metrics'],
    queryFn: async () => {
      // Use the synchronized clients data from useSyncedDashboard
      // which is already loaded by the parent component
      
      // Safely calculate metrics with fallbacks for zero/empty cases
      const activeClients = clients.filter(c => c.status === 'active');
      const totalClients = clients.length || 1; // Avoid division by zero
      
      // Calculate status counts and rates using shared utility functions
      const statusCounts = calculateStatusCounts(clients);
      const rates = calculateRates(statusCounts);
      
      const metrics = {
        activeStudents: statusCounts.active || 0,
        retentionRate: rates.retentionRate || 0,
        mrr: clients.reduce((sum, client) => sum + (client.mrr || 0), 0),
        npsAverage: clients.some(c => c.npsScore !== undefined && c.npsScore !== null) 
          ? Math.round(clients.reduce((sum, client) => sum + (client.npsScore || 0), 0) / 
              clients.filter(c => c.npsScore !== undefined && c.npsScore !== null).length || 1) 
          : 0,
        healthScore: clients.some(c => c.progress !== undefined && c.progress !== null)
          ? Math.round(clients.reduce((sum, client) => sum + (client.progress || 0), 0) / 
              clients.filter(c => c.progress !== undefined && c.progress !== null).length || 1)
          : 0
      };
      
      return metrics;
    },
    // Only refetch when clients data changes
    enabled: clients.length > 0 && !isLoading,
    staleTime: 15000, // Consider data fresh for 15 seconds
  });

  if (error) {
    console.error('Error fetching metrics:', error);
  }

  // Loading state while metrics are being calculated
  const isLoadingData = isLoading || isMetricsLoading;

  const heroMetrics = [
    {
      title: "Active Students",
      value: data?.activeStudents ?? clientCounts?.active ?? 0,
      icon: <Users />,
      trend: {
        value: 12,
        direction: 'up' as const,
        label: 'vs last month'
      }
    },
    {
      title: "Retention Rate",
      value: `${data?.retentionRate ?? (clientCounts.active / (clientCounts.total || 1) * 100).toFixed(0) ?? 0}%`,
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
      value: data?.npsAverage ?? npsScore ?? 0,
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
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4", className)} aria-label="Key performance metrics">
      {heroMetrics.map((metric, index) => (
        <HeroMetric
          key={metric.title}
          title={metric.title}
          value={metric.value}
          icon={metric.icon}
          trend={metric.trend}
          variant={index === 0 ? 'primary' : 'secondary'}
          size="md"
          isLoading={isLoadingData}
          aria-label={`${metric.title}: ${metric.value}`}
        />
      ))}
    </div>
  );
}
