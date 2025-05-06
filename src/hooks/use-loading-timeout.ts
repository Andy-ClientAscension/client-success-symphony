
import { useState, useCallback, useEffect, useRef } from 'react';

interface LoadingTimeoutOptions {
  /** Initial timeout in ms before showing initial alert */
  initialTimeout?: number;
  /** Extended timeout in ms before showing critical alert */
  extendedTimeout?: number;
  /** Maximum timeout in ms before auto-completion */
  maxTimeout?: number;
  /** Callback to run on initial timeout */
  onInitialTimeout?: () => void;
  /** Callback to run on extended timeout */
  onExtendedTimeout?: () => void;
  /** Callback to run on max timeout */
  onMaxTimeout?: () => void;
}

/**
 * Hook that manages progressive loading timeouts
 */
export function useLoadingTimeout(options: LoadingTimeoutOptions = {}) {
  const {
    initialTimeout = 3000,
    extendedTimeout = 7000,
    maxTimeout = 15000,
    onInitialTimeout,
    onExtendedTimeout,
    onMaxTimeout
  } = options;
  
  const [timeoutLevel, setTimeoutLevel] = useState<0 | 1 | 2 | 3>(0);
  const initialTimeoutRef = useRef<NodeJS.Timeout>();
  const extendedTimeoutRef = useRef<NodeJS.Timeout>();
  const maxTimeoutRef = useRef<NodeJS.Timeout>();
  
  // Start the timeout sequence
  const startTimeout = useCallback(() => {
    // Reset state
    setTimeoutLevel(0);
    
    // Clear any existing timeouts
    if (initialTimeoutRef.current) clearTimeout(initialTimeoutRef.current);
    if (extendedTimeoutRef.current) clearTimeout(extendedTimeoutRef.current);
    if (maxTimeoutRef.current) clearTimeout(maxTimeoutRef.current);
    
    // Initial timeout - standard warning
    initialTimeoutRef.current = setTimeout(() => {
      setTimeoutLevel(1);
      if (onInitialTimeout) onInitialTimeout();
      
      // Extended timeout - more urgent warning
      extendedTimeoutRef.current = setTimeout(() => {
        setTimeoutLevel(2);
        if (onExtendedTimeout) onExtendedTimeout();
        
        // Max timeout - auto-recovery action
        maxTimeoutRef.current = setTimeout(() => {
          setTimeoutLevel(3);
          if (onMaxTimeout) onMaxTimeout();
        }, maxTimeout - extendedTimeout);
        
      }, extendedTimeout - initialTimeout);
      
    }, initialTimeout);
    
  }, [initialTimeout, extendedTimeout, maxTimeout, onInitialTimeout, onExtendedTimeout, onMaxTimeout]);
  
  // Reset and clear all timeouts
  const resetTimeout = useCallback(() => {
    if (initialTimeoutRef.current) clearTimeout(initialTimeoutRef.current);
    if (extendedTimeoutRef.current) clearTimeout(extendedTimeoutRef.current);
    if (maxTimeoutRef.current) clearTimeout(maxTimeoutRef.current);
    
    setTimeoutLevel(0);
  }, []);
  
  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (initialTimeoutRef.current) clearTimeout(initialTimeoutRef.current);
      if (extendedTimeoutRef.current) clearTimeout(extendedTimeoutRef.current);
      if (maxTimeoutRef.current) clearTimeout(maxTimeoutRef.current);
    };
  }, []);
  
  return {
    timeoutLevel,
    startTimeout,
    resetTimeout
  };
}
