
import React from "react";
import { RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/badge";
import { useQueryClient } from "@tanstack/react-query";
import { DATA_KEYS } from "@/hooks/useSyncedDashboard";
import { useToast } from "@/hooks/use-toast";

interface SyncStatusProps {
  lastUpdated: Date | null;
  isRefreshing: boolean;
  onManualSync?: () => void;
}

export function SyncStatus({ lastUpdated, isRefreshing, onManualSync }: SyncStatusProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const handleManualSync = () => {
    if (onManualSync) {
      onManualSync();
    } else {
      // Default implementation if no custom handler is provided
      queryClient.invalidateQueries({ queryKey: [DATA_KEYS.CLIENTS] });
      queryClient.invalidateQueries({ queryKey: [DATA_KEYS.CLIENT_COUNTS] });
      queryClient.invalidateQueries({ queryKey: [DATA_KEYS.NPS_DATA] });
      queryClient.invalidateQueries({ queryKey: [DATA_KEYS.CHURN_DATA] });
      
      toast({
        title: "Syncing data",
        description: "Refreshing dashboard data...",
      });
    }
  };
  
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleManualSync}
        disabled={isRefreshing}
        className="h-8 px-2"
      >
        <RefreshCw 
          className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`}
        />
        {isRefreshing ? 'Syncing...' : 'Sync Now'}
      </Button>
      {lastUpdated && (
        <span>
          Last updated: {format(lastUpdated, 'h:mm a')}
        </span>
      )}
    </div>
  );
}
