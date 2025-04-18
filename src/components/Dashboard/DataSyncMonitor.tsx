import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { dataSyncService, useSyncService, SyncEvent } from "@/utils/dataSyncService";
import { APIConnectionDialog } from "./APIConnectionDialog";

export function DataSyncMonitor() {
  const { toast } = useToast();
  const { 
    startAutoSync, 
    stopAutoSync, 
    manualSync, 
    setInterval, // This now maps to setSyncInterval internally
    syncStats, 
    isSyncing,
    syncLog,
    clearSyncLog
  } = useSyncService();
  
  const [syncInterval, setSyncInterval] = useState(30);
  const [showLog, setShowLog] = useState(false);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(false);
  const [visibleLogItems, setVisibleLogItems] = useState<SyncEvent[]>([]);
  const [apiDialogOpen, setApiDialogOpen] = useState(false);
  const MAX_VISIBLE_LOG_ITEMS = 50; // Only show most recent 50 events

  // Update visible log items when the full log changes
  useEffect(() => {
    if (syncLog.length > 0) {
      // Take only the most recent MAX_VISIBLE_LOG_ITEMS
      setVisibleLogItems([...syncLog].reverse().slice(0, MAX_VISIBLE_LOG_ITEMS));
    } else {
      setVisibleLogItems([]);
    }
  }, [syncLog]);

  const handleToggleAutoSync = (enabled: boolean) => {
    if (enabled) {
      startAutoSync();
      toast({
        title: "Auto-Sync Enabled",
        description: `Dashboard will automatically sync every ${syncInterval} seconds`,
      });
    } else {
      stopAutoSync();
      toast({
        title: "Auto-Sync Disabled",
        description: "Automatic synchronization has been turned off",
      });
    }
    setAutoSyncEnabled(enabled);
  };

  const handleManualSync = async () => {
    toast({
      title: "Sync Started",
      description: "Manually synchronizing dashboard data...",
    });
    
    const success = await manualSync();
    
    if (success) {
      toast({
        title: "Sync Complete",
        description: "Dashboard data successfully synchronized",
      });
    } else {
      toast({
        title: "Sync Failed",
        description: "There was an issue synchronizing data. Check console for details.",
        variant: "destructive",
      });
    }
  };

  const handleIntervalChange = (value: number) => {
    if (value < 5) value = 5;
    if (value > 300) value = 300;
    
    setSyncInterval(value);
    setInterval(value * 1000);
    
    if (autoSyncEnabled) {
      toast({
        title: "Sync Interval Updated",
        description: `Auto-sync will now run every ${value} seconds`,
      });
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString();
    } catch (e) {
      return timestamp;
    }
  };
  
  const getEventIcon = (event: SyncEvent) => {
    switch (event.type) {
      case 'sync:failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'sync:completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'sync:started':
        return <RefreshCw className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between text-muted-foreground">
          <span>Sync Status</span>
          {isSyncing && <RefreshCw className="h-3 w-3 animate-spin ml-2" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <div className="space-y-0.5">
            <Label htmlFor="auto-sync" className="text-muted-foreground">Auto-Sync</Label>
          </div>
          <Switch
            id="auto-sync"
            checked={autoSyncEnabled}
            onCheckedChange={handleToggleAutoSync}
          />
        </div>
        
        {autoSyncEnabled && (
          <div className="space-y-2">
            <Label htmlFor="sync-interval" className="text-sm text-muted-foreground">Interval (s)</Label>
            <div className="flex gap-2">
              <Input
                id="sync-interval"
                type="number"
                min="5"
                max="300"
                value={syncInterval}
                onChange={(e) => setSyncInterval(Number(e.target.value))}
                onBlur={() => handleIntervalChange(syncInterval)}
                className="h-8 text-sm"
              />
              <Button 
                variant="outline"
                size="sm"
                onClick={() => handleIntervalChange(syncInterval)}
                className="h-8"
              >
                Apply
              </Button>
            </div>
          </div>
        )}
        
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handleManualSync} 
          disabled={isSyncing}
          className="w-full h-8 text-sm"
        >
          {isSyncing ? (
            <>
              <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
              Syncing...
            </>
          ) : (
            "Sync Now"
          )}
        </Button>
        
        {showLog && (
          <div className="pt-2 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <h3 className="font-medium text-muted-foreground">Recent Events</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowLog(false)}
                className="h-6 px-2 text-xs"
              >
                Hide
              </Button>
            </div>
            
            <ScrollArea className="h-[120px] w-full rounded border border-muted/20">
              <div className="p-2 space-y-1">
                {visibleLogItems.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    No sync events logged
                  </p>
                ) : (
                  visibleLogItems.slice(0, 5).map((event, index) => (
                    <div key={index} className="flex items-start space-x-2 text-xs">
                      <div className="pt-0.5">
                        {getEventIcon(event)}
                      </div>
                      <div className="flex-1 text-muted-foreground">
                        <div className="flex items-center">
                          <Badge 
                            variant="outline" 
                            className="mr-2 text-[10px] px-1"
                          >
                            {event.type.replace('sync:', '').replace(':', ' ')}
                          </Badge>
                          <span className="text-[10px]">
                            {formatTimestamp(event.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        )}
        
      </CardContent>
    </Card>
  );
}
