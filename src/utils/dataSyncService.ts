/**
 * Dashboard Data Synchronization Service
 * 
 * This service centralizes data synchronization across all dashboard components
 * using localStorage as the persistence layer. It provides:
 * 
 * - Real-time updates for all components via custom events
 * - Automatic change detection
 * - Error handling and logging
 * - Consistency verification
 */

import { STORAGE_KEYS, loadData, saveData, createBackup } from './persistence';
import { Client } from '@/lib/data';
import { validateClients } from './clientValidation';

// Define sync event types
export type SyncEventType = 
  | 'sync:started'
  | 'sync:completed'
  | 'sync:failed'
  | 'sync:manual_requested'
  | 'data:changed';

// Sync event payload structure
export interface SyncEvent {
  type: SyncEventType;
  timestamp: string;
  source: string;
  details?: any;
}

// Track data versions with lightweight checksums
interface DataVersions {
  [key: string]: string; // key: checksum
}

// Singleton class for data synchronization
class DataSyncService {
  private dataVersions: DataVersions = {};
  private syncInProgress: boolean = false;
  private lastSyncTimestamp: number = 0;
  private syncInterval: number = 30000; // 30 seconds
  private intervalId: number | null = null;
  private retryCount: { [key: string]: number } = {};
  private MAX_RETRIES = 3;
  private syncLog: SyncEvent[] = [];
  private MAX_LOG_ENTRIES = 100;
  
  constructor() {
    // Initialize version tracking for all storage keys
    this.initializeDataVersions();
    
    // Set up event listeners for storage changes
    window.addEventListener('storage', this.handleStorageEvent);
    window.addEventListener('storageUpdated', this.handleCustomStorageEvent);
    window.addEventListener('storageRestored', this.handleStorageRestored);
    
    // Create an initial backup
    this.createSyncBackup();
  }
  
  /**
   * Initialize tracking of data versions for all storage keys
   */
  private initializeDataVersions(): void {
    Object.values(STORAGE_KEYS).forEach(key => {
      try {
        const data = localStorage.getItem(key);
        this.dataVersions[key] = this.generateChecksum(data || '');
      } catch (error) {
        console.error(`Error initializing version for ${key}:`, error);
        this.dataVersions[key] = '';
      }
    });
  }
  
  /**
   * Generate a simple checksum for data comparison
   */
  private generateChecksum(data: string): string {
    // Simple hash function for quick comparison
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(16);
  }
  
  /**
   * Start background monitoring
   */
  public startAutoSync(): void {
    if (this.intervalId !== null) {
      return;
    }
    
    this.intervalId = window.setInterval(() => {
      this.performSync('auto');
    }, this.syncInterval);
    
    console.log(`Auto sync started with interval of ${this.syncInterval}ms`);
    this.logSyncEvent('sync:started', 'system', { mode: 'auto' });
  }
  
  /**
   * Stop background monitoring
   */
  public stopAutoSync(): void {
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('Auto sync stopped');
    }
  }
  
  /**
   * Manually trigger a sync operation
   */
  public manualSync(): Promise<boolean> {
    this.logSyncEvent('sync:manual_requested', 'user');
    return this.performSync('manual');
  }
  
  /**
   * Set the auto-sync interval in milliseconds
   */
  public setInterval(ms: number): void {
    if (ms < 5000) {
      console.warn('Sync interval too small, setting to minimum of 5000ms');
      ms = 5000;
    }
    
    this.syncInterval = ms;
    
    // Restart the interval if it's running
    if (this.intervalId !== null) {
      this.stopAutoSync();
      this.startAutoSync();
    }
  }
  
  /**
   * Handle localStorage change events
   */
  private handleStorageEvent = (event: StorageEvent): void => {
    if (!event.key || !(event.key in this.dataVersions)) {
      return;
    }
    
    // Check if the data actually changed
    const newChecksum = this.generateChecksum(event.newValue || '');
    
    if (newChecksum !== this.dataVersions[event.key]) {
      this.dataVersions[event.key] = newChecksum;
      this.broadcastDataChange(event.key);
    }
  };
  
  /**
   * Handle custom storage events from within the app
   */
  private handleCustomStorageEvent = (event: any): void => {
    const key = event.detail?.key;
    
    if (!key || !(key in this.dataVersions)) {
      return;
    }
    
    const data = localStorage.getItem(key);
    const newChecksum = this.generateChecksum(data || '');
    
    if (newChecksum !== this.dataVersions[key]) {
      this.dataVersions[key] = newChecksum;
      this.broadcastDataChange(key);
    }
  };
  
  /**
   * Handle storage restored events (from backups)
   */
  private handleStorageRestored = (): void => {
    console.log('Storage restored, reinitializing data versions');
    this.initializeDataVersions();
    
    // Create new backup point after restore
    this.createSyncBackup();
    
    // Broadcast data change for all keys
    Object.keys(this.dataVersions).forEach(key => {
      this.broadcastDataChange(key);
    });
    
    this.logSyncEvent('sync:completed', 'system', { mode: 'restore' });
  };
  
  /**
   * Perform the actual synchronization
   */
  private async performSync(mode: 'auto' | 'manual'): Promise<boolean> {
    if (this.syncInProgress) {
      console.log('Sync already in progress, skipping');
      return false;
    }
    
    const now = Date.now();
    if (mode === 'auto' && now - this.lastSyncTimestamp < 5000) {
      console.log('Last sync too recent, skipping');
      return false;
    }
    
    this.syncInProgress = true;
    this.lastSyncTimestamp = now;
    
    try {
      console.log(`Starting ${mode} sync`);
      this.logSyncEvent('sync:started', mode === 'auto' ? 'system' : 'user', { mode });
      
      // Check all storage keys for changes
      for (const key of Object.values(STORAGE_KEYS)) {
        try {
          await this.syncDataItem(key);
        } catch (error) {
          console.error(`Error syncing ${key}:`, error);
          
          // Increment retry count for this key
          this.retryCount[key] = (this.retryCount[key] || 0) + 1;
          
          if (this.retryCount[key] <= this.MAX_RETRIES) {
            console.log(`Will retry ${key} sync (${this.retryCount[key]}/${this.MAX_RETRIES})`);
          } else {
            this.logSyncEvent('sync:failed', 'system', { 
              key, 
              error: error instanceof Error ? error.message : 'Unknown error' 
            });
          }
        }
      }
      
      // Create backup after successful sync
      this.createSyncBackup();
      
      this.logSyncEvent('sync:completed', 'system', { mode });
      console.log(`${mode} sync completed`);
      return true;
    } catch (error) {
      console.error('Sync failed:', error);
      this.logSyncEvent('sync:failed', 'system', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      return false;
    } finally {
      this.syncInProgress = false;
    }
  }
  
  /**
   * Sync an individual data item
   */
  private async syncDataItem(key: string): Promise<void> {
    const data = localStorage.getItem(key);
    const currentChecksum = this.generateChecksum(data || '');
    
    // Reset retry count if checksums match
    if (currentChecksum === this.dataVersions[key]) {
      this.retryCount[key] = 0;
      return;
    }
    
    // Data has changed, perform validation based on data type
    let isValid = true;
    
    // Validate specific data types
    if (key === STORAGE_KEYS.CLIENTS) {
      try {
        const clientData = JSON.parse(data || '[]');
        isValid = validateClients(clientData).length > 0;
      } catch (error) {
        console.error('Client data validation failed:', error);
        isValid = false;
      }
    }
    
    if (!isValid) {
      throw new Error(`Data validation failed for ${key}`);
    }
    
    // Update stored checksum
    this.dataVersions[key] = currentChecksum;
    
    // Broadcast change to all components
    this.broadcastDataChange(key);
  }
  
  /**
   * Create a backup for rollback if needed
   */
  private createSyncBackup(): void {
    try {
      // Use the existing backup functionality
      createBackup();
      console.log('Sync backup created');
    } catch (error) {
      console.error('Failed to create sync backup:', error);
    }
  }
  
  /**
   * Broadcast data change event to all components
   */
  private broadcastDataChange(key: string): void {
    // Use native browser events for simple pub/sub
    const event = new CustomEvent('data:changed', {
      detail: { key, timestamp: new Date().toISOString() }
    });
    
    window.dispatchEvent(event);
    this.logSyncEvent('data:changed', 'system', { key });
    console.log(`Data change broadcast for: ${key}`);
  }
  
  /**
   * Log sync events for monitoring and debugging
   */
  private logSyncEvent(type: SyncEventType, source: string, details?: any): void {
    const event: SyncEvent = {
      type,
      timestamp: new Date().toISOString(),
      source,
      details
    };
    
    // Keep log size manageable
    this.syncLog.push(event);
    if (this.syncLog.length > this.MAX_LOG_ENTRIES) {
      this.syncLog = this.syncLog.slice(-this.MAX_LOG_ENTRIES);
    }
    
    // For real implementations, we might send this to a monitoring service
    console.log(`Sync event: ${type}`, details);
  }
  
  /**
   * Get sync log for reporting
   */
  public getSyncLog(): SyncEvent[] {
    return [...this.syncLog];
  }
  
  /**
   * Clear sync log
   */
  public clearSyncLog(): void {
    this.syncLog = [];
  }
  
  /**
   * Get sync statistics for the dashboard
   */
  public getSyncStats(): {
    lastSync: number;
    totalEvents: number;
    failureCount: number;
    syncInProgress: boolean;
    autoSyncEnabled: boolean;
  } {
    const failureCount = this.syncLog.filter(event => event.type === 'sync:failed').length;
    
    return {
      lastSync: this.lastSyncTimestamp,
      totalEvents: this.syncLog.length,
      failureCount,
      syncInProgress: this.syncInProgress,
      autoSyncEnabled: this.intervalId !== null
    };
  }
}

// Create singleton instance
const dataSyncService = new DataSyncService();
export default dataSyncService;

// Custom hook for components to use the sync service
import { useState, useEffect } from 'react';

export function useSyncService() {
  const [syncStats, setSyncStats] = useState(() => dataSyncService.getSyncStats());
  const [isSyncing, setIsSyncing] = useState(false);
  
  useEffect(() => {
    // Update stats when sync events occur
    const updateStats = () => {
      setSyncStats(dataSyncService.getSyncStats());
    };
    
    const handleSyncStart = () => {
      setIsSyncing(true);
      updateStats();
    };
    
    const handleSyncComplete = () => {
      setIsSyncing(false);
      updateStats();
    };
    
    window.addEventListener('sync:started', handleSyncStart);
    window.addEventListener('sync:completed', handleSyncComplete);
    window.addEventListener('sync:failed', handleSyncComplete);
    
    return () => {
      window.removeEventListener('sync:started', handleSyncStart);
      window.removeEventListener('sync:completed', handleSyncComplete);
      window.removeEventListener('sync:failed', handleSyncComplete);
    };
  }, []);
  
  return {
    startAutoSync: () => dataSyncService.startAutoSync(),
    stopAutoSync: () => dataSyncService.stopAutoSync(),
    manualSync: () => dataSyncService.manualSync(),
    setInterval: (ms: number) => dataSyncService.setInterval(ms),
    syncStats,
    isSyncing,
    syncLog: dataSyncService.getSyncLog(),
    clearSyncLog: () => dataSyncService.clearSyncLog()
  };
}
