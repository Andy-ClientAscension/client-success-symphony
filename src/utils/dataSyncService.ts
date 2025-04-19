// Keep the existing imports if they exist, and add our new enhancedStorage import
import { enhancedStorage } from "./storageUtils";
import { useState, useEffect } from 'react';

// We're creating a class to handle data synchronization
class DataSyncService {
  private syncInterval: number = 30000; // Default sync interval: 30 seconds
  private autoSyncTimer: NodeJS.Timeout | null = null;
  private subscribers: Map<string, Function[]> = new Map();
  private isSyncing: boolean = false;
  
  constructor() {
    console.log("DataSyncService initialized");
  }
  
  // Initialize the data sync service
  initializeDataSync(): void {
    try {
      console.log("Initializing data sync with enhanced storage handling");
      // Check if we have any data to sync
      const hasLocalData = this.checkForLocalData();
      console.log(`Local data check: ${hasLocalData ? 'Data found' : 'No data found'}`);
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
  }
  
  // Stop automatic synchronization
  stopAutoSync(): void {
    if (this.autoSyncTimer) {
      console.log("Stopping auto-sync");
      clearInterval(this.autoSyncTimer);
      this.autoSyncTimer = null;
    }
  }
  
  // Manually trigger a sync
  async manualSync(): Promise<void> {
    try {
      if (this.isSyncing) {
        console.log("Sync already in progress, skipping");
        return;
      }
      
      this.isSyncing = true;
      console.log("Manual sync started");
      
      // Simulate sync process
      await this.syncData();
      
      console.log("Manual sync completed");
    } catch (error) {
      console.error("Error in manualSync:", error);
    } finally {
      this.isSyncing = false;
    }
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

// Add a hook to use realtime data with error handling
export function useRealtimeData(key: string, defaultValue: any = null): [any, boolean] {
  const [data, setData] = useState(defaultValue);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    try {
      // Load initial data
      const storedData = dataSyncService.loadData(key, defaultValue);
      setData(storedData);
      setIsLoading(false);
      
      // Subscribe to changes
      const handleDataChange = (newData: any) => {
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

// Export the enhanced storage for direct use
export { enhancedStorage };
