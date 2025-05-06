
import { useState, useCallback, useRef, useEffect } from "react";
import { useAuthReducer, useAuthTimeouts } from "./use-auth-reducer";

// Define state machine states
type AuthStateMachineState = 
  | 'initializing'
  | 'checking_token'
  | 'checking_session'
  | 'authenticated' 
  | 'unauthenticated'
  | 'navigation_triggered'
  | 'navigation_completed';

// Define events that can be dispatched to the state machine
type AuthStateMachineEvent = 
  | { type: 'SESSION_CHECK_START' }
  | { type: 'SESSION_CHECK_SUCCESS' }
  | { type: 'SESSION_CHECK_FAILURE'; error?: Error }
  | { type: 'TOKEN_CHECK_START' }
  | { type: 'AUTHENTICATE_SUCCESS' }
  | { type: 'AUTHENTICATE_FAILURE'; error?: Error }
  | { type: 'LOGOUT' }
  | { type: 'NAVIGATE_START' }
  | { type: 'NAVIGATE_COMPLETE' };

/**
 * Main hook for auth state machine that manages authentication state and transitions
 */
export function useAuthStateMachine() {
  // Use the improved auth reducer that avoids memory leaks
  const [authState, dispatch] = useAuthReducer();
  
  // Set up the tiered timeout system
  useAuthTimeouts(authState, dispatch);
  
  // Current state of the authentication state machine
  const [state, setState] = useState<AuthStateMachineState>('initializing');
  
  // Authentication result derived from state machine
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  // Operation ID for tracking concurrent operations
  const [operationId, setOperationId] = useState<number>(0);
  
  // Get a new operation ID for tracking concurrent operations
  const getNewOperationId = useCallback(() => {
    setOperationId(prevId => prevId + 1);
    return operationId + 1;
  }, [operationId]);
  
  // Set up timeout utility for auth operations
  const withAuthTimeout = useCallback(async <T>(promise: Promise<T>, timeoutMs: number = 5000): Promise<T> => {
    let timeoutId: NodeJS.Timeout;
    
    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error(`Auth operation timed out after ${timeoutMs}ms`));
        }, timeoutMs);
      });
      
      // Race between the original promise and timeout
      return await Promise.race([promise, timeoutPromise]) as T;
    } finally {
      clearTimeout(timeoutId!);
    }
  }, []);
  
  // Handle state machine events
  const handleEvent = useCallback((event: AuthStateMachineEvent) => {
    console.log(`[AuthStateMachine] Event: ${event.type} in state: ${state}`);
    
    switch (event.type) {
      case 'SESSION_CHECK_START':
        setState('checking_session');
        break;
        
      case 'SESSION_CHECK_SUCCESS':
        setState('authenticated');
        setIsAuthenticated(true);
        break;
        
      case 'SESSION_CHECK_FAILURE':
        setState('unauthenticated');
        setIsAuthenticated(false);
        if (event.error) {
          console.error("[AuthStateMachine] Session check failed:", event.error);
        }
        break;
        
      case 'TOKEN_CHECK_START':
        setState('checking_token');
        break;
        
      case 'AUTHENTICATE_SUCCESS':
        setState('authenticated');
        setIsAuthenticated(true);
        break;
        
      case 'AUTHENTICATE_FAILURE':
        setState('unauthenticated');
        setIsAuthenticated(false);
        if (event.error) {
          console.error("[AuthStateMachine] Authentication failed:", event.error);
        }
        break;
        
      case 'LOGOUT':
        setState('unauthenticated');
        setIsAuthenticated(false);
        break;
        
      case 'NAVIGATE_START':
        setState('navigation_triggered');
        break;
        
      case 'NAVIGATE_COMPLETE':
        setState('navigation_completed');
        break;
    }
  }, [state]);
  
  // Get the processing auth status from auth reducer state
  const processingAuth = authState.processingAuth || state === 'checking_session' || state === 'checking_token';
  
  // Get the current timeout level
  const timeoutLevel = authState.timeoutLevel;
  
  // Return the state machine context and dispatch function
  return { 
    state,
    isAuthenticated,
    processingAuth,
    dispatch: handleEvent,
    withAuthTimeout,
    operationId,
    getNewOperationId,
    timeoutLevel
  };
}
