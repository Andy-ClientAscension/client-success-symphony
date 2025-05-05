
import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export type AuthState = 
  | 'initializing' 
  | 'checking_token'
  | 'checking_session'
  | 'authenticated'
  | 'unauthenticated'
  | 'error'
  | 'timeout_level_1'
  | 'timeout_level_2'
  | 'timeout_level_3'
  | 'navigation_triggered';

export type AuthAction =
  | { type: 'START_INIT' }
  | { type: 'TOKEN_CHECK_START' }
  | { type: 'TOKEN_CHECK_SUCCESS' }
  | { type: 'TOKEN_CHECK_FAILURE' }
  | { type: 'SESSION_CHECK_START' }
  | { type: 'SESSION_CHECK_SUCCESS' }
  | { type: 'SESSION_CHECK_FAILURE' }
  | { type: 'AUTHENTICATE_SUCCESS' }
  | { type: 'AUTHENTICATE_FAILURE', error?: Error }
  | { type: 'TIMEOUT', level: 1 | 2 | 3 }
  | { type: 'TRIGGER_NAVIGATION', destination: string }
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
  isAuthenticated: null
};

export function useAuthStateMachine(defaultAuthenticatedRedirect = '/dashboard', defaultUnauthenticatedRedirect = '/login') {
  const [state, setState] = useState<AuthStateMachineState>(initialState);
  const timeoutIdsRef = useRef<NodeJS.Timeout[]>([]);
  const navigationLockRef = useRef<boolean>(false);
  const operationIdRef = useRef<number>(0);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Clean up all timeouts on unmount
  const clearAllTimeouts = useCallback(() => {
    timeoutIdsRef.current.forEach(id => clearTimeout(id));
    timeoutIdsRef.current = [];
  }, []);
  
  // Create timeout with automatic cleanup registration
  const createTimeout = useCallback((callback: () => void, ms: number) => {
    const id = setTimeout(() => {
      // Remove this timeout ID from the list when it executes
      timeoutIdsRef.current = timeoutIdsRef.current.filter(i => i !== id);
      callback();
    }, ms);
    
    timeoutIdsRef.current.push(id);
    return id;
  }, []);
  
  // State machine dispatch function
  const dispatch = useCallback((action: AuthAction) => {
    const currentOpId = ++operationIdRef.current;
    
    setState(prevState => {
      const now = Date.now();
      let nextState: Partial<AuthStateMachineState> = { transitionTime: now };
      
      console.log(`[Auth State Machine] Action: ${action.type}, Current state: ${prevState.state}`);
      
      switch (action.type) {
        case 'START_INIT':
          nextState = {
            ...nextState,
            state: 'initializing',
            previousState: prevState.state,
            processingAuth: true,
            error: null
          };
          break;
          
        case 'TOKEN_CHECK_START':
          nextState = {
            ...nextState,
            state: 'checking_token',
            previousState: prevState.state,
            processingAuth: true
          };
          break;
          
        case 'TOKEN_CHECK_SUCCESS':
          nextState = {
            ...nextState,
            state: 'checking_session',
            previousState: prevState.state,
            processingAuth: true
          };
          break;
          
        case 'TOKEN_CHECK_FAILURE':
          nextState = {
            ...nextState,
            state: 'unauthenticated',
            previousState: prevState.state,
            processingAuth: false,
            isAuthenticated: false
          };
          break;
          
        case 'SESSION_CHECK_START':
          nextState = {
            ...nextState,
            state: 'checking_session',
            previousState: prevState.state,
            processingAuth: true
          };
          break;
          
        case 'SESSION_CHECK_SUCCESS':
          nextState = {
            ...nextState,
            state: 'authenticated',
            previousState: prevState.state,
            processingAuth: false,
            isAuthenticated: true
          };
          break;
          
        case 'SESSION_CHECK_FAILURE':
          nextState = {
            ...nextState,
            state: 'unauthenticated',
            previousState: prevState.state,
            processingAuth: false,
            isAuthenticated: false
          };
          break;
          
        case 'AUTHENTICATE_SUCCESS':
          nextState = {
            ...nextState,
            state: 'authenticated',
            previousState: prevState.state,
            processingAuth: false,
            error: null,
            isAuthenticated: true
          };
          break;
          
        case 'AUTHENTICATE_FAILURE':
          nextState = {
            ...nextState,
            state: 'error',
            previousState: prevState.state,
            processingAuth: false,
            error: action.error || new Error('Authentication failed'),
            isAuthenticated: false
          };
          break;
          
        case 'TIMEOUT':
          // Only increase timeout level if the new level is higher
          if (action.level <= prevState.timeoutLevel) {
            return prevState; // No change if timeout level didn't increase
          }
          
          nextState = {
            ...nextState,
            state: `timeout_level_${action.level}` as AuthState,
            previousState: prevState.state,
            timeoutLevel: action.level,
            processingAuth: action.level >= 3 ? false : prevState.processingAuth,
          };
          break;
          
        case 'TRIGGER_NAVIGATION':
          nextState = {
            ...nextState,
            state: 'navigation_triggered',
            previousState: prevState.state,
            navigationAttempted: true,
            navigationDestination: action.destination,
            processingAuth: false
          };
          break;
          
        case 'RESET':
          clearAllTimeouts();
          return initialState;
          
        default:
          return prevState;
      }
      
      return { ...prevState, ...nextState };
    });
    
    // Return the operation ID for tracking
    return currentOpId;
  }, [clearAllTimeouts]);
  
  // Set up tiered timeout system with progressive timeouts
  useEffect(() => {
    // Clear previous timeouts when state changes to avoid duplicate timeouts
    clearAllTimeouts();
    
    // Only set timeouts for states that should progress automatically
    const shouldSetTimeouts = ['initializing', 'checking_token', 'checking_session'].includes(state.state);
    
    if (shouldSetTimeouts && !state.navigationAttempted) {
      // Level 1 timeout (300ms) - Quick timeout for initial checks
      createTimeout(() => {
        dispatch({ type: 'TIMEOUT', level: 1 });
      }, 300);
      
      // Level 2 timeout (800ms) - Medium timeout for slower operations
      createTimeout(() => {
        dispatch({ type: 'TIMEOUT', level: 2 });
      }, 800);
      
      // Level 3 timeout (1500ms) - Final timeout that forces progress
      createTimeout(() => {
        // If we're still in a processing state after 1.5s, force completion
        if (state.processingAuth) {
          console.warn("[Auth State Machine] Level 3 timeout reached. Forcing auth completion.");
          dispatch({ type: 'TIMEOUT', level: 3 });
          
          // Force destination based on most likely state
          const destination = state.isAuthenticated === true ? 
            defaultAuthenticatedRedirect : defaultUnauthenticatedRedirect;
            
          // Emergency toast for user feedback
          toast({
            title: "Authentication check timeout",
            description: "Navigation continuing with best guess authentication state."
          });
          
          // Forced navigation after timeout
          dispatch({ type: 'TRIGGER_NAVIGATION', destination });
        }
      }, 1500);
    }
    
    return () => {
      clearAllTimeouts();
    };
  }, [state.state, state.processingAuth, state.navigationAttempted, state.isAuthenticated, 
      dispatch, createTimeout, clearAllTimeouts, toast, defaultAuthenticatedRedirect, defaultUnauthenticatedRedirect]);
  
  // Handle navigation based on auth state
  useEffect(() => {
    // Prevent navigation in some states
    if (state.state === 'initializing' || navigationLockRef.current) {
      return;
    }
    
    // Automated navigation based on authentication state when it becomes definitive
    if (state.state === 'authenticated' && !state.navigationAttempted) {
      navigationLockRef.current = true;
      console.log('[Auth State Machine] Navigating to dashboard (authenticated)');
      dispatch({ type: 'TRIGGER_NAVIGATION', destination: defaultAuthenticatedRedirect });
      navigate(defaultAuthenticatedRedirect, { replace: true });
    } 
    else if (state.state === 'unauthenticated' && !state.navigationAttempted) {
      navigationLockRef.current = true;
      console.log('[Auth State Machine] Navigating to login (unauthenticated)');
      dispatch({ type: 'TRIGGER_NAVIGATION', destination: defaultUnauthenticatedRedirect });
      navigate(defaultUnauthenticatedRedirect, { replace: true });
    }
    else if (state.state === 'navigation_triggered' && state.navigationDestination) {
      navigationLockRef.current = true;
      console.log(`[Auth State Machine] Explicit navigation to: ${state.navigationDestination}`);
      navigate(state.navigationDestination, { replace: true });
    }
    else if (state.timeoutLevel >= 3 && !state.navigationAttempted) {
      // Force navigation after level 3 timeout
      navigationLockRef.current = true;
      const destination = state.isAuthenticated === true ? 
        defaultAuthenticatedRedirect : defaultUnauthenticatedRedirect;
      console.warn(`[Auth State Machine] Emergency navigation to: ${destination} after timeout`);
      dispatch({ type: 'TRIGGER_NAVIGATION', destination });
      navigate(destination, { replace: true });
    }
    
    // Reset navigation lock after each navigation attempt
    return () => {
      navigationLockRef.current = false;
    };
  }, [state.state, state.isAuthenticated, state.navigationAttempted, state.navigationDestination, 
      state.timeoutLevel, navigate, dispatch, defaultAuthenticatedRedirect, defaultUnauthenticatedRedirect]);
  
  // Helper function to perform manual navigation
  const navigateTo = useCallback((destination: string, replace: boolean = true) => {
    if (!navigationLockRef.current) {
      navigationLockRef.current = true;
      dispatch({ type: 'TRIGGER_NAVIGATION', destination });
      navigate(destination, { replace });
    }
  }, [navigate, dispatch]);
  
  return {
    state: state.state,
    previousState: state.previousState,
    error: state.error,
    timeoutLevel: state.timeoutLevel,
    processingAuth: state.processingAuth,
    navigationAttempted: state.navigationAttempted,
    isAuthenticated: state.isAuthenticated,
    dispatch,
    navigateTo,
    resetAuthState: useCallback(() => dispatch({ type: 'RESET' }), [dispatch])
  };
}
