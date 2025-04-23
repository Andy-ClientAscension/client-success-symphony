
import React from 'react';
import { Users, Heart, DollarSign } from 'lucide-react';
import { HeroMetric } from './HeroMetric';
import { useDashboardData } from '@/hooks/use-dashboard-data';

export function DashboardKPIHeader() {
  const { clients, clientCounts, metrics } = useDashboardData();
  
  const kpiMetrics = [
    {
      title: "Total Students",
      value: clientCounts.active + clientCounts.new,
      icon: <Users className="h-5 w-5" />,
      trend: {
        value: 8,
        direction: 'up' as const,
        label: 'vs last month'
      }
    },
    {
      title: "Retention Rate",
      value: `${Math.round((clientCounts.active / (clientCounts.active + clientCounts.churned)) * 100)}%`,
      icon: <Heart className="h-5 w-5" />,
      trend: {
        value: 5,
        direction: 'up' as const,
        label: 'vs last month'
      }
    },
    {
      title: "Monthly Revenue",
      value: `$${metrics.totalMRR.toLocaleString()}`,
      icon: <DollarSign className="h-5 w-5" />,
      trend: {
        value: 12,
        direction: 'up' as const,
        label: 'vs last month'
      }
    }
  ];

  return (
    <header 
      className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6" 
      role="region" 
      aria-label="Key Performance Indicators"
    >
      {kpiMetrics.map((metric) => (
        <HeroMetric
          key={metric.title}
          title={metric.title}
          value={metric.value}
          icon={metric.icon}
          trend={metric.trend}
          size="lg"
          variant="primary"
        />
      ))}
    </header>
  );
}
