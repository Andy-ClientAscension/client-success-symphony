
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCompanyMetrics } from '@/hooks/use-company-metrics';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign, Users, TrendingUp, TrendingDown } from 'lucide-react';

export function MetricsOverview() {
  const { metrics, isLoading, error } = useCompanyMetrics();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-10 w-full mb-4" />
              <Skeleton className="h-6 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-red-50">
        <CardContent className="p-6">
          <p className="text-red-600">Error loading metrics: {error.message}</p>
        </CardContent>
      </Card>
    );
  }

  if (!metrics) return null;

  const kpiData = [
    {
      title: 'Total Revenue',
      value: `$${metrics.totalMRR.toLocaleString()}`,
      icon: <DollarSign className="h-5 w-5" />,
      trend: metrics.rates.growthRate,
    },
    {
      title: 'Active Clients',
      value: metrics.statusCounts.active.toString(),
      icon: <Users className="h-5 w-5" />,
      trend: metrics.rates.retentionRate,
    },
    {
      title: 'Retention Rate',
      value: `${metrics.rates.retentionRate}%`,
      icon: metrics.rates.retentionRate >= 0 ? 
        <TrendingUp className="h-5 w-5 text-green-500" /> : 
        <TrendingDown className="h-5 w-5 text-red-500" />,
      trend: metrics.rates.retentionRate,
    },
    {
      title: 'Growth Rate',
      value: `${metrics.rates.growthRate}%`,
      icon: metrics.rates.growthRate >= 0 ? 
        <TrendingUp className="h-5 w-5 text-green-500" /> : 
        <TrendingDown className="h-5 w-5 text-red-500" />,
      trend: metrics.rates.growthRate,
    }
  ];

  return (
    <section 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      role="region" 
      aria-label="Company Metrics Overview"
    >
      {kpiData.map((kpi, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
            {kpi.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpi.value}</div>
            <p className={`text-sm ${kpi.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {kpi.trend >= 0 ? '↑' : '↓'} {Math.abs(kpi.trend)}% vs last period
            </p>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
