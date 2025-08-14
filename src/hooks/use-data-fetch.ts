/**
 * Data Fetching Utilities
 * Consolidates common data fetching patterns with caching and error handling
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { logger } from '@/utils/logging/logger';
import { storageManager } from '@/utils/storage/storage-manager';

export interface DataFetchOptions<T> {
  cacheKey?: string;
  cacheDuration?: number; // milliseconds
  immediate?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  retry?: {
    attempts: number;
    delay: number;
  };
  dependencies?: any[];
}

export interface DataFetchState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
  isStale: boolean;
  lastFetch: Date | null;
}

export function useDataFetch<T>(
  fetcher: () => Promise<T>,
  options: DataFetchOptions<T> = {}
) {
  const {
    cacheKey,
    cacheDuration = 5 * 60 * 1000, // 5 minutes default
    immediate = true,
    onSuccess,
    onError,
    retry,
    dependencies = []
  } = options;

  const [state, setState] = useState<DataFetchState<T>>({
    data: null,
    isLoading: false,
    error: null,
    isStale: false,
    lastFetch: null
  });

  const isMountedRef = useRef(true);
  const fetchCountRef = useRef(0);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadFromCache = useCallback((): T | null => {
    if (!cacheKey) return null;
    
    try {
      const cached = storageManager.getItem<{
        data: T;
        timestamp: number;
      }>(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < cacheDuration) {
        return cached.data;
      }
    } catch (error) {
      logger.warn('Failed to load from cache', { cacheKey, error });
    }
    
    return null;
  }, [cacheKey, cacheDuration]);

  const saveToCache = useCallback((data: T): void => {
    if (!cacheKey) return;
    
    try {
      storageManager.setItem(cacheKey, {
        data,
        timestamp: Date.now()
      });
    } catch (error) {
      logger.warn('Failed to save to cache', { cacheKey, error });
    }
  }, [cacheKey]);

  const fetchData = useCallback(async (force = false): Promise<T | null> => {
    const currentFetchId = ++fetchCountRef.current;
    
    // Check cache first (unless forced)
    if (!force) {
      const cached = loadFromCache();
      if (cached) {
        setState(prev => ({
          ...prev,
          data: cached,
          isStale: false,
          lastFetch: new Date()
        }));
        return cached;
      }
    }

    if (!isMountedRef.current) return null;

    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null
    }));

    const executeWithRetry = async (attempt: number): Promise<T | null> => {
      try {
        const data = await fetcher();
        
        // Check if this is still the latest fetch
        if (currentFetchId !== fetchCountRef.current || !isMountedRef.current) {
          return null;
        }

        setState(prev => ({
          ...prev,
          data,
          isLoading: false,
          error: null,
          isStale: false,
          lastFetch: new Date()
        }));

        saveToCache(data);
        onSuccess?.(data);
        
        return data;
      } catch (error) {
        if (currentFetchId !== fetchCountRef.current || !isMountedRef.current) {
          return null;
        }

        const errorObj = error instanceof Error ? error : new Error(String(error));

        // Retry logic
        if (retry && attempt <= retry.attempts) {
          logger.info(`Fetch failed, retrying... (${attempt}/${retry.attempts})`, {
            error: errorObj.message
          });
          
          await new Promise(resolve => setTimeout(resolve, retry.delay));
          return executeWithRetry(attempt + 1);
        }

        setState(prev => ({
          ...prev,
          isLoading: false,
          error: errorObj
        }));

        onError?.(errorObj);
        logger.error('Data fetch failed', errorObj);
        
        return null;
      }
    };

    return executeWithRetry(1);
  }, [fetcher, loadFromCache, saveToCache, onSuccess, onError, retry]);

  const refresh = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  const invalidateCache = useCallback(() => {
    if (cacheKey) {
      storageManager.removeItem(cacheKey);
      setState(prev => ({ ...prev, isStale: true }));
    }
  }, [cacheKey]);

  // Auto-fetch on mount and dependency changes
  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [immediate, ...dependencies]);

  // Mark data as stale after cache duration
  useEffect(() => {
    if (state.lastFetch && cacheDuration > 0) {
      const timeout = setTimeout(() => {
        if (isMountedRef.current) {
          setState(prev => ({ ...prev, isStale: true }));
        }
      }, cacheDuration);

      return () => clearTimeout(timeout);
    }
  }, [state.lastFetch, cacheDuration]);

  return {
    ...state,
    fetch: fetchData,
    refresh,
    invalidateCache,
    isReady: state.data !== null && !state.isLoading
  };
}

/**
 * Hook for managing lists with common operations
 */
export function useListData<T extends { id: string }>(
  fetcher: () => Promise<T[]>,
  options: DataFetchOptions<T[]> = {}
) {
  const [localState, setLocalState] = useState<DataFetchState<T[]>>({
    data: null,
    isLoading: false,
    error: null,
    isStale: false,
    lastFetch: null
  });

  const dataFetch = useDataFetch(fetcher, {
    ...options,
    onSuccess: (data) => {
      setLocalState(prev => ({ ...prev, data }));
      options.onSuccess?.(data);
    }
  });

  // Sync with dataFetch state
  useEffect(() => {
    setLocalState(dataFetch);
  }, [dataFetch.data, dataFetch.isLoading, dataFetch.error, dataFetch.isStale, dataFetch.lastFetch]);

  const addItem = useCallback((item: T) => {
    setLocalState(prev => ({
      ...prev,
      data: prev.data ? [...prev.data, item] : [item]
    }));
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<T>) => {
    setLocalState(prev => ({
      ...prev,
      data: prev.data?.map(item => 
        item.id === id ? { ...item, ...updates } : item
      ) || null
    }));
  }, []);

  const removeItem = useCallback((id: string) => {
    setLocalState(prev => ({
      ...prev,
      data: prev.data?.filter(item => item.id !== id) || null
    }));
  }, []);

  const findItem = useCallback((id: string): T | undefined => {
    return localState.data?.find(item => item.id === id);
  }, [localState.data]);

  return {
    ...localState,
    fetch: dataFetch.fetch,
    refresh: dataFetch.refresh,
    invalidateCache: dataFetch.invalidateCache,
    isReady: localState.data !== null && !localState.isLoading,
    items: localState.data || [],
    addItem,
    updateItem,
    removeItem,
    findItem,
    count: localState.data?.length || 0
  };
}