
import { useCallback, useRef, useEffect } from 'react';
import { safeAbort, createAbortController } from "@/utils/abortUtils";

/**
 * Hook to manage abort controllers for async operations
 * Provides tracking and management for multiple concurrent operations
 */
export function useOperationController() {
  const abortControllerRef = useRef<AbortController | null>(null);
  const pendingOperationsRef = useRef<Map<number, { 
    controller: AbortController, 
    timeoutId?: NodeJS.Timeout 
  }>>(new Map());
  const isMountedRef = useRef<boolean>(true);
  
  // Track mounting state to prevent updates after unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  // Clean up controllers on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        safeAbort(abortControllerRef.current, 'Component unmounted');
        abortControllerRef.current = null;
      }
      
      // Abort all pending operations on unmount
      pendingOperationsRef.current.forEach(({ controller, timeoutId }) => {
        safeAbort(controller, 'Component unmounted');
        if (timeoutId) clearTimeout(timeoutId);
      });
      pendingOperationsRef.current.clear();
    };
  }, []);
  
  // Helper to register and track operations
  const registerOperation = useCallback((opId: number, controller: AbortController) => {
    pendingOperationsRef.current.set(opId, { controller });
    return opId;
  }, []);
  
  // Helper to complete operations
  const completeOperation = useCallback((opId: number) => {
    const operation = pendingOperationsRef.current.get(opId);
    if (operation) {
      const { timeoutId } = operation;
      if (timeoutId) clearTimeout(timeoutId);
      pendingOperationsRef.current.delete(opId);
    }
  }, []);
  
  // Get a new controller and abort any existing one
  const getController = useCallback((reason: string = 'New operation started') => {
    if (abortControllerRef.current) {
      safeAbort(abortControllerRef.current, reason);
    }
    
    const { controller, signal } = createAbortController();
    abortControllerRef.current = controller;
    
    return { controller, signal };
  }, []);
  
  // Check if component is still mounted
  const isMounted = useCallback(() => {
    return isMountedRef.current;
  }, []);
  
  return {
    registerOperation,
    completeOperation,
    getController,
    isMounted,
    currentController: abortControllerRef
  };
}
