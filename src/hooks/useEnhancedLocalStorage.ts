
import { useState, useEffect, useCallback } from 'react';
import { 
  cacheData, 
  getCachedData, 
  queueOfflineOperation
} from '@/utils/offlineStorage';

/**
 * Enhanced localStorage hook with offline support
 */
export function useEnhancedLocalStorage<T>(
  key: string, 
  initialValue: T,
  syncWithBackend: boolean = false,
  tableName?: string
) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize with data from localStorage or initialValue
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // First check localStorage for immediate response
        const item = localStorage.getItem(key);
        let value: T;
        
        if (item !== null) {
          value = JSON.parse(item);
          setStoredValue(value);
        } 
        
        // Then check localForage for possibly newer data
        const cachedData = await getCachedData<T>(key);
        if (cachedData) {
          value = cachedData.data;
          setStoredValue(value);
        } else if (item === null) {
          // If nothing in localStorage or localForage, use initialValue
          value = initialValue;
          setStoredValue(value);
        }
      } catch (error) {
        console.error(`Error loading data for ${key}:`, error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [key, initialValue]);

  // Save to localStorage and localForage
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function for previous state
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save to React state
      setStoredValue(valueToStore);
      
      // Save to localStorage for immediate access
      localStorage.setItem(key, JSON.stringify(valueToStore));
      
      // Save to localForage for persistence
      cacheData(key, valueToStore);
      
      // If syncWithBackend is enabled, queue offline operation
      if (syncWithBackend && tableName) {
        if (Array.isArray(valueToStore) && Array.isArray(storedValue)) {
          // For arrays, we need to determine what changed
          // This is a simplified approach - in real world you'd need more complex diffing
          if (valueToStore.length > storedValue.length) {
            // Likely an insert
            const newItems = valueToStore.filter(
              (item: any) => !storedValue.some((oldItem: any) => oldItem.id === item.id)
            );
            
            if (newItems.length > 0) {
              newItems.forEach(item => {
                queueOfflineOperation(tableName, 'INSERT', item);
              });
            }
          } else if (valueToStore.length < storedValue.length) {
            // Likely a delete
            const deletedItems = storedValue.filter(
              (oldItem: any) => !valueToStore.some((item: any) => item.id === oldItem.id)
            );
            
            if (deletedItems.length > 0) {
              deletedItems.forEach(item => {
                queueOfflineOperation(tableName, 'DELETE', item);
              });
            }
          } else {
            // Likely updates, but this is a simple example
            // In reality, you'd need to compare each item's properties
            queueOfflineOperation(tableName, 'UPDATE', valueToStore);
          }
        } else {
          // For non-arrays, just queue the whole object as an update
          queueOfflineOperation(tableName, 'UPDATE', valueToStore);
        }
      }
    } catch (error) {
      console.error(`Error setting data for ${key}:`, error);
    }
  }, [key, storedValue, syncWithBackend, tableName]);

  return [storedValue, setValue, isLoading] as const;
}
