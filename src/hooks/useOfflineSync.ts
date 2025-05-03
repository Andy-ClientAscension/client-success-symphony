
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  getPendingOperations, 
  removeFromQueue,
  clearCompletedOperations,
  OfflineQueueItem
} from '@/utils/offlineStorage';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook to synchronize offline operations when back online
 */
export function useOfflineSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingOperations, setPendingOperations] = useState<OfflineQueueItem[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { toast } = useToast();

  // Load pending operations count
  const loadPendingCount = useCallback(async () => {
    const operations = await getPendingOperations();
    setPendingOperations(operations);
    return operations;
  }, []);

  // Sync a single operation
  const syncOperation = useCallback(async (operation: OfflineQueueItem): Promise<boolean> => {
    try {
      let result;
      
      switch (operation.operation) {
        case 'INSERT':
          result = await supabase
            .from(operation.table)
            .insert(operation.data);
          break;
          
        case 'UPDATE':
          result = await supabase
            .from(operation.table)
            .update(operation.data)
            .match({ id: operation.data.id });
          break;
          
        case 'DELETE':
          result = await supabase
            .from(operation.table)
            .delete()
            .match({ id: operation.data.id });
          break;
      }
      
      if (result.error) {
        console.error(`Error syncing operation ${operation.id}:`, result.error);
        return false;
      }
      
      await removeFromQueue(operation.id);
      return true;
    } catch (error) {
      console.error(`Error processing offline operation ${operation.id}:`, error);
      return false;
    }
  }, []);

  // Sync all pending operations
  const syncAll = useCallback(async () => {
    if (!navigator.onLine || isSyncing) return;
    
    setIsSyncing(true);
    
    try {
      const operations = await getPendingOperations();
      
      if (operations.length === 0) {
        setIsSyncing(false);
        return;
      }
      
      toast({
        title: 'Syncing offline changes',
        description: `Processing ${operations.length} pending operations...`,
      });
      
      const results = await Promise.all(operations.map(syncOperation));
      const successful = results.filter(Boolean).length;
      const failed = operations.length - successful;
      
      // Update pending operations count
      await loadPendingCount();
      
      if (successful > 0) {
        toast({
          title: 'Sync completed',
          description: `Successfully synchronized ${successful} operations${failed > 0 ? `, ${failed} failed` : ''}`,
          variant: 'default',
        });
      }
      
      if (failed > 0) {
        toast({
          title: 'Sync issues',
          description: `${failed} operations couldn't be synchronized`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error syncing offline operations:', error);
      toast({
        title: 'Sync failed',
        description: 'Failed to synchronize offline changes',
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, toast, syncOperation, loadPendingCount]);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncAll();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };
    
    // Listen for online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Listen for new offline operations being queued
    const handleQueueUpdate = () => {
      loadPendingCount();
    };
    
    window.addEventListener('offlineOperationQueued', handleQueueUpdate);
    
    // Initial load of pending operations
    loadPendingCount();
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('offlineOperationQueued', handleQueueUpdate);
    };
  }, [syncAll, loadPendingCount]);

  // Manual sync trigger
  const triggerSync = useCallback(async () => {
    if (isOnline) {
      await syncAll();
    } else {
      toast({
        title: 'Offline',
        description: 'Cannot sync while offline',
        variant: 'destructive',
      });
    }
  }, [isOnline, syncAll, toast]);

  return {
    isSyncing,
    isOnline,
    pendingOperationsCount: pendingOperations.length,
    pendingOperations,
    triggerSync,
    loadPendingCount
  };
}
