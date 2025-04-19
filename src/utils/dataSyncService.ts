import { enhancedStorage } from "./storageUtils";
import { useState, useEffect } from 'react';

// Type definitions for our service
export interface SyncEvent {
  type: 'sync:started' | 'sync:completed' | 'sync:failed' | 'sync:config';
  timestamp: string;
  details?: any;
}

// We're creating a class to handle data synchronization
class DataSyncService {
  private syncInterval: number = 30000; // Default sync interval: 30 seconds
  private autoSyncTimer: NodeJS.Timeout | null = null;
  private subscribers: Map<string, Function[]> = new Map();
  private isSyncing: boolean = false;
  private syncStats: { lastSync: Date | null; totalSyncs: number } = {
    lastSync: null,
    totalSyncs: 0
  };
  private syncLog: SyncEvent[] = [];
  
  constructor() {
    console.log("DataSyncService initialized");
  }
  
  // Initialize the data sync service
  initializeDataSync(): void {
    try {
      console.log("Initializing data sync with enhanced storage handling");
      // Check if we have any local data to sync
      const hasLocalData = this.checkForLocalData();
      console.log(`Local data check: ${hasLocalData ? 'Data found' : 'No data found'}`);
      
      // Log sync event
      this.logSyncEvent('sync:config', { initialized: true });
    } catch (error) {
      console.error("Error in initializeDataSync:", error);
    }
  }
  
  // Check if we have any local data to sync
  private checkForLocalData(): boolean {
    try {
      // List of keys to check for existing data
      const dataKeys = ['clients', 'settings', 'userPreferences'];
      
      for (const key of dataKeys) {
        const data = enhancedStorage.getItem(key);
        if (data) {
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error("Error checking for local data:", error);
      return false;
    }
  }
  
  // Set the sync interval
  setInterval(interval: number): void {
    this.syncInterval = interval;
    console.log(`Sync interval set to ${interval}ms`);
    
    // Restart auto-sync if it's running
    if (this.autoSyncTimer) {
      this.stopAutoSync();
      this.startAutoSync();
    }
    
    // Log sync event
    this.logSyncEvent('sync:config', { interval });
  }
  
  // Start automatic synchronization
  startAutoSync(): void {
    if (this.autoSyncTimer) {
      clearInterval(this.autoSyncTimer);
    }
    
    console.log(`Starting auto-sync with interval: ${this.syncInterval}ms`);
    this.autoSyncTimer = setInterval(() => {
      this.manualSync().catch(err => {
        console.error("Error during auto-sync:", err);
      });
    }, this.syncInterval);
    
    // Log sync event
    this.logSyncEvent('sync:config', { autoSync: true, interval: this.syncInterval });
  }
  
  // Stop automatic synchronization
  stopAutoSync(): void {
    if (this.autoSyncTimer) {
      console.log("Stopping auto-sync");
      clearInterval(this.autoSyncTimer);
      this.autoSyncTimer = null;
      
      // Log sync event
      this.logSyncEvent('sync:config', { autoSync: false });
    }
  }
  
  // Manually trigger a sync
  async manualSync(): Promise<boolean> {
    try {
      if (this.isSyncing) {
        console.log("Sync already in progress, skipping");
        return false;
      }
      
      this.isSyncing = true;
      console.log("Manual sync started");
      
      // Log sync event
      this.logSyncEvent('sync:started');
      
      // Simulate sync process
      await this.syncData();
      
      // Update stats
      this.syncStats.lastSync = new Date();
      this.syncStats.totalSyncs++;
      
      // Log sync event
      this.logSyncEvent('sync:completed');
      
      console.log("Manual sync completed");
      return true;
    } catch (error) {
      console.error("Error in manualSync:", error);
      
      // Log sync event
      this.logSyncEvent('sync:failed', { error: error instanceof Error ? error.message : 'Unknown error' });
      
      return false;
    } finally {
      this.isSyncing = false;
    }
  }
  
  // Log sync events
  private logSyncEvent(type: SyncEvent['type'], details?: any): void {
    const event: SyncEvent = {
      type,
      timestamp: new Date().toISOString(),
      details
    };
    
    this.syncLog.push(event);
    
    // Keep log size reasonable
    if (this.syncLog.length > 100) {
      this.syncLog = this.syncLog.slice(-100);
    }
  }
  
  // Get sync stats
  getSyncStats() {
    return { ...this.syncStats };
  }
  
  // Get sync state
  getSyncState() {
    return {
      isSyncing: this.isSyncing,
      autoSyncEnabled: this.autoSyncTimer !== null,
      syncInterval: this.syncInterval,
      stats: this.getSyncStats(),
      syncLog: [...this.syncLog]
    };
  }
  
  // Get sync log
  getSyncLog() {
    return [...this.syncLog];
  }
  
  // Clear sync log
  clearSyncLog() {
    this.syncLog = [];
  }
  
  // Simulate data synchronization
  private async syncData(): Promise<void> {
    try {
      // In a real app, this would sync with a server
      // For now, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Notify subscribers of data changes
      this.notifySubscribers('clients', this.loadData('clients', []));
      this.notifySubscribers('settings', this.loadData('settings', {}));
    } catch (error) {
      console.error("Error syncing data:", error);
    }
  }
  
  // Save data to storage
  saveData(key: string, data: any): boolean {
    try {
      // Use enhanced storage instead of direct localStorage
      enhancedStorage.setItem(key, JSON.stringify(data));
      
      // Notify subscribers
      this.notifySubscribers(key, data);
      
      return true;
    } catch (error) {
      console.error(`Error saving data for key: ${key}`, error);
      return false;
    }
  }
  
  // Load data from storage
  loadData(key: string, defaultValue: any = null): any {
    try {
      const data = enhancedStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
      console.error(`Error loading data for key: ${key}`, error);
      return defaultValue;
    }
  }
  
  // Subscribe to data changes
  subscribe(key: string, callback: Function): void {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, []);
    }
    
    this.subscribers.get(key)?.push(callback);
    console.log(`Subscribed to ${key}, total subscribers: ${this.subscribers.get(key)?.length}`);
  }
  
  // Unsubscribe from data changes
  unsubscribe(key: string, callback: Function): void {
    if (!this.subscribers.has(key)) {
      return;
    }
    
    const callbacks = this.subscribers.get(key) || [];
    const index = callbacks.indexOf(callback);
    
    if (index !== -1) {
      callbacks.splice(index, 1);
      console.log(`Unsubscribed from ${key}, remaining subscribers: ${callbacks.length}`);
    }
  }
  
  // Notify subscribers of data changes
  private notifySubscribers(key: string, data: any): void {
    if (!this.subscribers.has(key)) {
      return;
    }
    
    const callbacks = this.subscribers.get(key) || [];
    callbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in subscriber callback for ${key}:`, error);
      }
    });
  }
}

// Create and export a singleton instance
export const dataSyncService = new DataSyncService();

// Hook to access sync service functionality
export function useSyncService() {
  const [syncState, setSyncState] = useState(dataSyncService.getSyncState());
  
  useEffect(() => {
    // Update state initially
    setSyncState(dataSyncService.getSyncState());
    
    // Setup interval to refresh state
    const intervalId = setInterval(() => {
      setSyncState(dataSyncService.getSyncState());
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  return {
    startAutoSync: () => dataSyncService.startAutoSync(),
    stopAutoSync: () => dataSyncService.stopAutoSync(),
    manualSync: () => dataSyncService.manualSync(),
    setInterval: (interval: number) => dataSyncService.setInterval(interval),
    syncStats: syncState.stats,
    isSyncing: syncState.isSyncing,
    autoSyncEnabled: syncState.autoSyncEnabled,
    syncInterval: syncState.syncInterval,
    syncLog: syncState.syncLog,
    clearSyncLog: () => dataSyncService.clearSyncLog()
  };
}

// Add a hook to use realtime data with error handling
export function useRealtimeData<T = any>(key: string, defaultValue: T = null as unknown as T): [T, boolean] {
  const [data, setData] = useState<T>(defaultValue);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    try {
      // Load initial data
      const storedData = dataSyncService.loadData(key, defaultValue);
      setData(storedData);
      setIsLoading(false);
      
      // Subscribe to changes
      const handleDataChange = (newData: T) => {
        setData(newData);
      };
      
      dataSyncService.subscribe(key, handleDataChange);
      
      return () => {
        dataSyncService.unsubscribe(key, handleDataChange);
      };
    } catch (error) {
      console.error(`Error in useRealtimeData for key: ${key}`, error);
      setData(defaultValue);
      setIsLoading(false);
    }
  }, [key, defaultValue]);
  
  return [data, isLoading];
}

// Add paginated data hook for optimized performance
export function usePaginatedData<T = any>(key: string, defaultValue: T[] = [], itemsPerPage: number = 10) {
  const [data, isLoading] = useRealtimeData<T[]>(key, defaultValue);
  const [paginationState, setPaginationState] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage,
    indexOfFirstItem: 0,
    indexOfLastItem: itemsPerPage,
    onPageChange: (page: number) => {
      setPaginationState(prev => {
        const currentPage = Math.max(1, Math.min(page, prev.totalPages));
        const indexOfLastItem = currentPage * prev.itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - prev.itemsPerPage;
        
        return {
          ...prev,
          currentPage,
          indexOfFirstItem,
          indexOfLastItem: Math.min(indexOfLastItem, prev.totalItems)
        };
      });
    }
  });
  
  // Update pagination when data or items per page changes
  useEffect(() => {
    if (data && Array.isArray(data)) {
      const totalItems = data.length;
      const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
      const currentPage = Math.min(paginationState.currentPage, totalPages);
      const indexOfLastItem = currentPage * itemsPerPage;
      const indexOfFirstItem = indexOfLastItem - itemsPerPage;
      
      setPaginationState({
        ...paginationState,
        totalItems,
        totalPages,
        currentPage,
        itemsPerPage,
        indexOfFirstItem,
        indexOfLastItem: Math.min(indexOfLastItem, totalItems)
      });
    }
  }, [data, itemsPerPage]);
  
  return [data, paginationState, isLoading] as const;
}

// Export the enhanced storage for direct use
export { enhancedStorage };
