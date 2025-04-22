
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardHeaderProps {
  isRefreshing: boolean;
  handleRefreshData: () => void;
  lastUpdated?: number;
}

export function DashboardHeader({ 
  isRefreshing, 
  handleRefreshData,
  lastUpdated 
}: DashboardHeaderProps) {
  const lastUpdatedText = lastUpdated 
    ? formatDistanceToNow(new Date(lastUpdated), { addSuffix: true }) 
    : 'never';

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Clock className="h-4 w-4" />
        {isRefreshing ? (
          <Skeleton className="h-4 w-32" />
        ) : (
          <span>Last updated: {lastUpdatedText}</span>
        )}
      </div>
      <Button 
        variant="outline" 
        size="sm"
        onClick={handleRefreshData}
        disabled={isRefreshing}
        className="h-8"
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
        {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
      </Button>
    </div>
  );
}
