import { useEffect, useState, useRef, useCallback } from 'react';
import { STORAGE_KEYS, loadData, saveData } from './persistence';

// Interval for polling in milliseconds
const SYNC_INTERVAL = 5000;

// Keep track of updated keys for efficient sync
let updatedKeys: Set<string> = new Set();
let subscribers: Map<string, Function[]> = new Map();
let syncInterval: ReturnType<typeof setInterval> | null = null;

// Initialize the data sync service
export function initializeDataSync() {
  if (syncInterval) return; // Already initialized
  
  console.info('Starting data sync service');
  
  // Set up interval to check for data changes
  syncInterval = setInterval(() => {
    if (updatedKeys.size > 0) {
      console.info('Starting auto sync');
      broadcastSyncEvent('sync:started', { mode: 'auto' });
      
      // Only sync keys that have been marked as updated
      updatedKeys.forEach(key => {
        const data = loadData(key, null);
        broadcastDataChange(key, data);
        console.info(`Data change broadcast for: ${key}`);
      });
      
      updatedKeys.clear();
      
      // Mark sync as complete
      setTimeout(() => {
        broadcastSyncEvent('sync:completed', { mode: 'auto' });
        console.info('auto sync completed');
      }, 100);
    }
  }, SYNC_INTERVAL);
  
  // Create a backup of all data periodically
  setInterval(() => {
    createBackup();
  }, SYNC_INTERVAL * 3);
  
  // Listen for storage events from other tabs
  window.addEventListener('storage', (e) => {
    if (e.key && subscribers.has(e.key)) {
      const data = loadData(e.key, null);
      notifySubscribers(e.key, data);
    }
  });
  
  // Create an initial backup
  createBackup();
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
    broadcastSyncEvent('data:changed', { key: 'backupData' });
    console.info('Sync backup created');
  } catch (error) {
    console.error('Failed to create backup:', error);
  }
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
