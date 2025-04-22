
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { dataSyncService, useSyncService } from "@/utils/dataSyncService";
import type { SyncEvent } from "@/utils/dataSyncService";

export function DataSyncMonitor() {
  const { toast } = useToast();
  const { 
    manualSync, 
    syncStats,
    isSyncing,
    syncLog,
  } = useSyncService();

  // Start auto-sync by default
  useEffect(() => {
    dataSyncService.startAutoSync();
    return () => {
      dataSyncService.stopAutoSync();
    };
  }, []);

  const handleManualSync = async () => {
    const success = await manualSync();
    
    if (!success) {
      toast({
        title: "Sync Failed",
        description: "There was an issue synchronizing data. Check console for details.",
        variant: "destructive",
      });
    }
  };

  const getLastEventIcon = (event?: SyncEvent) => {
    if (!event) return null;
    switch (event.type) {
      case 'sync:failed':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'sync:completed':
        return <CheckCircle2 className="h-4 w-4 text-success-500" />;
      case 'sync:started':
        return <RefreshCw className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const lastEvent = syncLog[syncLog.length - 1];

  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardContent className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getLastEventIcon(lastEvent)}
          <Badge 
            variant={isSyncing ? "secondary" : "outline"}
            className="h-7"
          >
            {isSyncing ? "Syncing..." : "Synced"}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleManualSync}
          disabled={isSyncing}
          className="h-7 px-2"
        >
          <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
        </Button>
      </CardContent>
    </Card>
  );
}
