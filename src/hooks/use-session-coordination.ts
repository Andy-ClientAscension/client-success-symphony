
import { useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStateMachineContext } from '@/contexts/auth-state-machine';
import { useToast } from '@/hooks/use-toast';
import { getCachedSession, cacheSession, clearCachedSession } from '@/utils/sessionCache';
import { safeAbort, createAbortController } from '@/utils/abortUtils';

// Grace periods (in ms) before retrying various operations
const REFRESH_DEBOUNCE = 2000;  // Minimum time between refreshes
const BACKOFF_INITIAL = 1000;   // Initial backoff time
const BACKOFF_MAX = 10000;      // Maximum backoff time

export function useSessionCoordination() {
  const { toast } = useToast();
  const { 
    state, 
    isAuthenticated, 
    processingAuth,
    dispatch,
    operationId,
    checkSession
  } = useAuthStateMachineContext();
  
  // Tracking refs for preventing duplicate operations
  const lastRefreshTimeRef = useRef<number>(0);
  const refreshPromiseRef = useRef<Promise<boolean> | null>(null);
  const refreshAttemptsRef = useRef<number>(0);
  const backoffTimeRef = useRef<number>(BACKOFF_INITIAL);
  const abortControllerRef = useRef<AbortController | null>(null);
  const pendingOperationsRef = useRef<Map<number, { controller: AbortController, timeoutId?: NodeJS.Timeout }>>(new Map());
  const isMountedRef = useRef<boolean>(true);
  
  // Track mounting state to prevent updates after unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  // Clean up abort controller and pending operations on unmount
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
  
  // Optimized session refresh with debouncing, caching and abort control
  const refreshSession = useCallback(async (forceRefresh = false): Promise<boolean> => {
    const now = Date.now();
    const currentOpId = operationId;
    
    // If already refreshing, return the existing promise
    if (refreshPromiseRef.current !== null) {
      console.log("[SessionCoordination] Refresh already in progress, reusing promise");
      return refreshPromiseRef.current;
    }
    
    // If not forced and we recently refreshed, skip
    if (!forceRefresh && now - lastRefreshTimeRef.current < REFRESH_DEBOUNCE) {
      console.log("[SessionCoordination] Skipping refresh, last refresh too recent");
      
      // Return cached result with fallback to recent state 
      const cachedSession = getCachedSession();
      return Promise.resolve(cachedSession !== null || isAuthenticated === true);
    }
    
    // Abort any previous ongoing request
    if (abortControllerRef.current) {
      safeAbort(abortControllerRef.current, 'New session refresh requested');
    }

    // Create a new abort controller for this request
    const { controller, signal } = createAbortController();
    abortControllerRef.current = controller;
    
    // Register this operation
    registerOperation(currentOpId, controller);
    
    // Create new refresh promise
    console.log(`[SessionCoordination] Starting session refresh, forceRefresh=${forceRefresh}`);
    refreshPromiseRef.current = (async (): Promise<boolean> => {
      try {
        lastRefreshTimeRef.current = now;
        
        // Exit early if abort was requested
        if (signal.aborted || !isMountedRef.current) {
          throw new Error('Session refresh aborted');
        }
        
        // Use the checkSession method with operation tracking
        const isValid = await checkSession(forceRefresh);
        
        // Check if abort was requested during the operation or component unmounted
        if (signal.aborted || !isMountedRef.current || operationId !== currentOpId) {
          throw new Error('Session refresh aborted after check or operation superseded');
        }
        
        if (isValid) {
          console.log("[SessionCoordination] Session refresh successful");
          refreshAttemptsRef.current = 0;
          backoffTimeRef.current = BACKOFF_INITIAL;
          
          // Cache the session for future quick access
          try {
            if (signal.aborted || !isMountedRef.current) return false;
            
            const { data } = await supabase.auth.getSession(); 
            
            if (signal.aborted || !isMountedRef.current) return false;
            
            if (data.session) {
              cacheSession(data.session);
            }
          } catch (e) {
            console.warn("[SessionCoordination] Failed to cache session:", e);
          }
          
          return true;
        }
        
        // If we got here, the session is not valid
        console.log("[SessionCoordination] No valid session found");
        clearCachedSession();
        return false;
      } catch (error) {
        // Don't process errors if already aborted
        if (signal.aborted || !isMountedRef.current) {
          console.log("[SessionCoordination] Session refresh aborted, skipping error handling");
          return false;
        }
        
        console.error("[SessionCoordination] Session refresh error:", error);
        
        // Implement exponential backoff for retries
        refreshAttemptsRef.current++;
        backoffTimeRef.current = Math.min(
          backoffTimeRef.current * 1.5, 
          BACKOFF_MAX
        );
        
        // Only show error toast if it's not a system timeout
        if (refreshAttemptsRef.current <= 2 && 
            error instanceof Error && 
            !error.message.includes('timeout') &&
            !error.message.includes('cancel') &&
            !error.message.includes('abort')) {
          toast({
            title: "Session Refresh Error",
            description: error.message,
            variant: "destructive"
          });
        }
        
        return false;
      } finally {
        // Clear the promise ref so future refreshes can occur
        refreshPromiseRef.current = null;
        
        // Clear the controller reference if this is still the active controller
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }
        
        // Complete this operation
        completeOperation(currentOpId);
      }
    })();
    
    return refreshPromiseRef.current;
  }, [checkSession, isAuthenticated, toast, operationId, registerOperation, completeOperation]);
  
  // Force session verification with UI feedback
  const verifySession = useCallback(async (): Promise<boolean> => {
    if (!isMountedRef.current) return false;
    
    toast({
      title: "Verifying authentication",
      description: "Please wait while we check your session...",
    });
    
    // Dispatch to update state right away
    dispatch({ type: 'SESSION_CHECK_START' });
    
    // Abort any previous ongoing request
    if (abortControllerRef.current) {
      safeAbort(abortControllerRef.current, 'New session verification requested');
    }

    // Create a new abort controller for this request
    const { controller, signal } = createAbortController();
    abortControllerRef.current = controller;
    const currentOpId = operationId;
    
    // Register this operation
    registerOperation(currentOpId, controller);
    
    try {
      // Exit early if abort was requested
      if (signal.aborted || !isMountedRef.current) {
        throw new Error('Session verification aborted');
      }
      
      // Force a fresh session check
      const result = await refreshSession(true);
      
      // Check if abort was requested during the operation or component unmounted
      if (signal.aborted || !isMountedRef.current || operationId !== currentOpId) {
        throw new Error('Session verification aborted after refresh or operation superseded');
      }
      
      if (result) {
        toast({
          title: "Authentication verified",
          description: "Your session is valid",
        });
        return true;
      } else {
        toast({
          title: "Authentication required",
          description: "Please sign in to continue",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      // Don't process errors if already aborted or component unmounted
      if (signal.aborted || !isMountedRef.current) {
        console.log("[SessionCoordination] Session verification aborted, skipping error handling");
        return false;
      }
      
      console.error("Session verification error:", error);
      toast({
        title: "Verification Error",
        description: error instanceof Error ? error.message : "Failed to verify session",
        variant: "destructive"
      });
      return false;
    } finally {
      // Clear the controller reference if this is still the active controller
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
      
      // Complete this operation
      completeOperation(currentOpId);
    }
  }, [dispatch, refreshSession, toast, operationId, registerOperation, completeOperation]);
  
  // Check if we can skip refreshing based on cache and state
  const shouldRefreshSession = useCallback((): boolean => {
    // Never refresh when already processing auth
    if (processingAuth) return false;
    
    // Don't refresh when we're in these states
    const skipStates = [
      'checking_token',
      'checking_session',
      'navigation_triggered',
      'navigation_completed'
    ];
    if (skipStates.includes(state)) return false;
    
    // Check if we have a valid cached session
    const cachedSession = getCachedSession();
    if (cachedSession && isAuthenticated) return false;
    
    // Default to refreshing for uncertain states
    return true;
  }, [processingAuth, state, isAuthenticated]);
  
  return {
    refreshSession,
    verifySession,
    checkSession,
    shouldRefreshSession,
    processingAuth,
    isAuthenticated,
    state
  };
}
