
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';
import { STORAGE_KEYS, loadData, saveData } from '@/utils/persistence';
import { applyBatchChanges } from '@/utils/realtimeHelper';

interface RealtimeConfig {
  tableName?: string;
  schemaName?: string;
  storageKey?: string;
  enableNotifications?: boolean;
  maxRetries?: number;
  initialRetryDelay?: number;
}

/**
 * Hook for handling real-time data sync with Supabase Realtime
 * @param key Storage key or table name to watch
 * @param defaultValue Default value if no data exists
 * @param config Configuration options
 */
export function useRealtimeData<T>(
  key: string,
  defaultValue: T,
  config: RealtimeConfig = {}
): [T, boolean, Error | null, () => Promise<void>] {
  const {
    tableName = key,
    schemaName = 'public',
    storageKey = key,
    enableNotifications = true,
    maxRetries = 10,
    initialRetryDelay = 500
  } = config;

  // State
  const [data, setData] = useState<T>(defaultValue);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(true);
  
  // Refs for managing retries and channel
  const channelRef = useRef<RealtimeChannel | null>(null);
  const retryCountRef = useRef<number>(0);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const { toast } = useToast();

  // Function to load data from storage or API
  const loadPersistedData = useCallback(async () => {
    try {
      // First try to get from local storage for fast initial load
      const persistedData = loadData<T>(storageKey);
      if (persistedData) {
        setData(persistedData);
      }
      
      // Then try to fetch from Supabase if table name is provided
      if (tableName && tableName !== storageKey) {
        setIsLoading(true);
        const { data: dbData, error: dbError } = await supabase
          .from(tableName)
          .select('*');

        if (dbError) {
          console.error(`Error fetching data from ${tableName}:`, dbError);
          // Don't throw, just continue with persisted/default data
        } else if (dbData) {
          setData(dbData as unknown as T);
          // Also update local storage
          saveData(storageKey, dbData);
        }
      }
    } catch (err) {
      console.error('Error loading data:', err);
      if (err instanceof Error) {
        setError(err);
      } else {
        setError(new Error('An unknown error occurred while loading data'));
      }
    } finally {
      setIsLoading(false);
    }
  }, [tableName, storageKey]);

  // Function to handle realtime updates
  const handleRealtimeChanges = useCallback((payload: RealtimePostgresChangesPayload<any>) => {
    try {
      console.log('Realtime change received:', payload);
      
      // Apply optimistic update to local state
      setData((currentData) => {
        // Handle different events: INSERT, UPDATE, DELETE
        if (Array.isArray(currentData)) {
          // Handle array data (collections)
          let updatedData: any[];
          
          switch (payload.eventType) {
            case 'INSERT':
              const newRecord = payload.new;
              // Avoid duplicates
              if (!currentData.some((item: any) => item.id === newRecord.id)) {
                updatedData = [...currentData, newRecord];
                saveData(storageKey, updatedData);
                return updatedData as T;
              }
              break;
              
            case 'UPDATE':
              updatedData = currentData.map((item: any) => 
                item.id === payload.new.id ? { ...item, ...payload.new } : item
              );
              saveData(storageKey, updatedData);
              return updatedData as T;
              
            case 'DELETE':
              updatedData = currentData.filter((item: any) => item.id !== payload.old.id);
              saveData(storageKey, updatedData);
              return updatedData as T;
          }
        } else if (typeof currentData === 'object' && currentData !== null) {
          // Handle single object data
          if (payload.eventType === 'UPDATE') {
            const newData = { ...currentData, ...payload.new };
            saveData(storageKey, newData);
            return newData as T;
          }
        }
        
        // Default: return unchanged data
        return currentData;
      });
      
      if (enableNotifications) {
        const eventTypeMessages = {
          INSERT: 'New data received',
          UPDATE: 'Data updated',
          DELETE: 'Data removed'
        };
        
        toast({
          title: eventTypeMessages[payload.eventType as keyof typeof eventTypeMessages] || 'Data changed',
          description: `Changes in ${tableName || 'data'}`,
          variant: 'default'
        });
      }
    } catch (err) {
      console.error('Error handling realtime changes:', err);
    }
  }, [storageKey, tableName, toast, enableNotifications]);

  // Function to establish realtime connection with exponential backoff
  const setupRealtimeSubscription = useCallback(() => {
    if (!tableName || tableName === storageKey) return;
    
    try {
      // Clean up any existing channel
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }

      console.log(`Setting up realtime subscription for ${schemaName}.${tableName}`);
      
      // Create a new channel
      const channel = supabase
        .channel(`${schemaName}-${tableName}-changes`)
        .on(
          'postgres_changes',
          { event: '*', schema: schemaName, table: tableName },
          handleRealtimeChanges
        )
        .on('system', { event: 'connection_state_change' }, (payload) => {
          console.log('Connection state changed:', payload);
          const newState = payload.event === 'connected';
          setIsConnected(newState);
          
          if (newState) {
            // Reset retry count when successfully connected
            retryCountRef.current = 0;
            toast({
              title: 'Realtime Connected',
              description: `Live updates enabled for ${tableName}`,
              variant: 'default'
            });
          } else {
            toast({
              title: 'Realtime Disconnected',
              description: 'Attempting to reconnect...',
              variant: 'destructive'
            });
          }
        })
        .subscribe((status) => {
          console.log(`Realtime subscription status for ${tableName}:`, status);
          
          if (status === 'SUBSCRIBED') {
            // Reset retry count on successful subscription
            retryCountRef.current = 0;
          } else if (status === 'CHANNEL_ERROR') {
            // Implement retry with exponential backoff
            retrySubscription();
          }
        });
      
      channelRef.current = channel;
      
    } catch (err) {
      console.error('Error setting up realtime subscription:', err);
      retrySubscription();
    }
  }, [tableName, schemaName, handleRealtimeChanges, toast]);

  // Function to retry subscription with exponential backoff
  const retrySubscription = useCallback(() => {
    // Clear any existing timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
    
    // Check if max retries reached
    if (retryCountRef.current >= maxRetries) {
      console.error(`Max retries (${maxRetries}) reached for ${tableName} subscription`);
      toast({
        title: 'Realtime Connection Failed',
        description: 'Could not establish a connection after multiple attempts.',
        variant: 'destructive'
      });
      setIsConnected(false);
      return;
    }
    
    // Calculate exponential backoff delay
    const delay = initialRetryDelay * Math.pow(2, retryCountRef.current);
    const jitter = Math.random() * 0.3 * delay; // Add 0-30% jitter
    const finalDelay = Math.min(delay + jitter, 30000); // Cap at 30 seconds
    
    console.log(`Retrying connection to ${tableName} in ${Math.round(finalDelay)}ms (attempt ${retryCountRef.current + 1}/${maxRetries})`);
    
    // Schedule retry
    retryTimeoutRef.current = setTimeout(() => {
      retryCountRef.current += 1;
      setupRealtimeSubscription();
    }, finalDelay);
    
  }, [initialRetryDelay, maxRetries, tableName, setupRealtimeSubscription, toast]);

  // Manually refresh data
  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      await loadPersistedData();
      // Dispatch event to notify other components of the refresh
      window.dispatchEvent(new CustomEvent('dataRefreshed', { detail: { key: storageKey } }));
    } catch (err) {
      console.error('Error refreshing data:', err);
      if (err instanceof Error) {
        setError(err);
      } else {
        setError(new Error('Unknown error refreshing data'));
      }
    } finally {
      setIsLoading(false);
    }
  }, [loadPersistedData, storageKey]);

  // Initial load and setup realtime subscription
  useEffect(() => {
    loadPersistedData();
    setupRealtimeSubscription();
    
    // Set up listener for storage changes from other components
    const handleStorageEvent = (e: CustomEvent<{ key: string }>) => {
      if (e.detail.key === storageKey || e.detail.key === 'storageUpdated') {
        loadPersistedData();
      }
    };
    
    // Listen for storage updates from other components
    window.addEventListener('storageUpdated', handleStorageEvent as EventListener);
    window.addEventListener('dataRefreshed', handleStorageEvent as EventListener);
    
    // Online/offline detection
    const handleOnline = () => {
      console.log('Browser went online, reconnecting realtime');
      setIsConnected(true);
      setupRealtimeSubscription();
    };
    
    const handleOffline = () => {
      console.log('Browser went offline, realtime will be affected');
      setIsConnected(false);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Cleanup function
    return () => {
      window.removeEventListener('storageUpdated', handleStorageEvent as EventListener);
      window.removeEventListener('dataRefreshed', handleStorageEvent as EventListener);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      // Clean up channel subscription
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      
      // Clean up any pending retries
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [loadPersistedData, setupRealtimeSubscription, storageKey]);

  // Return current state and refresh function
  return [data, isLoading, error, refresh];
}
