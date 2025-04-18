
import { useEffect, useState, useRef, useCallback } from 'react';
import { STORAGE_KEYS, loadData, saveData } from './persistence';

// Interval for polling in milliseconds
const SYNC_INTERVAL = 5000;

// Keep track of updated keys for efficient sync
let updatedKeys: Set<string> = new Set();
let subscribers: Map<string, Function[]> = new Map();
let syncInterval: ReturnType<typeof setInterval> | null = null;
let syncIntervalMs = SYNC_INTERVAL;
let isSyncActive = false;

// Synchronization event log
export interface SyncEvent {
  type: string;
  timestamp: string;
  details?: Record<string, any>;
}

// Sync statistics
interface SyncStats {
  lastSync: string | null;
  totalEvents: number;
  failureCount: number;
}

const syncLog: SyncEvent[] = [];
const syncStats: SyncStats = {
  lastSync: null,
  totalEvents: 0,
  failureCount: 0
};

// Initialize the data sync service
export function initializeDataSync() {
  if (syncInterval) return; // Already initialized
  
  console.info('Starting data sync service');
  startAutoSync();
  
  // Create an initial backup
  createBackup();
  
  // Listen for storage events from other tabs
  window.addEventListener('storage', (e) => {
    if (e.key && subscribers.has(e.key)) {
      const data = loadData(e.key, null);
      notifySubscribers(e.key, data);
    }
  });
}

// Start automatic synchronization
export function startAutoSync() {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
  
  isSyncActive = true;
  
  // Set up interval to check for data changes
  syncInterval = setInterval(() => {
    if (updatedKeys.size > 0) {
      console.info('Starting auto sync');
      logSyncEvent('sync:started', { mode: 'auto' });
      
      // Only sync keys that have been marked as updated
      updatedKeys.forEach(key => {
        const data = loadData(key, null);
        broadcastDataChange(key, data);
        console.info(`Data change broadcast for: ${key}`);
      });
      
      updatedKeys.clear();
      
      // Mark sync as complete
      setTimeout(() => {
        logSyncEvent('sync:completed', { mode: 'auto' });
        console.info('auto sync completed');
      }, 100);
    }
    
    // Create a backup periodically
    createBackup();
  }, syncIntervalMs);
}

// Stop automatic synchronization
export function stopAutoSync() {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
  
  isSyncActive = false;
  console.info('Auto sync stopped');
}

// Adjust sync interval
export function setInterval(ms: number) {
  // Store the new interval value
  syncIntervalMs = ms;
  
  // If sync is active, restart with new interval
  if (isSyncActive) {
    // First stop the current sync
    if (syncInterval) {
      clearInterval(syncInterval);
      syncInterval = null;
    }
    
    // Then start a new one with the updated interval
    startAutoSync();
  }
  
  console.info(`Sync interval set to ${ms}ms`);
}

// Perform manual synchronization
export async function manualSync(): Promise<boolean> {
  try {
    logSyncEvent('sync:started', { mode: 'manual' });
    console.info('Starting manual sync');
    
    // Sync all storage keys
    const allKeys = Object.values(STORAGE_KEYS);
    for (const key of allKeys) {
      const data = loadData(key, null);
      broadcastDataChange(key, data);
    }
    
    // Create a new backup
    createBackup();
    
    logSyncEvent('sync:completed', { mode: 'manual' });
    console.info('Manual sync completed');
    return true;
  } catch (error) {
    console.error('Manual sync failed:', error);
    logSyncEvent('sync:failed', { error: String(error) });
    return false;
  }
}

// Create a backup of all data
function createBackup() {
  try {
    const allKeys = Object.values(STORAGE_KEYS);
    const backup: Record<string, any> = {};
    
    allKeys.forEach(key => {
      backup[key] = loadData(key, null);
    });
    
    saveData('backupData', backup);
    broadcastDataChange('backupData', backup);
    console.info('Sync backup created');
  } catch (error) {
    console.error('Failed to create backup:', error);
    logSyncEvent('sync:failed', { error: String(error) });
  }
}

// Log a sync event
function logSyncEvent(type: string, details?: Record<string, any>) {
  const event: SyncEvent = {
    type,
    timestamp: new Date().toISOString(),
    details
  };
  
  syncLog.push(event);
  syncStats.totalEvents++;
  
  if (type === 'sync:completed') {
    syncStats.lastSync = event.timestamp;
  } else if (type === 'sync:failed') {
    syncStats.failureCount++;
  }
  
  // Keep log size manageable (max 100 events)
  if (syncLog.length > 100) {
    syncLog.shift();
  }
  
  broadcastSyncEvent(type, details);
}

// Clear the sync log
export function clearSyncLog() {
  syncLog.length = 0;
  console.info('Sync log cleared');
}

// Notify all subscribers when data changes
function notifySubscribers(key: string, data: any) {
  if (subscribers.has(key)) {
    subscribers.get(key)?.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in subscriber callback for ${key}:`, error);
      }
    });
  }
}

// Broadcast data changes to subscribers
function broadcastDataChange(key: string, data: any) {
  notifySubscribers(key, data);
  logSyncEvent('data:changed', { key });
  const event = new CustomEvent('storageUpdated', { detail: { key, data } });
  window.dispatchEvent(event);
}

// Broadcast sync events
function broadcastSyncEvent(eventType: string, detail: any) {
  console.info(`Sync event: ${eventType}`, detail);
  const event = new CustomEvent(eventType, { detail });
  window.dispatchEvent(event);
}

// Mark a key as updated, triggering a sync in the next interval
export function markKeyAsUpdated(key: string) {
  updatedKeys.add(key);
  console.info(`Marked key as updated: ${key}`);
}

// Save data and mark it for sync
export function saveDataAndSync<T>(key: string, data: T): void {
  saveData(key, data);
  markKeyAsUpdated(key);
  console.info(`Saved data for key: ${key}`);
}

/**
 * Hook to use real-time synchronized data
 * @param key Storage key to watch
 * @param defaultValue Default value if none exists
 * @param withSetter Whether to return a setter function as the third element
 * @returns [data, isLoading, setData?] - The data, loading state, and optional setter function
 */
export function useRealtimeData<T>(
  key: string, 
  defaultValue: T,
  withSetter: boolean = false
): [T, boolean, ((newData: T) => void)?] {
  const [data, setData] = useState<T>(() => loadData(key, defaultValue));
  const [isLoading, setIsLoading] = useState(true);
  const initialized = useRef(false);
  
  // Set up subscriber for this key
  useEffect(() => {
    if (!subscribers.has(key)) {
      subscribers.set(key, []);
    }
    
    const callback = (newData: T) => {
      setData(newData !== null ? newData : defaultValue);
      setIsLoading(false);
    };
    
    subscribers.get(key)?.push(callback);
    
    // Load initial data
    if (!initialized.current) {
      const storedData = loadData(key, defaultValue);
      setData(storedData);
      setIsLoading(false);
      initialized.current = true;
    }
    
    // Clean up subscriber when component unmounts
    return () => {
      if (subscribers.has(key)) {
        const callbacks = subscribers.get(key) || [];
        subscribers.set(key, callbacks.filter(cb => cb !== callback));
      }
    };
  }, [key, defaultValue]);
  
  // Define setter function if requested
  const setDataAndSync = useCallback((newData: T) => {
    saveDataAndSync(key, newData);
    setData(newData);
  }, [key]);
  
  // Return array with or without setter based on withSetter flag
  return withSetter ? [data, isLoading, setDataAndSync] : [data, isLoading];
}

/**
 * Hook to interact with the sync service
 * @returns Sync service methods and state
 */
export function useSyncService() {
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Handle manual sync with UI state
  const handleManualSync = useCallback(async () => {
    setIsSyncing(true);
    try {
      const result = await manualSync();
      setIsSyncing(false);
      return result;
    } catch (error) {
      setIsSyncing(false);
      return false;
    }
  }, []);
  
  return {
    startAutoSync,
    stopAutoSync,
    manualSync: handleManualSync,
    setInterval,
    clearSyncLog,
    syncStats,
    syncLog,
    isSyncing
  };
}

// Export a convenience object with all sync methods
const dataSyncService = {
  initializeDataSync,
  startAutoSync,
  stopAutoSync,
  manualSync,
  setInterval,
  clearSyncLog,
  markKeyAsUpdated,
  saveDataAndSync
};

export { dataSyncService };
