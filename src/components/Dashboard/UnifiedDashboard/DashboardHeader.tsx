
import React from "react";
import { Button } from "@/components/ui/button";
import { refresh-cw, Clock, loader } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardHeaderProps {
  isRefreshing: boolean;
  handleRefreshData: () => void;
  lastUpdated?: Date | number | null;
}

export function DashboardHeader({
  isRefreshing,
  handleRefreshData,
  lastUpdated,
}: DashboardHeaderProps) {
  const lastUpdatedText = lastUpdated
    ? formatDistanceToNow(new Date(lastUpdated), { addSuffix: true })
    : "never";

  return (
    <header
      className="flex items-center justify-between mb-6 py-1 px-0 sm:px-0 transition-colors bg-background border-b border-border/40"
      aria-label="Dashboard header"
    >
      <div className="flex items-center space-x-3 text-sm text-muted-foreground">
        <Clock className="h-4 w-4" aria-hidden />
        {isRefreshing ? (
          <span className="flex items-center gap-1">
            <loader className="h-4 w-4 animate-spin text-primary" aria-label="Loading" />
            <span>Refreshing…</span>
          </span>
        ) : (
          <span>
            Last updated: <span className="font-semibold text-foreground">{lastUpdatedText}</span>
          </span>
        )}
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleRefreshData}
        disabled={isRefreshing}
        className="h-8 px-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-colors"
        aria-label="Refresh dashboard data"
      >
        {isRefreshing ? (
          <loader className="h-4 w-4 mr-2 animate-spin text-primary" aria-hidden />
        ) : (
          <refresh-cw className="h-4 w-4 mr-2 group-hover:text-primary group-focus-visible:text-primary transition-colors" aria-hidden />
        )}
        <span>{isRefreshing ? "Refreshing…" : "Refresh Data"}</span>
      </Button>
    </header>
  );
}

