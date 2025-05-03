
import { useState, useEffect, useCallback } from 'react';

interface SmartLoadingOptions {
  /** Initial loading state */
  initialState?: boolean;
  /** Minimum loading time in milliseconds to prevent flashing */
  minLoadingTime?: number;
  /** Max time before showing loading state (prevents quick flashes) */
  loadingDelay?: number;
  /** Priority level that affects loading behavior (1-5, 1 is highest) */
  priority?: 1 | 2 | 3 | 4 | 5;
}

/**
 * Smart loading hook that handles loading states with priority and timing logic
 * - Prevents loading flashes for fast operations
 * - Ensures minimum loading time for better UX
 * - Prioritizes critical UI components
 */
export function useSmartLoading(isLoading: boolean, options: SmartLoadingOptions = {}) {
  const {
    initialState = false,
    minLoadingTime = 500,
    loadingDelay = 150,
    priority = 3
  } = options;

  const [showLoading, setShowLoading] = useState(initialState);
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null);
  const [delayTimeout, setDelayTimeout] = useState<NodeJS.Timeout | null>(null);
  const [minTimeTimeout, setMinTimeTimeout] = useState<NodeJS.Timeout | null>(null);

  // Calculate actual delay based on priority
  // Higher priority = shorter delay
  const actualLoadingDelay = loadingDelay * (priority / 3);
  
  // Calculate actual minimum time based on priority
  // Higher priority = shorter minimum time
  const actualMinLoadingTime = priority <= 2 ? minLoadingTime * 0.5 : minLoadingTime;

  // Reset timeouts when component unmounts
  useEffect(() => {
    return () => {
      if (delayTimeout) clearTimeout(delayTimeout);
      if (minTimeTimeout) clearTimeout(minTimeTimeout);
    };
  }, [delayTimeout, minTimeTimeout]);

  // Handle changes to isLoading
  useEffect(() => {
    if (isLoading) {
      // Clear any previous delay timeout
      if (delayTimeout) {
        clearTimeout(delayTimeout);
      }

      // Start a new delay timeout
      const timeout = setTimeout(() => {
        setShowLoading(true);
        setLoadingStartTime(Date.now());
      }, actualLoadingDelay);
      
      setDelayTimeout(timeout);
    } else {
      // Clear any previous delay timeout
      if (delayTimeout) {
        clearTimeout(delayTimeout);
        setDelayTimeout(null);
      }

      // Calculate how much time has passed since loading started
      if (loadingStartTime) {
        const timeElapsed = Date.now() - loadingStartTime;
        
        // If minimum time hasn't elapsed, wait until it has
        if (timeElapsed < actualMinLoadingTime) {
          const remainingTime = actualMinLoadingTime - timeElapsed;
          
          const timeout = setTimeout(() => {
            setShowLoading(false);
            setLoadingStartTime(null);
          }, remainingTime);
          
          setMinTimeTimeout(timeout);
        } else {
          // If minimum time has elapsed, stop showing loading state immediately
          setShowLoading(false);
          setLoadingStartTime(null);
        }
      } else {
        // If loading never really started, just turn it off
        setShowLoading(false);
      }
    }
  }, [isLoading, loadingStartTime, actualLoadingDelay, actualMinLoadingTime]);

  // Force loading state regardless of delay
  const forceShowLoading = useCallback(() => {
    setShowLoading(true);
    setLoadingStartTime(Date.now());
  }, []);

  return { 
    isLoading: showLoading,
    forceShowLoading 
  };
}
