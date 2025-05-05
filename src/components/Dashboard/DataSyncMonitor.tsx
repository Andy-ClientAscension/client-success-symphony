import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, AlertCircle, CheckCircle2, Settings } from "lucide-react";
import { dataSyncService, useSyncService } from "@/utils/dataSyncService";
import { useAutoSync } from "@/hooks/useAutoSync";
import type { SyncEvent } from "@/utils/dataSyncService";
import { formatDistanceToNow } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RealtimeSyncIndicator } from "@/components/RealtimeSyncIndicator";

export function DataSyncMonitor() {
  const { toast } = useToast();
  const { 
    manualSync, 
    syncStats,
    isSyncing: dataSyncServiceIsSyncing,
    syncLog,
  } = useSyncService();

  // Use the new auto-sync hook
  const { isSyncing: autoSyncIsSyncing, lastSync, triggerSync, configureSync, metrics } = useAutoSync();

  // Combine sync status from both services
  const isSyncing = dataSyncServiceIsSyncing || autoSyncIsSyncing;

  // Start auto-sync by default
  useEffect(() => {
    dataSyncService.startAutoSync();
    return () => {
      dataSyncService.stopAutoSync();
    };
  }, []);

  const handleManualSync = async () => {
    const success = await triggerSync();
    
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
  
  // Format last sync time for display
  const lastSyncTimeDisplay = lastSync
    ? formatDistanceToNow(lastSync, { addSuffix: true })
    : "Never";

  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardContent className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  {getLastEventIcon(lastEvent)}
                  <Badge 
                    variant={isSyncing ? "secondary" : "outline"}
                    className="h-7"
                  >
                    {isSyncing ? "Syncing..." : "Synced"}
                  </Badge>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-1">
                  <p className="font-medium text-sm">Data Sync Status</p>
                  <p className="text-xs">Last successful sync: {lastSyncTimeDisplay}</p>
                  <p className="text-xs">Success rate: {metrics.totalSuccessfulSyncs > 0 
                    ? Math.round((metrics.totalSuccessfulSyncs / (metrics.totalSuccessfulSyncs + metrics.totalFailedSyncs)) * 100)
                    : 0}%</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <span className="text-xs text-muted-foreground hidden md:inline-block">
            {lastSync && `Last sync ${lastSyncTimeDisplay}`}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => configureSync({ frequency: 'real-time' })}>
                Real-time updates
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => configureSync({ frequency: 'interval' })}>
                Periodic updates
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => configureSync({ frequency: 'manual' })}>
                Manual updates only
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleManualSync}
            disabled={isSyncing}
            className="h-7 px-2"
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
