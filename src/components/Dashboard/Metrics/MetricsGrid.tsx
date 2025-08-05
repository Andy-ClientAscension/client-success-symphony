import React from 'react';
import { MetricCard } from './MetricCard';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Heart,
  Target,
  Calendar,
  Phone,
  CheckCircle
} from 'lucide-react';

interface MetricsGridProps {
  totalClients: number;
  growthRate: number;
  clientCounts: {
    active: number;
    'at-risk': number;
    new: number;
  };
  percentages: {
    activeClientsPercentage: number;
    atRiskPercentage: number;
    newPercentage: number;
  };
  successRate: number;
  churnRate: number;
  totalMRR?: number;
  totalCallsBooked?: number;
  totalDealsClosed?: number;
  averageRevenuePerClient?: number;
}

export function MetricsGrid({
  totalClients,
  growthRate,
  clientCounts,
  percentages,
  successRate,
  churnRate,
  totalMRR = 0,
  totalCallsBooked = 0,
  totalDealsClosed = 0,
  averageRevenuePerClient = 0
}: MetricsGridProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const metrics = [
    {
      title: 'Total Clients',
      value: totalClients,
      icon: <Users />,
      trend: {
        value: growthRate,
        direction: (growthRate >= 0 ? 'up' : 'down') as 'up' | 'down',
        label: 'vs last month'
      },
      variant: 'primary' as const
    },
    {
      title: 'Active Clients',
      value: clientCounts.active,
      icon: <Heart />,
      trend: {
        value: Math.round(percentages.activeClientsPercentage - 85), // Assuming 85% baseline
        direction: (percentages.activeClientsPercentage >= 85 ? 'up' : 'down') as 'up' | 'down',
        label: `${Math.round(percentages.activeClientsPercentage)}% of total`
      },
      variant: 'success' as const
    },
    {
      title: 'Monthly Revenue',
      value: formatCurrency(totalMRR),
      icon: <DollarSign />,
      trend: {
        value: 12, // Placeholder growth
        direction: 'up' as const,
        label: 'vs last month'
      },
      variant: 'primary' as const
    },
    {
      title: 'At Risk Clients',
      value: clientCounts['at-risk'],
      icon: <Target />,
      trend: {
        value: Math.round(percentages.atRiskPercentage),
        direction: (percentages.atRiskPercentage <= 15 ? 'up' : 'down') as 'up' | 'down',
        label: `${Math.round(percentages.atRiskPercentage)}% of total`
      },
      variant: percentages.atRiskPercentage > 20 ? 'warning' as const : 'default' as const
    },
    {
      title: 'New Clients',
      value: clientCounts.new,
      icon: <Calendar />,
      trend: {
        value: Math.round(percentages.newPercentage),
        direction: 'up' as const,
        label: 'this month'
      },
      variant: 'success' as const
    },
    {
      title: 'Calls Booked',
      value: totalCallsBooked,
      icon: <Phone />,
      trend: {
        value: 8, // Placeholder
        direction: 'up' as const,
        label: 'this month'
      },
      variant: 'default' as const
    },
    {
      title: 'Deals Closed',
      value: totalDealsClosed,
      icon: <CheckCircle />,
      trend: {
        value: successRate,
        direction: (successRate >= 75 ? 'up' : 'down') as 'up' | 'down',
        label: `${Math.round(successRate)}% success rate`
      },
      variant: 'success' as const
    },
    {
      title: 'Avg Revenue/Client',
      value: formatCurrency(averageRevenuePerClient),
      icon: <TrendingUp />,
      trend: {
        value: 5, // Placeholder
        direction: 'up' as const,
        label: 'vs last month'
      },
      variant: 'primary' as const
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
      {metrics.slice(0, 4).map((metric, index) => (
        <MetricCard
          key={metric.title}
          title={metric.title}
          value={metric.value}
          icon={metric.icon}
          trend={metric.trend}
          variant={metric.variant}
          className="animate-fade-up"
          style={{ animationDelay: `${index * 100}ms` } as React.CSSProperties}
        />
      ))}
    </div>
  );
}