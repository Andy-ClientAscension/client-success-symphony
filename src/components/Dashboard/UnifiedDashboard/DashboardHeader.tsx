
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Clock } from "lucide-react";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { formatDistanceToNow } from "date-fns";

interface DashboardHeaderProps {
  isRefreshing: boolean;
  handleRefreshData: () => void;
}

export function DashboardHeader({ isRefreshing, handleRefreshData }: DashboardHeaderProps) {
  const { dataUpdatedAt } = useDashboardData();
  
  // Only try to format the date if dataUpdatedAt is valid
  const lastUpdated = dataUpdatedAt && dataUpdatedAt > 0 
    ? formatDistanceToNow(new Date(dataUpdatedAt), { addSuffix: true }) 
    : 'never';

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <Clock className="h-4 w-4" />
        <span>Last updated: {lastUpdated}</span>
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
