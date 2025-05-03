
import localforage from 'localforage';
import { v4 as uuidv4 } from 'uuid';

// Configure localforage
localforage.config({
  name: 'client-success-app',
  storeName: 'offline_storage'
});

// Define offline queue item structure
export interface OfflineQueueItem {
  id: string;
  table: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  data: any;
  timestamp: string;
}

// Initialize separate instances for different types of data
export const dataCache = localforage.createInstance({
  name: 'client-success-app',
  storeName: 'data_cache'
});

export const offlineQueue = localforage.createInstance({
  name: 'client-success-app',
  storeName: 'offline_mutations'
});

/**
 * Store data in local cache
 * @param key Cache key
 * @param data Data to cache
 */
export async function cacheData(key: string, data: any): Promise<void> {
  try {
    await dataCache.setItem(key, {
      data,
      cachedAt: new Date().toISOString()
    });
    console.log(`Data cached for key: ${key}`);
  } catch (error) {
    console.error(`Error caching data for ${key}:`, error);
  }
}

/**
 * Get data from local cache
 * @param key Cache key
 * @returns Cached data or null if not found
 */
export async function getCachedData<T>(key: string): Promise<{ data: T; cachedAt: string } | null> {
  try {
    return await dataCache.getItem<{ data: T; cachedAt: string }>(key);
  } catch (error) {
    console.error(`Error retrieving cached data for ${key}:`, error);
    return null;
  }
}

/**
 * Add mutation to offline queue for later sync
 */
export async function queueOfflineOperation(
  table: string,
  operation: 'INSERT' | 'UPDATE' | 'DELETE',
  data: any
): Promise<string> {
  try {
    const item: OfflineQueueItem = {
      id: uuidv4(),
      table,
      operation,
      data,
      timestamp: new Date().toISOString()
    };
    
    await offlineQueue.setItem(item.id, item);
    console.log(`Offline operation queued for ${table}:`, operation);
    
    // Dispatch event so other components can update UI accordingly
    window.dispatchEvent(new CustomEvent('offlineOperationQueued', { 
      detail: { operation, table } 
    }));
    
    return item.id;
  } catch (error) {
    console.error(`Error queuing offline operation for ${table}:`, error);
    throw error;
  }
}

/**
 * Get all pending offline operations
 */
export async function getPendingOperations(): Promise<OfflineQueueItem[]> {
  const operations: OfflineQueueItem[] = [];
  
  try {
    await offlineQueue.iterate<OfflineQueueItem, void>((value) => {
      operations.push(value);
    });
    
    // Sort by timestamp to ensure operations are processed in order
    return operations.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  } catch (error) {
    console.error('Error getting pending offline operations:', error);
    return [];
  }
}

/**
 * Remove operation from queue after successful sync
 */
export async function removeFromQueue(id: string): Promise<void> {
  try {
    await offlineQueue.removeItem(id);
  } catch (error) {
    console.error(`Error removing operation ${id} from queue:`, error);
  }
}

/**
 * Clear all completed operations
 */
export async function clearCompletedOperations(ids: string[]): Promise<void> {
  try {
    for (const id of ids) {
      await offlineQueue.removeItem(id);
    }
    console.log(`Cleared ${ids.length} completed operations`);
  } catch (error) {
    console.error('Error clearing completed operations:', error);
  }
}

/**
 * Clear all cached data (useful for logout)
 */
export async function clearCache(): Promise<void> {
  try {
    await dataCache.clear();
    console.log('Cache cleared');
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
}
