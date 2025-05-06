import { useReducer, useMemo, useEffect } from 'react';

export interface AuthState {
  processingAuth: boolean;
  authError: string | null;
  urlProcessed: boolean;
  status: 'idle' | 'loading' | 'authenticated' | 'unauthenticated' | 'error' | 'timed-out';
  navigationAttempted: boolean;
  timeoutLevel: number;
}

export type AuthAction = 
  | { type: 'START_PROCESSING' }
  | { type: 'PROCESSING_COMPLETE' }
  | { type: 'AUTH_SUCCESS' }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'URL_PROCESSED' }
  | { type: 'TIMEOUT'; level: number }
  | { type: 'NAVIGATION_ATTEMPTED' }
  | { type: 'CLEANUP' }
  | { type: 'BATCH_UPDATE'; payload: Partial<AuthState> };

const initialAuthState: AuthState = {
  processingAuth: false,
  authError: null,
  urlProcessed: false,
  status: 'idle',
  navigationAttempted: false,
  timeoutLevel: 0
};

export const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'START_PROCESSING':
      return {
        ...state,
        processingAuth: true,
        authError: null,
        status: 'loading'
      };
      
    case 'PROCESSING_COMPLETE':
      return {
        ...state,
        processingAuth: false,
        status: state.status === 'loading' ? 'idle' : state.status
      };
      
    case 'AUTH_SUCCESS':
      return {
        ...state,
        processingAuth: false,
        authError: null,
        status: 'authenticated'
      };
      
    case 'AUTH_ERROR':
      return {
        ...state,
        processingAuth: false,
        authError: action.payload,
        status: 'error'
      };
      
    case 'URL_PROCESSED':
      return {
        ...state,
        urlProcessed: true
      };

    case 'TIMEOUT':
      // Only increase timeout level if the new level is higher
      if (action.level <= state.timeoutLevel) {
        return state;
      }
      
      return {
        ...state,
        timeoutLevel: action.level,
        status: 'timed-out',
        processingAuth: false
      };
      
    case 'NAVIGATION_ATTEMPTED':
      return {
        ...state,
        navigationAttempted: true
      };
      
    case 'CLEANUP':
      return initialAuthState;
      
    case 'BATCH_UPDATE':
      return { ...state, ...action.payload };
      
    default:
      return state;
  }
};

// Updated hook implementation to avoid memory leaks and improve reactivity
export const useAuthReducer = () => {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);
  
  // Return a memoized array reference that only changes when state changes
  // This preserves reference equality for the returned array while ensuring
  // that state updates properly propagate to dependent components
  return useMemo(() => [state, dispatch] as const, [state]);
};

// Set up tiered timeout system that automatically progresses through timeout levels
export const useAuthTimeouts = (state: AuthState, dispatch: React.Dispatch<AuthAction>) => {
  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];
    
    if (state.status === 'loading' && !state.navigationAttempted) {
      // Level 1 timeout (500ms) - Quick check to catch stuck loading states
      const level1 = setTimeout(() => {
        console.log("[AuthReducer] Level 1 timeout reached (500ms)");
        // Only dispatch if we're still loading
        if (state.status === 'loading') {
          dispatch({ type: 'TIMEOUT', level: 1 });
        }
      }, 500);
      
      // Level 2 timeout (1.5s) - Force exit from loading state
      const level2 = setTimeout(() => {
        console.log("[AuthReducer] Level 2 timeout reached (1.5s)");
        dispatch({ type: 'TIMEOUT', level: 2 });
        dispatch({ type: 'PROCESSING_COMPLETE' });
      }, 1500);
      
      // Level 3 timeout (3s) - Emergency timeout, force navigation attempt
      const level3 = setTimeout(() => {
        console.log("[AuthReducer] Level 3 timeout reached (3s). Forcing navigation.");
        dispatch({ type: 'TIMEOUT', level: 3 });
        dispatch({ type: 'NAVIGATION_ATTEMPTED' });
      }, 3000);
      
      timeouts.push(level1, level2, level3);
    }
    
    // Clean up all timeouts when component unmounts or when state changes
    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [state.status, state.navigationAttempted, dispatch]);
};
