
import { useState } from "react";
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Data Synchronization</span>
          {isSyncing && <RefreshCw className="h-4 w-4 animate-spin ml-2" />}
        </CardTitle>
        <CardDescription>
          Manage how dashboard data is synchronized across all sections
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="auto-sync">Automatic Synchronization</Label>
            <p className="text-sm text-muted-foreground">
              Keep all dashboard data in sync automatically
            </p>
          </div>
          <Switch
            id="auto-sync"
            checked={autoSyncEnabled}
            onCheckedChange={handleToggleAutoSync}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="sync-interval">Sync Interval (seconds)</Label>
          <div className="flex space-x-2">
            <Input
              id="sync-interval"
              type="number"
              min="5"
              max="300"
              value={syncInterval}
              onChange={(e) => setSyncInterval(Number(e.target.value))}
              onBlur={() => handleIntervalChange(syncInterval)}
              disabled={!autoSyncEnabled}
            />
            <Button 
              variant="outline" 
              onClick={() => handleIntervalChange(syncInterval)}
              disabled={!autoSyncEnabled}
            >
              Apply
            </Button>
          </div>
        </div>
        
        <Button 
          onClick={handleManualSync} 
          disabled={isSyncing}
          className="w-full"
        >
          {isSyncing ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Syncing...
            </>
          ) : (
            "Sync Now"
          )}
        </Button>
        
        <div className="pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Sync Statistics</h3>
            <Button 
              variant="ghost" 
              onClick={() => setShowLog(!showLog)} 
              className="h-8 px-2"
            >
              {showLog ? "Hide Log" : "Show Log"}
            </Button>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mt-2">
            <div className="bg-background rounded border p-2 text-center">
              <div className="text-xs text-muted-foreground">Last Sync</div>
              <div className="text-sm font-medium">
                {syncStats.lastSync ? new Date(syncStats.lastSync).toLocaleTimeString() : 'Never'}
              </div>
            </div>
            <div className="bg-background rounded border p-2 text-center">
              <div className="text-xs text-muted-foreground">Total Events</div>
              <div className="text-sm font-medium">{syncStats.totalEvents}</div>
            </div>
            <div className="bg-background rounded border p-2 text-center">
              <div className="text-xs text-muted-foreground">Failures</div>
              <div className="text-sm font-medium">{syncStats.failureCount}</div>
            </div>
          </div>
        </div>
        
        {showLog && (
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">Event Log</h3>
              <Button 
                variant="ghost" 
                onClick={clearSyncLog} 
                className="h-8 px-2"
              >
                Clear
              </Button>
            </div>
            <ScrollArea className="h-[200px] w-full rounded border">
              <div className="p-4 space-y-2">
                {syncLog.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No sync events logged yet
                  </p>
                ) : (
                  [...syncLog].reverse().map((event, index) => (
                    <div key={index} className="flex items-start space-x-2 text-sm">
                      <div className="pt-0.5">
                        {getEventIcon(event)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <Badge variant="outline" className="mr-2">
                            {event.type.replace('sync:', '').replace(':', ' ')}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatTimestamp(event.timestamp)}
                          </span>
                        </div>
                        {event.details && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {event.details.key || event.details.mode || 
                             (event.details.error ? `Error: ${event.details.error}` : '')}
                          </p>
                        )}
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
