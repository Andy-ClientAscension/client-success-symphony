
import { RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import type { SyncedDataResult } from "@/hooks/useSyncedData";

interface SyncStatusProps {
  status: Pick<SyncedDataResult, "lastUpdated" | "isRefreshing">;
}

export function SyncStatus({ status }: SyncStatusProps) {
  const queryClient = useQueryClient();
  
  const handleManualSync = () => {
    queryClient.invalidateQueries({ queryKey: ['synced-data'] });
  };
  
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleManualSync}
        disabled={status.isRefreshing}
        className="h-8 px-2"
      >
        <RefreshCw 
          className={`h-4 w-4 mr-2 ${status.isRefreshing ? 'animate-spin' : ''}`}
        />
        {status.isRefreshing ? 'Syncing...' : 'Sync Now'}
      </Button>
      {status.lastUpdated && (
        <span>
          Last updated: {format(status.lastUpdated, 'h:mm a')}
        </span>
      )}
    </div>
  );
}
