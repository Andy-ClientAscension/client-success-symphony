
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Users, DollarSign, PhoneCall, Calendar, AlertTriangle } from "lucide-react";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Button } from "@/components/ui/button";

// Error fallback component
function MetricsError({ error, resetErrorBoundary }: { error: Error, resetErrorBoundary: () => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="col-span-full bg-red-50 dark:bg-red-900/20">
        <CardContent className="p-6">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mr-3 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-800 dark:text-red-300">Error loading metrics</h3>
              <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                {error.message || "Failed to load dashboard metrics"}
              </p>
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
    throw error; // This will be caught by the ErrorBoundary
  }

  const totalClients = clientCounts 
    ? Object.values(clientCounts).reduce((sum, count) => sum + count, 0) 
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Clients</p>
              <h3 className="text-2xl font-semibold">{totalClients}</h3>
            </div>
            <Users className="h-8 w-8 text-primary/40" />
          </div>
          <div className="text-xs text-green-600 flex items-center mt-2">
            <ArrowUp className="h-3 w-3 mr-1" />
            <span>5% from last month</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Monthly Revenue</p>
              <h3 className="text-2xl font-semibold">${metrics?.totalMRR || 0}</h3>
            </div>
            <DollarSign className="h-8 w-8 text-primary/40" />
          </div>
          <div className="text-xs text-green-600 flex items-center mt-2">
            <ArrowUp className="h-3 w-3 mr-1" />
            <span>8% from last month</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Calls Booked</p>
              <h3 className="text-2xl font-semibold">{metrics?.totalCallsBooked || 0}</h3>
            </div>
            <PhoneCall className="h-8 w-8 text-primary/40" />
          </div>
          <div className="text-xs text-green-600 flex items-center mt-2">
            <ArrowUp className="h-3 w-3 mr-1" />
            <span>12% from last month</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Deals Closed</p>
              <h3 className="text-2xl font-semibold">{metrics?.totalDealsClosed || 0}</h3>
            </div>
            <Calendar className="h-8 w-8 text-primary/40" />
          </div>
          <div className="text-xs text-amber-600 flex items-center mt-2">
            <ArrowDown className="h-3 w-3 mr-1" />
            <span>3% from last month</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Wrap the component with ErrorBoundary
export function MetricsCards() {
  return (
    <ErrorBoundary
      fallback={
        // The key fix: Pass JSX directly rather than a function
        <MetricsError 
          error={new Error("An error occurred loading metrics")} 
          resetErrorBoundary={() => window.location.reload()} 
        />
      }
      onReset={() => {
        // This ensures the error boundary's reset function will work
        console.log("Resetting error boundary");
      }}
    >
      <MetricsCardsContent />
    </ErrorBoundary>
  );
}
