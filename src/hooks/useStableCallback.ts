import { useRef, useCallback } from 'react';

/**
 * Creates a stable callback that doesn't change on re-renders
 * Useful for preventing infinite re-renders in useEffect dependencies
 */
export function useStableCallback<T extends (...args: any[]) => any>(callback: T): T {
  const callbackRef = useRef<T>(callback);
  
  // Update the ref when callback changes
  callbackRef.current = callback;
  
  // Return a stable function that calls the latest callback
  return useCallback((...args: any[]) => {
    return callbackRef.current(...args);
  }, []) as T;
}