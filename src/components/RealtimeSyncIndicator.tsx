
import React, { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Wifi, WifiOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DATA_KEYS } from "@/hooks/useDashboardData";

// Mock WebSocket setup (since we don't have actual WebSocket endpoint)
// In a real app, replace with actual WebSocket connection
const setupMockWebSocket = (
  onConnect: () => void,
  onDisconnect: () => void,
  onMessage: (data: any) => void
) => {
  console.log("Setting up mock real-time connection...");
  
  // Simulate connection established
  setTimeout(onConnect, 1000);
  
  // Simulate periodic updates
  const interval = setInterval(() => {
    onMessage({ type: 'update', timestamp: new Date().toISOString() });
  }, 45000); // Every 45 seconds
  
  // Return cleanup function
  return () => {
    clearInterval(interval);
    onDisconnect();
  };
};

export function RealtimeSyncIndicator() {
  const [connected, setConnected] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Handle real-time data updates
  const handleDataUpdate = (data: any) => {
    if (data.type === 'update') {
      setSyncing(true);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [DATA_KEYS.CLIENTS] });
      queryClient.invalidateQueries({ queryKey: [DATA_KEYS.CLIENT_COUNTS] });
      
      // Update the last sync time
      setLastSync(new Date());
      
      // Reset syncing state after a delay
      setTimeout(() => setSyncing(false), 1000);
      
      // Show a toast notification
      toast({
        title: "Real-time update received",
        description: "Dashboard data has been refreshed.",
      });
    }
  };

  // Set up WebSocket connection
  useEffect(() => {
    const cleanup = setupMockWebSocket(
      () => setConnected(true),
      () => setConnected(false),
      handleDataUpdate
    );

    return cleanup;
  }, [queryClient]);

  // Manually refresh data
  const handleManualSync = () => {
    setSyncing(true);
    
    // Invalidate all queries to refresh data
    queryClient.invalidateQueries({ queryKey: [DATA_KEYS.CLIENTS] });
    queryClient.invalidateQueries({ queryKey: [DATA_KEYS.CLIENT_COUNTS] });
    queryClient.invalidateQueries({ queryKey: [DATA_KEYS.NPS_DATA] });
    queryClient.invalidateQueries({ queryKey: [DATA_KEYS.CHURN_DATA] });
    
    // Show a toast notification
    toast({
      title: "Manual sync initiated",
      description: "Refreshing all dashboard data...",
    });
    
    // Reset syncing state after a delay
    setTimeout(() => {
      setSyncing(false);
      setLastSync(new Date());
    }, 1000);
  };

  return (
    <div className="flex items-center gap-3" aria-live="polite">
      <Badge 
        variant={connected ? "outline" : "destructive"} 
        className="h-7 flex gap-1 items-center"
      >
        {connected ? (
          <>
            <Wifi className="h-3.5 w-3.5" />
            <span>Connected</span>
          </>
        ) : (
          <>
            <WifiOff className="h-3.5 w-3.5" />
            <span>Disconnected</span>
          </>
        )}
      </Badge>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleManualSync}
        disabled={syncing}
        className="h-7 flex gap-1 items-center"
      >
        <RefreshCw className={`h-3.5 w-3.5 ${syncing ? 'animate-spin' : ''}`} />
        <span>{syncing ? 'Syncing...' : 'Sync Now'}</span>
      </Button>
      
      {lastSync && (
        <span className="text-xs text-muted-foreground">
          Last sync: {lastSync.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}

// Add a default export to fix the import issue in Dashboard.tsx
export default RealtimeSyncIndicator;
