
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ArrowUp, 
  ArrowDown, 
  Users, 
  DollarSign, 
  PhoneCall, 
  Calendar,
  AlertTriangle,
  TrendingUp,
  BarChart,
  Plus,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { EmptyState } from "@/components/EmptyState";
import { ResponsiveGrid } from "./Shared/ResponsiveGrid";
import { Badge } from "@/components/ui/badge";

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

  // Organize data into primary and secondary metrics
  const primaryMetrics = [
    {
      title: "Monthly Revenue",
      value: `$${metrics?.totalMRR || 0}`,
      trend: { value: "8%", direction: "up" },
      icon: <DollarSign className="h-8 w-8 text-brand-500" />,
      ariaLabel: "Monthly recurring revenue",
      isPrimary: true
    },
    {
      title: "Total Clients",
      value: totalClients,
      trend: { value: "5%", direction: "up" },
      icon: <Users className="h-8 w-8 text-brand-500" />,
      ariaLabel: "Total number of clients",
      isPrimary: true
    },
  ];

  const secondaryMetrics = [
    {
      title: "Success Rate",
      value: `${successRate}%`,
      trend: { value: "3%", direction: "up" },
      icon: <TrendingUp className="h-8 w-8 text-brand-500/70" />,
      ariaLabel: "Client success rate"
    },
    {
      title: "Calls Booked",
      value: metrics?.totalCallsBooked || 0,
      trend: { value: "12%", direction: "up" },
      icon: <PhoneCall className="h-8 w-8 text-brand-500/70" />,
      ariaLabel: "Total calls booked"
    },
    {
      title: "Deals Closed",
      value: metrics?.totalDealsClosed || 0,
      trend: { value: "-3%", direction: "down" },
      icon: <Calendar className="h-8 w-8 text-brand-500/70" />,
      ariaLabel: "Total deals closed"
    },
    {
      title: "Retention Rate",
      value: `${retentionRate}%`,
      trend: { value: "2%", direction: "up" },
      icon: <BarChart className="h-8 w-8 text-brand-500/70" />,
      ariaLabel: "Client retention rate"
    }
  ];

  if (!metrics && !clientCounts) {
    return (
      <Collapsible
        open={isExpanded}
        onOpenChange={setIsExpanded}
        className="w-full"
      >
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
      
      <CollapsibleContent forceMount open={isExpanded}>
        {/* Primary metrics - larger, more prominent */}
        <ResponsiveGrid 
          cols={{ xs: 1, sm: 2 }} 
          gap="md" 
          className="w-full mb-6" 
          role="region"
          aria-label="Primary metrics"
        >
          {primaryMetrics.map((item, index) => (
            <Card 
              key={`primary-${index}`} 
              className="border-border/30 shadow-md hover:shadow-lg transition-all duration-200 bg-gradient-to-b from-white to-gray-50 dark:from-gray-800/90 dark:to-gray-900/80"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p 
                      className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1" 
                      id={`metric-${index}-label`}
                    >
                      {item.title}
                    </p>
                    <h3 
                      className="text-3xl font-bold text-gray-900 dark:text-white"
                      aria-labelledby={`metric-${index}-label`}
                      tabIndex={0}
                    >
                      {item.value}
                    </h3>
                  </div>
                  <div className="bg-brand-100 dark:bg-brand-800/50 p-4 rounded-full">
                    {item.icon}
                  </div>
                </div>
                <Separator className="my-3 bg-border/30" />
                <div 
                  className={`text-sm flex items-center font-medium ${
                    item.trend.direction === "up" 
                      ? "text-emerald-600 dark:text-emerald-400" 
                      : "text-brand-500 dark:text-brand-400"
                  }`}
                  aria-label={`${item.trend.value} ${item.trend.direction === "up" ? "increase" : "decrease"} from last month`}
                >
                  {item.trend.direction === "up" ? (
                    <ArrowUp className="h-4 w-4 mr-1" aria-hidden="true" />
                  ) : (
                    <ArrowDown className="h-4 w-4 mr-1" aria-hidden="true" />
                  )}
                  <span>{item.trend.value} from last month</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </ResponsiveGrid>

        {/* Secondary metrics - smaller cards */}
        <ResponsiveGrid 
          cols={{ xs: 2, sm: 2, md: 4 }} 
          gap="md" 
          className="w-full" 
          role="region"
          aria-label="Secondary metrics"
        >
          {secondaryMetrics.map((item, index) => (
            <Card 
              key={`secondary-${index}`} 
              className="border-border/30 shadow-sm hover:shadow-md transition-all duration-200 bg-white dark:bg-gray-800/70"
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p 
                    className="text-xs font-medium text-gray-600 dark:text-gray-300" 
                    id={`metric-sec-${index}-label`}
                  >
                    {item.title}
                  </p>
                  <div className="bg-gray-100 dark:bg-gray-700/40 p-1.5 rounded-md">
                    {item.icon}
                  </div>
                </div>
                <h3 
                  className="text-xl font-bold text-gray-900 dark:text-white mb-2"
                  aria-labelledby={`metric-sec-${index}-label`}
                  tabIndex={0}
                >
                  {item.value}
                </h3>
                <div 
                  className={`text-xs flex items-center font-medium ${
                    item.trend.direction === "up" 
                      ? "text-emerald-600 dark:text-emerald-400" 
                      : "text-red-500 dark:text-red-400"
                  }`}
                >
                  {item.trend.direction === "up" ? (
                    <ArrowUp className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDown className="h-3 w-3 mr-1" />
                  )}
                  <span>{item.trend.value}</span>
                </div>
              </CardContent>
            </Card>
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
