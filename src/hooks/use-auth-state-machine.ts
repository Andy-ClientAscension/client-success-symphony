import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { withTimeout } from '@/utils/error/timeoutUtils';
import { announceToScreenReader } from '@/lib/accessibility';

export type AuthState = 
  | 'initializing' 
  | 'checking_token'
  | 'checking_session'
  | 'authenticated'
  | 'unauthenticated'
  | 'error'
  | 'timeout_soft'  // Level 1 timeout - continue but warn
  | 'timeout_hard'  // Level 2 timeout - force continue
  | 'timeout_fatal' // Level 3 timeout - force navigate
  | 'navigation_triggered'
  | 'navigation_completed';

export type AuthAction =
  | { type: 'INIT' }
  | { type: 'TOKEN_CHECK_START' }
  | { type: 'TOKEN_CHECK_SUCCESS' }
  | { type: 'TOKEN_CHECK_FAILURE'; error?: Error }
  | { type: 'SESSION_CHECK_START' }
  | { type: 'SESSION_CHECK_SUCCESS' }
  | { type: 'SESSION_CHECK_FAILURE'; error?: Error }
  | { type: 'AUTHENTICATE_SUCCESS' }
  | { type: 'AUTHENTICATE_FAILURE'; error?: Error }
  | { type: 'TIMEOUT'; level: 1 | 2 | 3 }
  | { type: 'NAVIGATE'; destination: string }
  | { type: 'NAVIGATION_COMPLETE' }
  | { type: 'CANCEL'; reason?: string }
  | { type: 'RESET' };

interface AuthStateMachineState {
  state: AuthState;
  previousState: AuthState | null;
  error: Error | null;
  transitionTime: number;
  timeoutLevel: number;
  processingAuth: boolean;
  navigationAttempted: boolean;
  navigationDestination: string | null;
  isAuthenticated: boolean | null;
  operationId: number;  // Track the current operation to handle race conditions
  lastOperation: string | null;
  errorCount: number;   // Track error count for recovery mechanisms
}

const initialState: AuthStateMachineState = {
  state: 'initializing',
  previousState: null,
  error: null,
  transitionTime: Date.now(),
  timeoutLevel: 0,
  processingAuth: false,
  navigationAttempted: false,
  navigationDestination: null,
  isAuthenticated: null,
  operationId: 0,
  lastOperation: null,
  errorCount: 0
};

export function useAuthStateMachine(
  defaultAuthenticatedRedirect = '/dashboard', 
  defaultUnauthenticatedRedirect = '/login',
  options = { 
    enableProgressiveTimeouts: true,
    timeoutLevels: [300, 800, 1500], // Timeout thresholds in ms
    navigationLock: true,            // Prevent multiple navigations
    autoNavigate: true               // Auto-navigate based on auth state
  }
) {
  const [state, setState] = useState<AuthStateMachineState>(initialState);
  const timeoutIdsRef = useRef<NodeJS.Timeout[]>([]);
  const navigationLockRef = useRef<boolean>(false);
  const operationIdRef = useRef<number>(0);
  const abortControllersRef = useRef<Map<number, AbortController>>(new Map());
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Clean up all timeouts
  const clearAllTimeouts = useCallback(() => {
    timeoutIdsRef.current.forEach(clearTimeout);
    timeoutIdsRef.current = [];
  }, []);
  
  // Cancel all pending operations
  const cancelAllOperations = useCallback(() => {
    // Cancel all abort controllers
    abortControllersRef.current.forEach(controller => {
      try {
        controller.abort('Operation cancelled');
      } catch (err) {
        console.error('Error aborting controller:', err);
      }
    });
    abortControllersRef.current.clear();
    
    // Clear all timeouts
    clearAllTimeouts();
  }, [clearAllTimeouts]);
  
  // Create timeout with automatic cleanup registration
  const createTimeout = useCallback((callback: () => void, ms: number): NodeJS.Timeout => {
    const id = setTimeout(() => {
      // Remove from the list when it executes
      timeoutIdsRef.current = timeoutIdsRef.current.filter(i => i !== id);
      callback();
    }, ms);
    
    timeoutIdsRef.current.push(id);
    return id;
  }, []);
  
  // Enhanced state machine dispatch function
  const dispatch = useCallback((action: AuthAction) => {
    const now = Date.now();
    const newOperationId = ++operationIdRef.current;
    
    // Create a new AbortController for this operation
    if (['INIT', 'TOKEN_CHECK_START', 'SESSION_CHECK_START'].includes(action.type)) {
      const controller = new AbortController();
      abortControllersRef.current.set(newOperationId, controller);
    }
    
    setState(prevState => {
      console.log(`[Auth State Machine] Action: ${action.type}, Current state: ${prevState.state}`);
      
      // Start with common state updates
      const baseNextState: Partial<AuthStateMachineState> = { 
        transitionTime: now,
        previousState: prevState.state,
        operationId: newOperationId,
        lastOperation: action.type
      };
      
      switch (action.type) {
        case 'INIT':
          return {
            ...prevState,
            ...baseNextState,
            state: 'initializing',
            processingAuth: true,
            error: null,
            errorCount: 0
          };
          
        case 'TOKEN_CHECK_START':
          return {
            ...prevState,
            ...baseNextState,
            state: 'checking_token',
            processingAuth: true,
            error: null
          };
          
        case 'TOKEN_CHECK_SUCCESS':
          return {
            ...prevState,
            ...baseNextState,
            state: 'checking_session',
            processingAuth: true,
            error: null
          };
          
        case 'TOKEN_CHECK_FAILURE':
          return {
            ...prevState,
            ...baseNextState,
            state: action.error ? 'error' : 'unauthenticated',
            processingAuth: false,
            error: action.error || null,
            isAuthenticated: false,
            errorCount: action.error ? prevState.errorCount + 1 : prevState.errorCount
          };
          
        case 'SESSION_CHECK_START':
          return {
            ...prevState,
            ...baseNextState,
            state: 'checking_session',
            processingAuth: true
          };
          
        case 'SESSION_CHECK_SUCCESS':
          return {
            ...prevState,
            ...baseNextState,
            state: 'authenticated',
            processingAuth: false,
            error: null,
            isAuthenticated: true,
            errorCount: 0  // Reset error count on success
          };
          
        case 'SESSION_CHECK_FAILURE':
          return {
            ...prevState,
            ...baseNextState,
            state: action.error ? 'error' : 'unauthenticated',
            processingAuth: false,
            error: action.error || null,
            isAuthenticated: false,
            errorCount: action.error ? prevState.errorCount + 1 : prevState.errorCount
          };
          
        case 'AUTHENTICATE_SUCCESS':
          return {
            ...prevState,
            ...baseNextState,
            state: 'authenticated',
            processingAuth: false,
            error: null,
            isAuthenticated: true,
            errorCount: 0  // Reset error count on success
          };
          
        case 'AUTHENTICATE_FAILURE':
          return {
            ...prevState,
            ...baseNextState,
            state: 'error',
            processingAuth: false,
            error: action.error || new Error('Authentication failed'),
            isAuthenticated: false,
            errorCount: prevState.errorCount + 1
          };
          
        case 'TIMEOUT':
          // Only increase timeout level if the new level is higher
          if (action.level <= prevState.timeoutLevel) {
            return prevState; // No change needed
          }
          
          const timeoutState: AuthState = 
            action.level === 1 ? 'timeout_soft' :
            action.level === 2 ? 'timeout_hard' : 'timeout_fatal';
          
          return {
            ...prevState,
            ...baseNextState,
            state: timeoutState,
            timeoutLevel: action.level,
            // Force processing to false on fatal timeout
            processingAuth: action.level < 3 ? prevState.processingAuth : false
          };
          
        case 'NAVIGATE':
          return {
            ...prevState,
            ...baseNextState,
            state: 'navigation_triggered',
            navigationAttempted: true,
            navigationDestination: action.destination,
            processingAuth: false
          };
          
        case 'NAVIGATION_COMPLETE':
          return {
            ...prevState,
            ...baseNextState,
            state: 'navigation_completed',
            navigationAttempted: true,
            processingAuth: false
          };
          
        case 'CANCEL':
          // Cancel keeps the current auth state but stops processing
          return {
            ...prevState,
            ...baseNextState,
            processingAuth: false,
            error: prevState.error || (action.reason ? new Error(action.reason) : null)
          };
          
        case 'RESET':
          cancelAllOperations();
          return {
            ...initialState,
            transitionTime: now,
            operationId: newOperationId
          };
          
        default:
          return prevState;
      }
    });
    
    // Return the operation ID for tracking
    return newOperationId;
  }, [cancelAllOperations]);
  
  // Set up unified, progressive timeout system
  useEffect(() => {
    // Clean up previous timeouts when state changes
    clearAllTimeouts();
    
    if (!options.enableProgressiveTimeouts) return;
    
    // Only set timeouts for states that should have automatic timeouts
    const shouldSetTimeouts = [
      'initializing', 
      'checking_token', 
      'checking_session'
    ].includes(state.state) && !state.navigationAttempted;
    
    if (shouldSetTimeouts) {
      // Level 1 timeout (soft) - Just warn but continue
      createTimeout(() => {
        if (state.processingAuth) {
          console.log("[Auth State Machine] Soft timeout reached");
          dispatch({ type: 'TIMEOUT', level: 1 });
          
          // Show a mild toast if still processing
          if (state.processingAuth) {
            toast({
              title: "Still verifying...",
              description: "Authentication is taking longer than expected",
              variant: "default"
            });
          }
        }
      }, options.timeoutLevels[0]);
      
      // Level 2 timeout (hard) - Force continue with best guess
      createTimeout(() => {
        if (state.processingAuth) {
          console.warn("[Auth State Machine] Hard timeout reached");
          dispatch({ type: 'TIMEOUT', level: 2 });
          
          // Add accessibility announcement
          announceToScreenReader(
            "Authentication is taking longer than expected. Continuing with best guess state.",
            "polite"
          );
          
          // Show toast only once
          if (!state.timeoutLevel) {
            toast({
              title: "Authentication delay",
              description: "Taking longer than expected, continuing anyway",
              variant: "default"
            });
          }
        }
      }, options.timeoutLevels[1]);
      
      // Level 3 timeout (fatal) - Force navigation to prevent stuck state
      createTimeout(() => {
        if (state.processingAuth) {
          console.error("[Auth State Machine] Fatal timeout reached, forcing completion");
          dispatch({ type: 'TIMEOUT', level: 3 });
          
          // Emergency toast for user feedback
          toast({
            title: "Authentication timeout",
            description: "We'll continue with best guess authentication state",
            variant: "default"
          });
          
          // Force destination based on most likely state with fallback
          const destination = state.isAuthenticated === true ? 
            defaultAuthenticatedRedirect : defaultUnauthenticatedRedirect;
            
          // Force navigation after timeout
          dispatch({ type: 'NAVIGATE', destination });
        }
      }, options.timeoutLevels[2]);
    }
    
    // Clean up timeouts if component unmounts or state changes
    return clearAllTimeouts;
  }, [
    state.state, 
    state.processingAuth, 
    state.navigationAttempted, 
    state.isAuthenticated,
    state.timeoutLevel,
    dispatch, 
    createTimeout, 
    clearAllTimeouts, 
    toast, 
    options.enableProgressiveTimeouts,
    options.timeoutLevels,
    defaultAuthenticatedRedirect, 
    defaultUnauthenticatedRedirect
  ]);
  
  // Handle navigation based on auth state
  useEffect(() => {
    if (!options.autoNavigate) return;
    
    // Skip navigation for certain states
    if (state.state === 'initializing' || navigationLockRef.current) {
      return;
    }
    
    // Navigation function with locking mechanism
    const navigateWithLock = (destination: string, replace = true) => {
      if (!options.navigationLock || !navigationLockRef.current) {
        navigationLockRef.current = true;
        console.log(`[Auth State Machine] Navigating to: ${destination}`);
        
        try {
          navigate(destination, { replace });
          dispatch({ type: 'NAVIGATION_COMPLETE' });
        } catch (err) {
          console.error('Navigation error:', err);
          // Release lock if navigation fails
          navigationLockRef.current = false;
        }
      }
    };
    
    // Automated navigation based on authentication state
    if (state.state === 'authenticated' && !state.navigationAttempted) {
      navigateWithLock(defaultAuthenticatedRedirect);
    } 
    else if (state.state === 'unauthenticated' && !state.navigationAttempted) {
      navigateWithLock(defaultUnauthenticatedRedirect);
    }
    else if (state.state === 'navigation_triggered' && state.navigationDestination) {
      navigateWithLock(state.navigationDestination);
    }
    else if (state.state === 'timeout_fatal' && !state.navigationAttempted) {
      // Force navigation after fatal timeout
      const destination = state.isAuthenticated === true ? 
        defaultAuthenticatedRedirect : defaultUnauthenticatedRedirect;
      console.warn(`[Auth State Machine] Emergency navigation to: ${destination} after timeout`);
      navigateWithLock(destination);
    }
    
    // Short timeout to release navigation lock for retry attempts
    const lockReleaseTimer = setTimeout(() => {
      navigationLockRef.current = false;
    }, 300);
    
    return () => {
      clearTimeout(lockReleaseTimer);
    };
  }, [
    state.state, 
    state.isAuthenticated, 
    state.navigationAttempted, 
    state.navigationDestination,
    navigate, 
    dispatch, 
    defaultAuthenticatedRedirect, 
    defaultUnauthenticatedRedirect,
    options.autoNavigate,
    options.navigationLock
  ]);
  
  // Enhanced version of navigateTo with operation tracking
  const navigateTo = useCallback((destination: string, options = { replace: true }) => {
    if (!navigationLockRef.current) {
      navigationLockRef.current = true;
      dispatch({ type: 'NAVIGATE', destination });
      
      try {
        navigate(destination, { replace: options.replace });
        dispatch({ type: 'NAVIGATION_COMPLETE' });
      } catch (err) {
        console.error('Navigation error:', err);
        navigationLockRef.current = false;
      }
    }
  }, [navigate, dispatch]);
  
  // Create a function that wraps async operations with timeout and aborts
  const withAuthTimeout = useCallback(async <T>(
    promise: Promise<T>, 
    timeoutMs = 2000, 
    operationId?: number
  ): Promise<T> => {
    const currentOpId = operationId || state.operationId;
    const controller = abortControllersRef.current.get(currentOpId);
    
    if (!controller) {
      throw new Error('No abort controller found for operation');
    }
    
    try {
      // Use the withTimeout utility to add a timeout to the promise
      return await withTimeout(
        promise, 
        timeoutMs, 
        'Operation timed out'
      );
    } catch (error) {
      // If aborted, throw a cleaner error
      if (controller.signal.aborted) {
        throw new Error('Operation was cancelled');
      }
      throw error;
    } finally {
      // Clean up the controller
      abortControllersRef.current.delete(currentOpId);
    }
  }, [state.operationId]);
  
  // Return the enhanced interface
  return {
    // State properties
    state: state.state,
    previousState: state.previousState,
    error: state.error,
    timeoutLevel: state.timeoutLevel,
    processingAuth: state.processingAuth,
    navigationAttempted: state.navigationAttempted,
    isAuthenticated: state.isAuthenticated,
    operationId: state.operationId,
    lastOperation: state.lastOperation,
    errorCount: state.errorCount,
    
    // Actions
    dispatch,
    navigateTo,
    withAuthTimeout,
    cancelAllOperations,
    resetAuthState: useCallback(() => dispatch({ type: 'RESET' }), [dispatch])
  };
}
