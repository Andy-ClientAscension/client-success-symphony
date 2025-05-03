
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DashboardHeaderProps {
  isRefreshing: boolean;
  handleRefreshData: () => void;
  lastUpdated: Date | null;
  error?: Error | null;
  children?: React.ReactNode;
}

export function DashboardHeader({
  isRefreshing,
  handleRefreshData,
  lastUpdated,
  error,
  children
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Executive Dashboard</h1>
        {lastUpdated && (
          <span className="text-sm text-muted-foreground" aria-live="polite">
            Last updated: {lastUpdated.toLocaleString()}
          </span>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        {children}
      
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefreshData}
          disabled={isRefreshing}
          aria-label={isRefreshing ? "Refreshing…" : "Refresh dashboard data"}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
            aria-hidden="true"
          />
          {isRefreshing ? "Refreshing…" : "Refresh"}
        </Button>
      </div>
      
      {error && (
        <Alert variant="destructive" role="alert">
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
