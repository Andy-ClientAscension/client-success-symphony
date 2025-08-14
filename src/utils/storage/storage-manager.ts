/**
 * Unified Storage Manager
 * Consolidates all localStorage/sessionStorage patterns with error handling
 */

import { secureStorage } from './secure-storage';
import { STORAGE_KEYS } from '../constants/app-constants';
import { logger } from '../logging/logger';

export interface StorageOptions {
  encrypt?: boolean;
  expiry?: number; // milliseconds
  fallback?: any;
  validate?: (value: any) => boolean;
}

class StorageManager {
  /**
   * Get item from storage with error handling and validation
   */
  getItem<T = any>(key: string, options: StorageOptions = {}): T | null {
    const { encrypt = false, fallback = null, validate } = options;
    
    try {
      const item = encrypt 
        ? secureStorage.getSecureItem<T>(key)
        : secureStorage.getItem<T>(key);
      
      if (item === null) return fallback;
      
      // Check expiry if set
      if (options.expiry && this.isExpired(key)) {
        this.removeItem(key);
        return fallback;
      }
      
      // Validate if validator provided
      if (validate && !validate(item)) {
        logger.warn(`Invalid data found in storage for key: ${key}`, { item });
        this.removeItem(key);
        return fallback;
      }
      
      return item;
    } catch (error) {
      logger.error(`Failed to get item from storage: ${key}`, error);
      return fallback;
    }
  }

  /**
   * Set item in storage with optional encryption and expiry
   */
  setItem<T = any>(key: string, value: T, options: StorageOptions = {}): boolean {
    const { encrypt = false, expiry } = options;
    
    try {
      if (encrypt) {
        secureStorage.setSecureItem(key, value);
      } else {
        secureStorage.setItem(key, value);
      }
      
      // Set expiry metadata if specified
      if (expiry) {
        this.setExpiry(key, expiry);
      }
      
      return true;
    } catch (error) {
      logger.error(`Failed to set item in storage: ${key}`, error);
      return false;
    }
  }

  /**
   * Update item in storage (merge with existing data)
   */
  updateItem<T extends Record<string, any>>(
    key: string, 
    updates: Partial<T>, 
    options: StorageOptions = {}
  ): boolean {
    try {
      const existing = this.getItem<T>(key, options) || {} as T;
      const merged = { ...existing, ...updates };
      return this.setItem(key, merged, options);
    } catch (error) {
      logger.error(`Failed to update item in storage: ${key}`, error);
      return false;
    }
  }

  /**
   * Array operations for storage
   */
  pushToArray<T = any>(key: string, item: T, options: StorageOptions = {}): boolean {
    try {
      const array = this.getItem<T[]>(key, { ...options, fallback: [] });
      array.push(item);
      return this.setItem(key, array, options);
    } catch (error) {
      logger.error(`Failed to push to array in storage: ${key}`, error);
      return false;
    }
  }

  filterArray<T = any>(
    key: string, 
    predicate: (item: T) => boolean, 
    options: StorageOptions = {}
  ): boolean {
    try {
      const array = this.getItem<T[]>(key, { ...options, fallback: [] });
      const filtered = array.filter(predicate);
      return this.setItem(key, filtered, options);
    } catch (error) {
      logger.error(`Failed to filter array in storage: ${key}`, error);
      return false;
    }
  }

  /**
   * Remove item from storage
   */
  removeItem(key: string): boolean {
    try {
      secureStorage.removeItem(key);
      this.removeExpiry(key);
      return true;
    } catch (error) {
      logger.error(`Failed to remove item from storage: ${key}`, error);
      return false;
    }
  }

  /**
   * Clear all storage (with optional prefix filter)
   */
  clear(prefix?: string): boolean {
    try {
      if (prefix) {
        // Clear only items with specific prefix
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith(prefix)) {
            localStorage.removeItem(key);
          }
        });
      } else {
        secureStorage.clear();
      }
      return true;
    } catch (error) {
      logger.error('Failed to clear storage', error);
      return false;
    }
  }

  /**
   * Get storage usage stats
   */
  getStorageStats(): { used: number; available: number; percentage: number } {
    try {
      let used = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += localStorage[key].length + key.length;
        }
      }
      
      const available = 5 * 1024 * 1024; // Approximate 5MB limit
      const percentage = (used / available) * 100;
      
      return { used, available, percentage };
    } catch (error) {
      logger.error('Failed to get storage stats', error);
      return { used: 0, available: 0, percentage: 0 };
    }
  }

  // Private helper methods
  private setExpiry(key: string, expiry: number): void {
    const expiryKey = `${key}_expiry`;
    const expiryTime = Date.now() + expiry;
    localStorage.setItem(expiryKey, expiryTime.toString());
  }

  private isExpired(key: string): boolean {
    const expiryKey = `${key}_expiry`;
    const expiryTime = localStorage.getItem(expiryKey);
    
    if (!expiryTime) return false;
    
    return Date.now() > parseInt(expiryTime, 10);
  }

  private removeExpiry(key: string): void {
    const expiryKey = `${key}_expiry`;
    localStorage.removeItem(expiryKey);
  }
}

// Predefined storage operations for common patterns
export class AutomationStorageManager extends StorageManager {
  getWebhooks() {
    return this.getItem(STORAGE_KEYS.AUTOMATION_WEBHOOKS, {
      fallback: [],
      validate: Array.isArray
    });
  }

  setWebhooks(webhooks: any[]) {
    return this.setItem(STORAGE_KEYS.AUTOMATION_WEBHOOKS, webhooks);
  }

  addWebhook(webhook: any) {
    return this.pushToArray(STORAGE_KEYS.AUTOMATION_WEBHOOKS, webhook);
  }

  removeWebhook(webhookId: string) {
    return this.filterArray(
      STORAGE_KEYS.AUTOMATION_WEBHOOKS,
      (webhook: any) => webhook.id !== webhookId
    );
  }
}

export class UserPreferencesManager extends StorageManager {
  getDashboardConfig(userId: string) {
    return this.getItem(`dashboard-config-${userId}`, {
      fallback: {},
      encrypt: false
    });
  }

  setDashboardConfig(userId: string, config: any) {
    return this.setItem(`dashboard-config-${userId}`, config);
  }

  getDismissedAlerts() {
    return this.getItem(STORAGE_KEYS.DISMISSED_ALERTS, {
      fallback: {},
      encrypt: true
    });
  }

  dismissAlert(alertId: string) {
    return this.updateItem(STORAGE_KEYS.DISMISSED_ALERTS, { [alertId]: true }, {
      encrypt: true
    });
  }
}

// Export singleton instances
export const storageManager = new StorageManager();
export const automationStorage = new AutomationStorageManager();
export const userPreferences = new UserPreferencesManager();