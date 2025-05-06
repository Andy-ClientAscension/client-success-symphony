import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { useToast } from './use-toast';

// Types for the timeout coordinator
interface TimeoutCoordinatorContextType {
  startTimeout: (id: string | number, delay: number, options?: TimeoutOptions) => string;
  clearTimeout: (id: string) => void;
  clearHierarchy: (parentId: string) => void;
  getActiveTimeouts: () => string[];
}

// Options for creating timeouts
interface TimeoutOptions {
  onTimeout?: () => void;
  description?: string;
  parentId?: string;
  priority?: number;
}

// Timeout item structure
interface TimeoutItem {
  id: string;
  timerId: number;
  delay: number;
  startTime: number;
  expiryTime: number;
  parentId?: string;
  options?: TimeoutOptions;
  priority: number;
  description?: string;
}

// Create context with default values
const TimeoutCoordinatorContext = createContext<TimeoutCoordinatorContextType>({
  startTimeout: () => '',
  clearTimeout: () => {},
  clearHierarchy: () => {},
  getActiveTimeouts: () => [],
});

/**
 * Provider component for timeout coordination
 */
export function TimeoutCoordinatorProvider({ children }: { children: React.ReactNode }) {
  const [timeouts, setTimeouts] = useState<Record<string, TimeoutItem>>({});
  const timeoutsRef = useRef<Record<string, TimeoutItem>>({});
  const { toast } = useToast();
  
  // Helper to generate unique IDs
  const generateTimeoutId = useCallback(() => {
    return `timeout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);
  
  // Start a new timeout
  const startTimeout = useCallback((idOrDelay: string | number, delayOrOptions?: number | TimeoutOptions, optionsArg?: TimeoutOptions) => {
    // Handle different argument patterns
    let id: string;
    let delay: number;
    let options: TimeoutOptions | undefined;
    
    // If first argument is a number, it's the delay (legacy API support)
    if (typeof idOrDelay === 'number') {
      delay = idOrDelay;
      options = typeof delayOrOptions === 'object' ? delayOrOptions : {};
      id = generateTimeoutId();
    } 
    // Otherwise, it's the ID
    else {
      id = idOrDelay;
      delay = typeof delayOrOptions === 'number' ? delayOrOptions : 5000;
      options = optionsArg;
    }
    
    // Clear any existing timeout with this ID
    if (timeoutsRef.current[id]) {
      window.clearTimeout(timeoutsRef.current[id].timerId);
    }
    
    // Create the timer
    const startTime = Date.now();
    const expiryTime = startTime + delay;
    
    const timerId = window.setTimeout(() => {
      // When timeout completes, run the callback if provided
      if (options?.onTimeout) {
        options.onTimeout();
      }
      
      // Show toast if description is provided
      if (options?.description) {
        toast({
          title: 'Operation Timeout',
          description: options.description
        });
      }
      
      // Clean up this timeout
      clearTimeout(id);
    }, delay);
    
    // Create new timeout object
    const timeoutItem: TimeoutItem = {
      id,
      timerId,
      delay,
      startTime,
      expiryTime,
      parentId: options?.parentId,
      options,
      priority: options?.priority || 0,
      description: options?.description,
    };
    
    // Update state and ref
    setTimeouts(prev => ({
      ...prev,
      [id]: timeoutItem
    }));
    
    timeoutsRef.current = {
      ...timeoutsRef.current,
      [id]: timeoutItem
    };
    
    return id;
  }, [generateTimeoutId, toast]);
  
  // Clear a specific timeout
  const clearTimeout = useCallback((id: string) => {
    if (timeoutsRef.current[id]) {
      window.clearTimeout(timeoutsRef.current[id].timerId);
      
      // Remove from state
      setTimeouts(prev => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
      
      // Remove from ref
      const updatedTimeouts = { ...timeoutsRef.current };
      delete updatedTimeouts[id];
      timeoutsRef.current = updatedTimeouts;
    }
  }, []);
  
  // Clear a timeout hierarchy (parent and all its children)
  const clearHierarchy = useCallback((parentId: string) => {
    // Clear the parent first
    clearTimeout(parentId);
    
    // Find and clear all children
    Object.values(timeoutsRef.current).forEach(timeout => {
      if (timeout.parentId === parentId) {
        clearTimeout(timeout.id);
      }
    });
  }, [clearTimeout]);
  
  // Get a list of all active timeout IDs
  const getActiveTimeouts = useCallback(() => {
    return Object.keys(timeoutsRef.current);
  }, []);
  
  return (
    <TimeoutCoordinatorContext.Provider 
      value={{ 
        startTimeout, 
        clearTimeout, 
        clearHierarchy,
        getActiveTimeouts 
      }}
    >
      {children}
    </TimeoutCoordinatorContext.Provider>
  );
}

/**
 * Hook to use the timeout coordinator
 */
export function useTimeoutCoordinator() {
  const context = useContext(TimeoutCoordinatorContext);
  
  if (context === undefined) {
    throw new Error('useTimeoutCoordinator must be used within a TimeoutCoordinatorProvider');
  }
  
  return context;
}

/**
 * Hook that creates a coordinated timeout with specified options
 */
export function useCoordinatedTimeout(id?: string, options?: TimeoutOptions) {
  const { startTimeout, clearTimeout, clearHierarchy } = useTimeoutCoordinator();
  const [timeoutId, setTimeoutId] = useState<string | null>(null);
  
  // Start a timeout with the given delay
  const startTimeoutFn = useCallback((delay: number) => {
    const newId = id || `coordinated_${Date.now()}`;
    const timeoutId = startTimeout(newId, delay, options);
    setTimeoutId(timeoutId);
    return timeoutId;
  }, [id, options, startTimeout]);
  
  // Custom clear that also updates local state
  const clearTimeoutFn = useCallback(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
  }, [timeoutId, clearTimeout]);
  
  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId, clearTimeout]);
  
  return {
    startTimeout: startTimeoutFn,
    clearTimeout: clearTimeoutFn,
    clearHierarchy,
    timeoutId
  };
}
