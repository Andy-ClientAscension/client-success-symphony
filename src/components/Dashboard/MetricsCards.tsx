
import React from "react";
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
  BarChart 
} from "lucide-react";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

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

  if (error) {
    throw error;
  }

  const totalClients = clientCounts 
    ? Object.values(clientCounts).reduce((sum, count) => sum + count, 0) 
    : 0;

  const successRate = 85;
  const retentionRate = 92;

  const data = [
    {
      title: "Total Clients",
      value: totalClients,
      trend: { value: "5%", direction: "up" },
      icon: <Users className="h-8 w-8 text-primary/40" />,
      ariaLabel: "Total number of clients"
    },
    {
      title: "Monthly Revenue",
      value: `$${metrics?.totalMRR || 0}`,
      trend: { value: "8%", direction: "up" },
      icon: <DollarSign className="h-8 w-8 text-primary/40" />,
      ariaLabel: "Monthly recurring revenue"
    },
    {
      title: "Success Rate",
      value: `${successRate}%`,
      trend: { value: "3%", direction: "up" },
      icon: <TrendingUp className="h-8 w-8 text-primary/40" />,
      ariaLabel: "Client success rate"
    },
    {
      title: "Calls Booked",
      value: metrics?.totalCallsBooked || 0,
      trend: { value: "12%", direction: "up" },
      icon: <PhoneCall className="h-8 w-8 text-primary/40" />,
      ariaLabel: "Total calls booked"
    },
    {
      title: "Deals Closed",
      value: metrics?.totalDealsClosed || 0,
      trend: { value: "-3%", direction: "down" },
      icon: <Calendar className="h-8 w-8 text-primary/40" />,
      ariaLabel: "Total deals closed"
    },
    {
      title: "Retention Rate",
      value: `${retentionRate}%`,
      trend: { value: "2%", direction: "up" },
      icon: <BarChart className="h-8 w-8 text-primary/40" />,
      ariaLabel: "Client retention rate"
    }
  ];

  return (
    <div 
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6" 
      role="region"
      aria-label="Key performance indicators"
    >
      {data.map((item, index) => (
        <Card 
          key={index} 
          className="bg-white dark:bg-gray-800/50 shadow-sm hover:shadow transition-shadow duration-200"
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p 
                  className="text-sm text-muted-foreground mb-1" 
                  id={`metric-${index}-label`}
                >
                  {item.title}
                </p>
                <h3 
                  className="text-2xl font-semibold"
                  aria-labelledby={`metric-${index}-label`}
                  tabIndex={0}
                >
                  {item.value}
                </h3>
              </div>
              {item.icon}
            </div>
            <Separator className="my-3" />
            <div 
              className={`text-xs flex items-center ${
                item.trend.direction === "up" 
                  ? "text-green-600 dark:text-green-400" 
                  : "text-amber-600 dark:text-amber-400"
              }`}
              aria-label={`${item.trend.value} ${item.trend.direction === "up" ? "increase" : "decrease"} from last month`}
            >
              {item.trend.direction === "up" ? (
                <ArrowUp className="h-3 w-3 mr-1" aria-hidden="true" />
              ) : (
                <ArrowDown className="h-3 w-3 mr-1" aria-hidden="true" />
              )}
              <span>{item.trend.value} from last month</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function MetricsCards() {
  return (
    <ErrorBoundary
      fallback={MetricsError}
    >
      <MetricsCardsContent />
    </ErrorBoundary>
  );
}
