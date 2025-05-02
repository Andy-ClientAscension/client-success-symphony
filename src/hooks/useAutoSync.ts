
import { useEffect, useState, useCallback } from 'react';
import { autoSyncEngine } from '@/utils/autoSync/autoSyncEngine';
import { useToast } from '@/hooks/use-toast';

interface AutoSyncStatus {
  isSyncing: boolean;
  lastSync: Date | null;
  metrics: {
    totalSuccessfulSyncs: number;
    totalFailedSyncs: number;
    averageSyncTime: number;
  };
}

export function useAutoSync() {
  const [status, setStatus] = useState<AutoSyncStatus>({
    isSyncing: false,
    lastSync: null,
    metrics: {
      totalSuccessfulSyncs: 0,
      totalFailedSyncs: 0,
      averageSyncTime: 0
    }
  });
  const { toast } = useToast();

  // Update local state when sync status changes
  useEffect(() => {
    const unsubscribe = autoSyncEngine.subscribe((syncState) => {
      setStatus(prev => ({
        ...prev,
        isSyncing: syncState.isSyncing,
        lastSync: syncState.lastSync
      }));
    });
    
    // Load initial metrics
    const metrics = autoSyncEngine.getMetrics();
    setStatus(prev => ({
      ...prev,
      lastSync: metrics.lastSuccessfulSync,
      metrics: {
        totalSuccessfulSyncs: metrics.totalSuccessfulSyncs,
        totalFailedSyncs: metrics.totalFailedSyncs,
        averageSyncTime: metrics.averageSyncTime
      }
    }));
    
    return unsubscribe;
  }, []);

  // Function to trigger manual sync with toast notification
  const triggerSync = useCallback(async () => {
    if (status.isSyncing) {
      toast({
        title: "Sync Already in Progress",
        description: "Please wait for the current sync to complete.",
      });
      return false;
    }
    
    toast({
      title: "Syncing Data",
      description: "Synchronizing dashboard data...",
    });
    
    try {
      const success = await autoSyncEngine.performSync(true);
      
      if (success) {
        toast({
          title: "Sync Completed",
          description: "Dashboard data successfully synchronized.",
        });
      } else {
        toast({
          title: "Sync Failed",
          description: "Unable to synchronize dashboard data. Retrying automatically.",
          variant: "destructive",
        });
      }
      
      return success;
    } catch (error) {
      toast({
        title: "Sync Error",
        description: error instanceof Error ? error.message : "An unknown error occurred during sync.",
        variant: "destructive",
      });
      return false;
    }
  }, [status.isSyncing, toast]);

  // Function to configure sync parameters
  const configureSync = useCallback((config: {
    frequency?: 'real-time' | 'interval' | 'manual';
    scope?: 'full_dataset' | 'partial' | 'delta_only';
    updateStrategy?: 'atomic_transactions' | 'incremental' | 'priority_based';
  }) => {
    autoSyncEngine.setConfig(config);
    
    toast({
      title: "Sync Configuration Updated",
      description: "The auto-sync settings have been updated.",
    });
  }, [toast]);

  return {
    isSyncing: status.isSyncing,
    lastSync: status.lastSync,
    metrics: status.metrics,
    triggerSync,
    configureSync
  };
}
