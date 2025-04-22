
// Fixed and optimized DashboardHeader with ARIA support and proper prop typing

import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Clock, Loader } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { focusRingClasses } from "@/lib/accessibility";

interface DashboardHeaderProps {
  isRefreshing: boolean;
  handleRefreshData: () => void;
  lastUpdated?: Date | number | null;
  error?: Error | null;
  loadingText?: string;
  children?: React.ReactNode;
}

export function DashboardHeader({
  isRefreshing,
  handleRefreshData,
  lastUpdated,
  error,
  loadingText,
  children
}: DashboardHeaderProps) {
  const lastUpdatedText = lastUpdated
    ? formatDistanceToNow(new Date(lastUpdated), { addSuffix: true })
    : "never";

  return (
    <header
      className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-6 py-1 px-0 transition-colors bg-background border-b border-border/40"
      aria-label="Dashboard header"
    >
      <div className="flex items-center space-x-3 text-sm text-muted-foreground">
        <Clock className="h-4 w-4" aria-hidden="true" />
        {isRefreshing ? (
          <span className="flex items-center gap-1" aria-live="polite" role="status">
            <Loader className="h-4 w-4 animate-spin text-primary" aria-hidden="true" />
            <span>{loadingText || "Refreshing…"} </span>
          </span>
        ) : (
          <span>
            Last updated:{" "}
            <span className="font-semibold text-foreground" aria-live="polite">
              {lastUpdatedText}
            </span>
          </span>
        )}
        {error && (
          <span
            className="ml-4 text-sm text-red-600 font-semibold"
            role="alert"
            aria-live="assertive"
          >
            {error.message}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefreshData}
          disabled={isRefreshing}
          className={`h-8 px-3 group transition-colors ${focusRingClasses}`}
          aria-label={isRefreshing ? "Refreshing…" : "Refresh dashboard data"}
        >
          {isRefreshing ? (
            <Loader className="h-4 w-4 mr-2 animate-spin text-primary" aria-hidden="true" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2 group-hover:text-primary group-focus-visible:text-primary transition-colors" aria-hidden="true" />
          )}
          <span>{isRefreshing ? "Refreshing…" : "Refresh Data"}</span>
        </Button>
        {children}
      </div>
    </header>
  );
}
