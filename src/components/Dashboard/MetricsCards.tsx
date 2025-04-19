import React, { useState } from "react";
import { AlertTriangle, Users, DollarSign, PhoneCall, Calendar, TrendingUp, BarChart, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { EmptyState } from "@/components/EmptyState";
import { ResponsiveGrid } from "./Shared/ResponsiveGrid";
import { HeroMetric } from "./Metrics/HeroMetric";

function MetricsError({ error, resetErrorBoundary }: { error: Error, resetErrorBoundary: () => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="col-span-full bg-red-50 dark:bg-red-900/20">
        <CardContent className="p-6">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mr-3 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-800 dark:text-red-300">Error loading metrics</h3>
              <p className="text-sm text-red-700 dark:text-red-400 mt-1">{error.message}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={resetErrorBoundary}
                className="mt-3 text-red-700 hover:text-red-800 border-red-300 hover:border-red-400"
              >
                Retry
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function MetricsCardsContent() {
  const { metrics, clientCounts, error } = useDashboardData();
  const [isExpanded, setIsExpanded] = useState(true);

  if (error) {
    throw error;
  }

  const totalClients = clientCounts 
    ? Object.values(clientCounts).reduce((sum, count) => sum + count, 0) 
    : 0;

  const successRate = 85;
  const retentionRate = 92;

  const primaryMetrics = [
    {
      title: "Monthly Revenue",
      value: `$${metrics?.totalMRR || 0}`,
      trend: { value: 8, direction: "up" as const, label: "from last month" },
      icon: <DollarSign className="h-8 w-8 text-brand-500" />,
      ariaLabel: "Monthly recurring revenue"
    },
    {
      title: "Total Clients",
      value: totalClients,
      trend: { value: 5, direction: "up" as const, label: "from last month" },
      icon: <Users className="h-8 w-8 text-brand-500" />,
      ariaLabel: "Total number of clients"
    }
  ];

  const secondaryMetrics = [
    {
      title: "Success Rate",
      value: `${successRate}%`,
      trend: { value: 3, direction: "up" as const },
      icon: <TrendingUp className="h-6 w-6 text-brand-500/70" />
    },
    {
      title: "Calls Booked",
      value: metrics?.totalCallsBooked || 0,
      trend: { value: 12, direction: "up" as const },
      icon: <PhoneCall className="h-6 w-6 text-brand-500/70" />
    },
    {
      title: "Deals Closed",
      value: metrics?.totalDealsClosed || 0,
      trend: { value: 3, direction: "down" as const },
      icon: <Calendar className="h-6 w-6 text-brand-500/70" />
    },
    {
      title: "Retention Rate",
      value: `${retentionRate}%`,
      trend: { value: 2, direction: "up" as const },
      icon: <BarChart className="h-6 w-6 text-brand-500/70" />
    }
  ];

  if (!metrics && !clientCounts) {
    return (
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded} className="w-full">
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            <span>Metrics Overview</span>
            <Plus className="h-4 w-4 shrink-0 transition-transform duration-200" />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4">
          <EmptyState
            title="No Metrics Available"
            message="Start tracking your performance by adding client data and metrics."
            icon={<BarChart className="h-8 w-8 text-muted-foreground" />}
            action={{
              label: "Add Data",
              onClick: () => window.location.href = "/clients/add"
            }}
          />
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Key Performance Indicators</h2>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? (
              <><ChevronUp className="h-4 w-4 mr-1" /> Collapse</>
            ) : (
              <><ChevronDown className="h-4 w-4 mr-1" /> Expand</>
            )}
          </Button>
        </CollapsibleTrigger>
      </div>
      
      <CollapsibleContent forceMount>
        <ResponsiveGrid 
          cols={{ xs: 1, sm: 2 }} 
          gap="md" 
          className="w-full mb-6" 
          role="region"
          aria-label="Primary performance metrics"
        >
          {primaryMetrics.map((metric, index) => (
            <HeroMetric
              key={`primary-${index}`}
              size="lg"
              {...metric}
            />
          ))}
        </ResponsiveGrid>

        <ResponsiveGrid 
          cols={{ xs: 2, sm: 2, md: 4 }} 
          gap="md" 
          className="w-full" 
          role="region"
          aria-label="Secondary performance metrics"
        >
          {secondaryMetrics.map((metric, index) => (
            <HeroMetric
              key={`secondary-${index}`}
              size="sm"
              {...metric}
            />
          ))}
        </ResponsiveGrid>
      </CollapsibleContent>
    </div>
  );
}

export function MetricsCards() {
  return (
    <Collapsible defaultOpen={true} className="w-full">
      <ErrorBoundary
        fallback={<MetricsError error={new Error("Failed to load metrics")} resetErrorBoundary={() => window.location.reload()} />}
      >
        <MetricsCardsContent />
      </ErrorBoundary>
    </Collapsible>
  );
}
