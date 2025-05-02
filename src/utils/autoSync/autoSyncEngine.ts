import { dataSyncService } from "@/utils/dataSyncService";
import { errorService } from "@/utils/error";
import { enhancedStorage } from "@/utils/storageUtils";

// Types for the sync engine
export interface SyncConfig {
  frequency: 'real-time' | 'interval' | 'manual';
  scope: 'full_dataset' | 'partial' | 'delta_only';
  updateStrategy: 'atomic_transactions' | 'incremental' | 'priority_based';
}

export interface SyncMetrics {
  lastSuccessfulSync: Date | null;
  lastFailedSync: Date | null;
  totalSuccessfulSyncs: number;
  totalFailedSyncs: number;
  averageSyncTime: number; // in ms
  syncHistory: SyncEvent[];
}

export interface SyncEvent {
  timestamp: Date;
  type: 'success' | 'failure' | 'partial' | 'manual' | 'auto';
  duration: number; // in ms
  affectedResources: string[];
  dataSourceVersion?: string;
  errorDetails?: string;
}

export interface ConsistencyCheckResult {
  passed: boolean;
  timestamp: Date;
  checksumMatch: boolean;
  validationErrors: string[];
}

class AutoSyncEngine {
  private config: SyncConfig = {
    frequency: 'interval',
    scope: 'full_dataset',
    updateStrategy: 'atomic_transactions'
  };
  private metrics: SyncMetrics = {
    lastSuccessfulSync: null,
    lastFailedSync: null,
    totalSuccessfulSyncs: 0,
    totalFailedSyncs: 0,
    averageSyncTime: 0,
    syncHistory: []
  };
  private syncIntervalId: number | null = null;
  private retryTimeoutId: number | null = null;
  private isInitialized = false;
  private isSyncing = false;
  private maxRetries = 3;
  private currentRetry = 0;
  private dataHashes: Record<string, string> = {};
  private listeners: Array<(syncState: { isSyncing: boolean; lastSync: Date | null }) => void> = [];

  constructor() {
    // Load any persisted metrics or configuration
    this.loadPersistedState();
  }

  private loadPersistedState(): void {
    try {
      const persistedConfig = enhancedStorage.getItem('autoSyncConfig');
      const persistedMetrics = enhancedStorage.getItem('autoSyncMetrics');

      if (persistedConfig) {
        this.config = { ...this.config, ...JSON.parse(persistedConfig) };
      }

      if (persistedMetrics) {
        const parsedMetrics = JSON.parse(persistedMetrics);
        
        // Convert string timestamps back to Date objects
        if (parsedMetrics.lastSuccessfulSync) {
          parsedMetrics.lastSuccessfulSync = new Date(parsedMetrics.lastSuccessfulSync);
        }
        if (parsedMetrics.lastFailedSync) {
          parsedMetrics.lastFailedSync = new Date(parsedMetrics.lastFailedSync);
        }
        
        parsedMetrics.syncHistory = (parsedMetrics.syncHistory || []).map((event: any) => ({
          ...event,
          timestamp: new Date(event.timestamp)
        }));
        
        this.metrics = { ...this.metrics, ...parsedMetrics };
      }
    } catch (error) {
      console.error('Error loading persisted sync state:', error);
      // Continue with defaults if there's an error
    }
  }

  private persistState(): void {
    try {
      enhancedStorage.setItem('autoSyncConfig', JSON.stringify(this.config));
      enhancedStorage.setItem('autoSyncMetrics', JSON.stringify(this.metrics));
    } catch (error) {
      console.error('Error persisting sync state:', error);
    }
  }

  public initialize(): void {
    if (this.isInitialized) return;
    
    console.log('AutoSyncEngine: Initializing...');
    
    // Set up window focus/blur listeners for real-time sync
    window.addEventListener('focus', this.handleWindowFocus);
    
    // Set up online/offline listeners
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
    
    // Initialize data hashes
    this.initializeDataHashes();
    
    // Start the sync interval if configured
    this.startSyncInterval();
    
    // Perform initial sync
    this.performSync();
    
    this.isInitialized = true;
    console.log('AutoSyncEngine: Initialized');
  }

  public shutdown(): void {
    if (!this.isInitialized) return;
    
    console.log('AutoSyncEngine: Shutting down...');
    
    // Remove event listeners
    window.removeEventListener('focus', this.handleWindowFocus);
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
    
    // Clear intervals and timeouts
    if (this.syncIntervalId !== null) {
      clearInterval(this.syncIntervalId);
      this.syncIntervalId = null;
    }
    
    if (this.retryTimeoutId !== null) {
      clearTimeout(this.retryTimeoutId);
      this.retryTimeoutId = null;
    }
    
    // Persist final state
    this.persistState();
    
    this.isInitialized = false;
    console.log('AutoSyncEngine: Shut down');
  }

  private initializeDataHashes(): void {
    // Create initial hashes of the different data sources
    const dataSources = ['clients', 'metrics', 'settings', 'user-preferences'];
    
    dataSources.forEach(source => {
      const data = dataSyncService.loadData(source, null);
      if (data) {
        this.dataHashes[source] = this.generateHash(data);
      }
    });
  }

  private generateHash(data: any): string {
    // Simple hash function for demo purposes
    // In production, use a proper cryptographic hash like SHA-256
    try {
      const str = JSON.stringify(data);
      return str.split('').reduce((hash, char) => {
        return ((hash << 5) - hash) + char.charCodeAt(0) | 0;
      }, 0).toString(36);
    } catch (e) {
      console.error('Error generating hash:', e);
      return '';
    }
  }

  private startSyncInterval(): void {
    if (this.syncIntervalId !== null) {
      clearInterval(this.syncIntervalId);
    }
    
    // Default to 30 seconds if real-time, 5 minutes if interval
    const interval = this.config.frequency === 'real-time' ? 30000 : 300000;
    
    this.syncIntervalId = window.setInterval(() => {
      this.performSync();
    }, interval);
    
    console.log(`AutoSyncEngine: Started sync interval (${interval}ms)`);
  }

  public setConfig(config: Partial<SyncConfig>): void {
    this.config = { ...this.config, ...config };
    
    // Apply the new config (may restart interval with new frequency)
    if (this.isInitialized) {
      this.startSyncInterval();
    }
    
    this.persistState();
  }

  private handleWindowFocus = (): void => {
    if (this.config.frequency === 'real-time') {
      console.log('AutoSyncEngine: Window focus detected, triggering sync');
      this.performSync();
    }
  };

  private handleOnline = (): void => {
    console.log('AutoSyncEngine: Online connection restored, triggering sync');
    // Reset retry counter when connection is restored
    this.currentRetry = 0;
    this.performSync();
  };

  private handleOffline = (): void => {
    console.log('AutoSyncEngine: Offline detected, pausing automatic syncs');
    // We don't need to do anything specific, since sync operations will fail
    // and trigger the retry mechanism when offline
  };

  public async performSync(isManual: boolean = false): Promise<boolean> {
    if (this.isSyncing) {
      console.log('AutoSyncEngine: Sync already in progress, skipping');
      return false;
    }
    
    // Check if we're online before attempting sync
    if (!navigator.onLine) {
      console.log('AutoSyncEngine: Offline, cannot perform sync');
      return false;
    }
    
    this.isSyncing = true;
    let success = false;
    const startTime = performance.now();
    const affectedResources: string[] = [];
    
    try {
      console.log(`AutoSyncEngine: Starting ${isManual ? 'manual' : 'automatic'} sync`);
      this.notifyListeners();
      
      // Pre-sync consistency check
      const preCheckResult = await this.performConsistencyCheck('pre');
      if (!preCheckResult.passed) {
        console.warn('AutoSyncEngine: Pre-sync consistency check failed', preCheckResult.validationErrors);
      }
      
      // Get datasets that need syncing
      const syncResults = await this.syncAllData();
      success = syncResults.success;
      affectedResources.push(...syncResults.affectedResources);
      
      if (success) {
        // Post-sync consistency check
        const postCheckResult = await this.performConsistencyCheck('post');
        if (!postCheckResult.passed) {
          console.warn('AutoSyncEngine: Post-sync consistency check failed, but sync completed', 
            postCheckResult.validationErrors);
        }
        
        this.metrics.lastSuccessfulSync = new Date();
        this.metrics.totalSuccessfulSyncs++;
        this.currentRetry = 0; // Reset retry counter on success
      } else {
        throw new Error('Sync operation failed');
      }
    } catch (error) {
      success = false;
      this.metrics.lastFailedSync = new Date();
      this.metrics.totalFailedSyncs++;
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('AutoSyncEngine: Sync failed', errorMessage);
      
      // Handle retry logic
      if (this.currentRetry < this.maxRetries) {
        this.currentRetry++;
        const retryDelay = Math.pow(2, this.currentRetry) * 1000; // Exponential backoff
        
        console.log(`AutoSyncEngine: Scheduling retry ${this.currentRetry}/${this.maxRetries} in ${retryDelay}ms`);
        
        if (this.retryTimeoutId !== null) {
          clearTimeout(this.retryTimeoutId);
        }
        
        this.retryTimeoutId = window.setTimeout(() => {
          this.performSync();
        }, retryDelay);
      } else {
        // Maximum retries reached
        const errorDetails = error instanceof Error ? error.message : 'Unknown sync error';
        this.logSyncFailure(errorDetails);
        this.currentRetry = 0; // Reset for next time
      }
    } finally {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Record sync event
      const syncEvent: SyncEvent = {
        timestamp: new Date(),
        type: success ? (isManual ? 'manual' : 'auto') : 'failure',
        duration,
        affectedResources,
        errorDetails: success ? undefined : 'Sync failed'
      };
      
      this.metrics.syncHistory.push(syncEvent);
      
      // Keep history size reasonable
      if (this.metrics.syncHistory.length > 100) {
        this.metrics.syncHistory = this.metrics.syncHistory.slice(-100);
      }
      
      // Update average sync time
      if (success) {
        const totalTime = this.metrics.averageSyncTime * (this.metrics.totalSuccessfulSyncs - 1) + duration;
        this.metrics.averageSyncTime = totalTime / this.metrics.totalSuccessfulSyncs;
      }
      
      this.persistState();
      this.isSyncing = false;
      this.notifyListeners();
      
      console.log(`AutoSyncEngine: Sync ${success ? 'completed' : 'failed'} in ${duration.toFixed(2)}ms`);
    }
    
    return success;
  }

  private async syncAllData(): Promise<{ success: boolean; affectedResources: string[] }> {
    // Using the dataSyncService to perform the actual sync
    try {
      const success = await dataSyncService.manualSync();
      
      // Check which data sources were affected by comparing hashes
      const affectedResources: string[] = [];
      const dataSources = ['clients', 'metrics', 'settings', 'user-preferences'];
      
      dataSources.forEach(source => {
        const data = dataSyncService.loadData(source, null);
        if (data) {
          const newHash = this.generateHash(data);
          if (this.dataHashes[source] !== newHash) {
            affectedResources.push(source);
            this.dataHashes[source] = newHash;
          }
        }
      });
      
      return { success, affectedResources };
    } catch (error) {
      console.error('Error during data sync:', error);
      return { success: false, affectedResources: [] };
    }
  }

  private async performConsistencyCheck(stage: 'pre' | 'post'): Promise<ConsistencyCheckResult> {
    try {
      console.log(`AutoSyncEngine: Performing ${stage}-sync consistency check`);
      
      // In a real implementation, this would perform actual data validation
      // Here we'll simulate a check that always passes
      const result: ConsistencyCheckResult = {
        passed: true,
        timestamp: new Date(),
        checksumMatch: true,
        validationErrors: []
      };
      
      return result;
    } catch (error) {
      console.error(`AutoSyncEngine: ${stage}-sync consistency check failed`, error);
      return {
        passed: false,
        timestamp: new Date(),
        checksumMatch: false,
        validationErrors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  private logSyncFailure(details: string): void {
    try {
      console.error('AutoSyncEngine: Critical sync failure', details);
      
      // In a production app, this would send an alert via webhook/email
      // For demo purposes, we'll just log it
      errorService.captureError(new Error(`Sync failure: ${details}`), {
        severity: 'medium',
        context: {
          metrics: this.metrics,
          retries: this.currentRetry
        }
      });
    } catch (error) {
      console.error('Error logging sync failure:', error);
    }
  }

  public getMetrics(): SyncMetrics {
    return { ...this.metrics };
  }

  public getStatus(): { isSyncing: boolean; lastSync: Date | null } {
    return {
      isSyncing: this.isSyncing,
      lastSync: this.metrics.lastSuccessfulSync
    };
  }

  public subscribe(callback: (syncState: { isSyncing: boolean; lastSync: Date | null }) => void): () => void {
    this.listeners.push(callback);
    
    // Immediately call with current state
    callback(this.getStatus());
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  private notifyListeners(): void {
    const status = this.getStatus();
    this.listeners.forEach(listener => {
      try {
        listener(status);
      } catch (error) {
        console.error('Error in sync listener callback:', error);
      }
    });
  }
}

// Export a singleton instance
export const autoSyncEngine = new AutoSyncEngine();

// Initialize on load, but only in browser environment
if (typeof window !== 'undefined') {
  // Defer initialization to avoid blocking the main thread during page load
  window.setTimeout(() => {
    autoSyncEngine.initialize();
  }, 0);
}
