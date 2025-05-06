
import { useEffect, useRef, useContext, createContext, useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

// Define the context for timeout coordination
interface TimeoutCoordinatorContextType {
  registerTimeout: (id: string, clearFn: () => void, parentId?: string) => void;
  unregisterTimeout: (id: string) => void;
  clearHierarchy: (id: string) => void;
  clearAll: () => void;
  activeTimeouts: Map<string, { clearFn: () => void, children: string[] }>;
}

const TimeoutCoordinatorContext = createContext<TimeoutCoordinatorContextType | null>(null);

// Provider component for timeout coordination
export function TimeoutCoordinatorProvider({ children }: { children: React.ReactNode }) {
  // Store timeout hierarchy
  const timeoutsRef = useRef<Map<string, { clearFn: () => void, children: string[], parentId?: string }>>(new Map());
  const [activeTimeoutCount, setActiveTimeoutCount] = useState(0);
  
  // Register a timeout with optional parent
  const registerTimeout = useCallback((id: string, clearFn: () => void, parentId?: string) => {
    if (!timeoutsRef.current.has(id)) {
      timeoutsRef.current.set(id, { clearFn, children: [], parentId });
      
      // Add as child to parent if specified
      if (parentId && timeoutsRef.current.has(parentId)) {
        const parent = timeoutsRef.current.get(parentId);
        if (parent) {
          parent.children.push(id);
          timeoutsRef.current.set(parentId, parent);
        }
      }
      
      setActiveTimeoutCount(count => count + 1);
    }
  }, []);
  
  // Unregister a timeout
  const unregisterTimeout = useCallback((id: string) => {
    if (timeoutsRef.current.has(id)) {
      const timeout = timeoutsRef.current.get(id);
      
      // Remove from parent's children list
      if (timeout?.parentId && timeoutsRef.current.has(timeout.parentId)) {
        const parent = timeoutsRef.current.get(timeout.parentId);
        if (parent) {
          parent.children = parent.children.filter(childId => childId !== id);
          timeoutsRef.current.set(timeout.parentId, parent);
        }
      }
      
      timeoutsRef.current.delete(id);
      setActiveTimeoutCount(count => Math.max(0, count - 1));
    }
  }, []);
  
  // Clear a timeout and all its children
  const clearHierarchy = useCallback((id: string) => {
    const clearTimeoutAndChildren = (timeoutId: string) => {
      const timeout = timeoutsRef.current.get(timeoutId);
      if (!timeout) return;
      
      // Clear all children first
      [...timeout.children].forEach(childId => {
        clearTimeoutAndChildren(childId);
      });
      
      // Clear this timeout
      timeout.clearFn();
      unregisterTimeout(timeoutId);
    };
    
    clearTimeoutAndChildren(id);
  }, [unregisterTimeout]);
  
  // Clear all timeouts
  const clearAll = useCallback(() => {
    // Get root timeouts (those without parents)
    const rootTimeouts = Array.from(timeoutsRef.current.entries())
      .filter(([_, data]) => !data.parentId)
      .map(([id]) => id);
    
    // Clear each root and its children
    rootTimeouts.forEach(id => clearHierarchy(id));
  }, [clearHierarchy]);
  
  const value = {
    registerTimeout,
    unregisterTimeout,
    clearHierarchy,
    clearAll,
    activeTimeouts: timeoutsRef.current as Map<string, { clearFn: () => void, children: string[] }>
  };
  
  return (
    <TimeoutCoordinatorContext.Provider value={value}>
      {children}
    </TimeoutCoordinatorContext.Provider>
  );
}

// Hook to use the timeout coordinator
export function useTimeoutCoordinator() {
  const context = useContext(TimeoutCoordinatorContext);
  if (!context) {
    throw new Error('useTimeoutCoordinator must be used within a TimeoutCoordinatorProvider');
  }
  return context;
}

// Hook to create a coordinated navigation timeout
export function useCoordinatedTimeout(
  parentId?: string,
  options?: { onTimeout?: () => void; description?: string }
) {
  const { registerTimeout, unregisterTimeout, clearHierarchy } = useTimeoutCoordinator();
  const { toast } = useToast();
  const timeoutIdRef = useRef<string | null>(null);
  const timeoutTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timeoutIdRef.current) {
        unregisterTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
      if (timeoutTimerRef.current) {
        clearTimeout(timeoutTimerRef.current);
        timeoutTimerRef.current = null;
      }
    };
  }, [unregisterTimeout]);
  
  // Start a timeout
  const startTimeout = useCallback((delay: number = 5000) => {
    // Clear any existing timeout
    if (timeoutIdRef.current) {
      unregisterTimeout(timeoutIdRef.current);
    }
    if (timeoutTimerRef.current) {
      clearTimeout(timeoutTimerRef.current);
    }
    
    // Create new timeout ID
    const newTimeoutId = Math.random().toString(36).substring(2, 15);
    timeoutIdRef.current = newTimeoutId;
    
    // Create the timeout
    timeoutTimerRef.current = setTimeout(() => {
      // Execute timeout callback if provided
      if (options?.onTimeout) {
        options.onTimeout();
      }
      
      // Show toast notification if description provided
      if (options?.description) {
        toast({
          title: 'Timeout',
          description: options.description
        });
      }
      
      // Clean up
      unregisterTimeout(newTimeoutId);
      timeoutIdRef.current = null;
    }, delay);
    
    // Register with coordinator
    registerTimeout(newTimeoutId, () => {
      if (timeoutTimerRef.current) {
        clearTimeout(timeoutTimerRef.current);
        timeoutTimerRef.current = null;
      }
    }, parentId);
    
    return newTimeoutId;
  }, [registerTimeout, unregisterTimeout, toast, options, parentId]);
  
  // Clear the timeout
  const clearTimeout = useCallback(() => {
    if (timeoutIdRef.current) {
      unregisterTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }
    if (timeoutTimerRef.current) {
      clearTimeout(timeoutTimerRef.current);
      timeoutTimerRef.current = null;
    }
  }, [unregisterTimeout]);
  
  // Clear this timeout and all children
  const clearHierarchyFromThis = useCallback(() => {
    if (timeoutIdRef.current) {
      clearHierarchy(timeoutIdRef.current);
      timeoutIdRef.current = null;
      timeoutTimerRef.current = null;
    }
  }, [clearHierarchy]);
  
  return {
    startTimeout,
    clearTimeout,
    clearHierarchy: clearHierarchyFromThis,
    timeoutId: timeoutIdRef.current
  };
}
