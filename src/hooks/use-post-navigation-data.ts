import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface PostNavigationDataOptions<T> {
  /** Function to fetch data after navigation */
  fetcher: () => Promise<T>;
  /** Default value while loading */
  defaultValue: T;
  /** Dependency array to trigger refetch */
  dependencies?: any[];
  /** Whether to fetch immediately on mount */
  immediate?: boolean;
}

/**
 * Hook that loads data AFTER navigation is complete
 * This prevents data fetching from blocking route transitions
 */
export function usePostNavigationData<T>({
  fetcher,
  defaultValue,
  dependencies = [],
  immediate = true
}: PostNavigationDataOptions<T>) {
  const location = useLocation();
  const [data, setData] = useState<T>(defaultValue);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const isFirstRender = useRef(true);
  const navigationCompleteRef = useRef(false);

  // Function to load data
  const loadData = async () => {
    if (isLoading) return; // Prevent concurrent fetches
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await fetcher();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      console.error('Post-navigation data fetch failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Listen for navigation completion
  useEffect(() => {
    const handleNavigationComplete = () => {
      navigationCompleteRef.current = true;
      
      // Start data loading only after navigation is complete
      if (immediate) {
        // Small delay to ensure DOM has updated
        setTimeout(loadData, 0);
      }
    };

    window.addEventListener('navigation:completed', handleNavigationComplete);
    
    return () => {
      window.removeEventListener('navigation:completed', handleNavigationComplete);
    };
  }, [immediate, ...dependencies]);

  // On route change, reset navigation complete flag
  useEffect(() => {
    navigationCompleteRef.current = false;
    
    // If this is not the first render and immediate loading is enabled,
    // start loading after a brief delay to allow navigation to complete
    if (!isFirstRender.current && immediate) {
      setTimeout(loadData, 50);
    }
    
    isFirstRender.current = false;
  }, [location.pathname]);

  // Manual refresh function
  const refresh = () => {
    if (navigationCompleteRef.current || !immediate) {
      loadData();
    }
  };

  return {
    data,
    isLoading,
    error,
    refresh,
    navigationComplete: navigationCompleteRef.current
  };
}