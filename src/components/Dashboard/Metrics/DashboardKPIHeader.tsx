
import React from 'react';
import { Users, Heart, DollarSign } from 'lucide-react';
import { HeroMetric } from './HeroMetric';
import { useDashboardData } from '@/hooks/useDashboardData';

export function DashboardKPIHeader() {
  const { allClients, teamStatusCounts, teamMetrics } = useDashboardData();
  
  const kpiMetrics = [
    {
      title: "Total Students",
      value: (teamStatusCounts?.active || 0) + (teamStatusCounts?.new || 0),
      icon: <Users className="h-5 w-5" />,
      trend: {
        value: 8,
        direction: 'up' as const,
        label: 'vs last month'
      }
    },
    {
      title: "Retention Rate",
      value: `${Math.round(((teamStatusCounts?.active || 0) / ((teamStatusCounts?.active || 0) + (teamStatusCounts?.churned || 0) || 1)) * 100)}%`,
      icon: <Heart className="h-5 w-5" />,
      trend: {
        value: 5,
        direction: 'up' as const,
        label: 'vs last month'
      }
    },
    {
      title: "Monthly Revenue",
      value: `$${(teamMetrics?.totalMRR || 0).toLocaleString()}`,
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
