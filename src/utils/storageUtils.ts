
/**
 * Utility functions for safely working with browser storage
 */

// Maximum storage item size (in bytes) - browser limits vary but 5MB is a common limit
const MAX_STORAGE_ITEM_SIZE = 5 * 1024 * 1024; 

/**
 * Safely set an item in localStorage with error handling for quota issues
 */
export function safeSetItem(key: string, value: string): boolean {
  try {
    // Check item size before attempting to store
    if (value.length > MAX_STORAGE_ITEM_SIZE) {
      console.warn(`Storage item '${key}' exceeds safe size limit (${value.length} bytes)`);
      return false;
    }

    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    if (error instanceof Error) {
      // Handle quota exceeded errors
      if (error.name === 'QuotaExceededError' || 
          // Safari throws a different error
          error.message.includes('exceeded the quota')) {
        console.warn(`Storage quota exceeded for key: ${key}. Using in-memory fallback.`);
        // Could implement in-memory fallback here
        return false;
      }
      
      // Log other errors
      console.error(`Error saving data for key: ${key}`, error);
    }
    return false;
  }
}

/**
 * Safely get an item from localStorage with error handling
 */
export function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.error(`Error retrieving data for key: ${key}`, error);
    return null;
  }
}

/**
 * Try to free up space in localStorage by removing non-essential items
 */
export function tryFreeUpStorage(): boolean {
  try {
    // List of non-critical keys that can be removed if needed
    const nonEssentialKeys = ['backupData', 'clientBackup', 'debugLogs'];
    
    // Remove them one by one
    for (const key of nonEssentialKeys) {
      if (localStorage.getItem(key)) {
        console.log(`Removing non-essential storage key: ${key} to free up space`);
        localStorage.removeItem(key);
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error while trying to free up storage space', error);
    return false;
  }
}

// Centralized storage access with in-memory fallback for quota issues
const memoryFallbackStorage = new Map<string, string>();

/**
 * Enhanced storage interface that falls back to memory when localStorage fails
 */
export const enhancedStorage = {
  setItem(key: string, value: string): void {
    const storedSuccessfully = safeSetItem(key, value);
    if (!storedSuccessfully) {
      // If storage failed, try to free up space and retry
      if (tryFreeUpStorage()) {
        const retrySuccessful = safeSetItem(key, value);
        if (!retrySuccessful) {
          // If still fails, use memory fallback
          memoryFallbackStorage.set(key, value);
        }
      } else {
        // Use memory fallback
        memoryFallbackStorage.set(key, value);
      }
    }
  },
  
  getItem(key: string): string | null {
    // First try localStorage
    const storedValue = safeGetItem(key);
    
    // Fall back to memory if not in localStorage
    if (storedValue === null && memoryFallbackStorage.has(key)) {
      return memoryFallbackStorage.get(key) || null;
    }
    
    return storedValue;
  },
  
  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing data for key: ${key}`, error);
    }
    memoryFallbackStorage.delete(key);
  }
};

