
import React from 'react';
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ResponsiveGrid } from "../Shared/ResponsiveGrid";
import { MetricCard } from "@/components/Dashboard/Metrics/MetricCard";
import { Users, Heart, DollarSign, Gauge } from "lucide-react";
import { formatCurrency } from "@/utils/analyticsUtils";
import type API from "@/types/api";

interface SSCMetrics {
  studentCount: number;
  retentionRate: number;
  revenue: number;
  healthScore: number;
}

interface SSCPerformanceMetricsProps {
  csm: string;
  clients: API.Client[];
}

export function SSCPerformanceMetrics({ csm, clients }: SSCPerformanceMetricsProps) {
  // Filter clients for this CSM
  const csmClients = clients.filter(client => client.csm === csm);
  
  const metrics: SSCMetrics = {
    studentCount: csmClients.length,
    retentionRate: Math.round((csmClients.filter(c => c.status === 'active').length / Math.max(csmClients.length, 1)) * 100),
    revenue: csmClients.reduce((sum, client) => sum + (client.mrr || 0), 0),
    healthScore: Math.round(csmClients.reduce((sum, client) => sum + (client.npsScore || 0), 0) / Math.max(csmClients.length, 1))
  };

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Performance Metrics: {csm}</h3>
      <ScrollArea className="h-[200px]">
        <ResponsiveGrid
          cols={{ xs: 1, sm: 2, md: 2, lg: 4 }}
          gap="md"
          className="p-2"
        >
          <MetricCard
            title="Active Students"
            value={metrics.studentCount}
            icon={<Users className="h-4 w-4" />}
            trend={{
              value: 10,
              direction: "up",
              label: "vs last month"
            }}
          />
          <MetricCard
            title="Retention Rate"
            value={`${metrics.retentionRate}%`}
            icon={<Heart className="h-4 w-4" />}
            trend={{
              value: 5,
              direction: "up",
              label: "vs last month"
            }}
          />
          <MetricCard
            title="Revenue Managed"
            value={formatCurrency(metrics.revenue)}
            icon={<DollarSign className="h-4 w-4" />}
            trend={{
              value: 8,
              direction: "up",
              label: "vs last month"
            }}
          />
          <MetricCard
            title="Health Score"
            value={`${metrics.healthScore}%`}
            icon={<Gauge className="h-4 w-4" />}
            trend={{
              value: 3,
              direction: "up",
              label: "vs last month"
            }}
          />
        </ResponsiveGrid>
      </ScrollArea>
    </Card>
  );
}
