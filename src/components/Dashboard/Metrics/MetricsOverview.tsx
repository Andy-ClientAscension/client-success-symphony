
import React from "react";
import { HeroMetric } from "./HeroMetric";
import { Users, DollarSign, TrendingUp, BarChart } from "lucide-react";

interface MetricsOverviewProps {
  data: {
    totalClients: number;
    monthlyRevenue: number;
    growthRate: number;
    successRate: number;
  };
}

export function MetricsOverview({ data }: MetricsOverviewProps) {
  const primaryMetrics = [
    {
      title: "Total Clients",
      value: data.totalClients,
      icon: <Users />,
      trend: {
        value: 8,
        direction: 'up' as const,
        label: "vs last month"
      }
    },
    {
      title: "Monthly Revenue",
      value: `$${data.monthlyRevenue}`,
      icon: <DollarSign />,
      trend: {
        value: 12,
        direction: 'up' as const,
        label: "vs last month"
      }
    }
  ];

  const secondaryMetrics = [
    {
      title: "Growth Rate",
      value: `${data.growthRate}%`,
      icon: <TrendingUp />,
      trend: {
        value: 5,
        direction: 'up' as const
      }
    },
    {
      title: "Success Rate",
      value: `${data.successRate}%`,
      icon: <BarChart />,
      trend: {
        value: 3,
        direction: 'up' as const
      }
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {primaryMetrics.map((metric, index) => (
          <HeroMetric
            key={index}
            size="lg"
            variant="primary"
            {...metric}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {secondaryMetrics.map((metric, index) => (
          <HeroMetric
            key={index}
            size="sm"
            variant="secondary"
            {...metric}
          />
        ))}
      </div>
    </div>
  );
}
