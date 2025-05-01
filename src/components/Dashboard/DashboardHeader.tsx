
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface DashboardHeaderProps {
  title: string;
  lastUpdated: Date;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function DashboardHeader({
  title,
  lastUpdated,
  onRefresh,
  isRefreshing = false
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">
          Last updated {formatDistanceToNow(lastUpdated, { addSuffix: true })}
        </p>
      </div>
      
      {onRefresh && (
        <Button 
          onClick={onRefresh} 
          variant="outline" 
          size="sm"
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? "Refreshing..." : "Refresh Data"}
        </Button>
      )}
    </div>
  );
}
