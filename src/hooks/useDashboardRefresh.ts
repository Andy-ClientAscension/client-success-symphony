
import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRealtimeData } from '@/hooks/useRealtimeData';

/**
 * Hook for managing dashboard data refresh with real-time updates
 */
export function useDashboardRefresh<T>(
  storageKey: string,
  tableName: string | undefined,
  defaultValue: T
) {
  const { toast } = useToast();
  const [manualRefreshing, setManualRefreshing] = useState(false);
  
  // Use our realtime data hook for the actual data
  const [data, isLoading, error, refresh] = useRealtimeData<T>(
    storageKey,
    defaultValue,
    {
      tableName,
      enableNotifications: false // We'll handle notifications ourselves
    }
  );

  // Function to manually refresh data
  const handleRefresh = useCallback(async () => {
    setManualRefreshing(true);
    try {
      await refresh();
      toast({
        title: 'Data refreshed',
        description: 'The latest data has been loaded',
      });
    } catch (err) {
      toast({
        title: 'Refresh failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setManualRefreshing(false);
    }
  }, [refresh, toast]);

  // Calculate the "refreshing" state by combining loading and manual refresh
  const isRefreshing = isLoading || manualRefreshing;
  
  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      toast({
        title: 'Back online',
        description: 'Connection restored. Refreshing data...',
      });
      handleRefresh();
    };
    
    window.addEventListener('online', handleOnline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [handleRefresh, toast]);

  return {
    data,
    isLoading,
    error,
    isRefreshing,
    refreshData: handleRefresh
  };
}
