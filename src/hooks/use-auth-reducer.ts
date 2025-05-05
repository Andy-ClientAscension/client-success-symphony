
import { useReducer, useRef } from 'react';

export interface AuthState {
  processingAuth: boolean;
  authError: string | null;
  urlProcessed: boolean;
}

export type AuthAction = 
  | { type: 'START_PROCESSING' }
  | { type: 'PROCESSING_COMPLETE' }
  | { type: 'AUTH_SUCCESS' }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'URL_PROCESSED' }
  | { type: 'CLEANUP' }
  | { type: 'BATCH_UPDATE'; payload: Partial<AuthState> };

const initialAuthState: AuthState = {
  processingAuth: false,
  authError: null,
  urlProcessed: false
};

export const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  // Prevent unnecessary state changes to avoid re-renders
  switch (action.type) {
    case 'START_PROCESSING':
      // Only update if not already processing
      if (state.processingAuth) return state;
      return { ...state, processingAuth: true, authError: null };
      
    case 'PROCESSING_COMPLETE':
      // Only update if currently processing
      if (!state.processingAuth) return state;
      return { ...state, processingAuth: false };
      
    case 'AUTH_SUCCESS':
      // Check if this would cause a state change
      if (!state.processingAuth && state.authError === null) return state;
      return { ...state, processingAuth: false, authError: null };
      
    case 'AUTH_ERROR':
      // Only update if error message is different
      if (!state.processingAuth && state.authError === action.payload) return state;
      return { ...state, processingAuth: false, authError: action.payload };
      
    case 'URL_PROCESSED':
      // Only update if not already processed
      if (state.urlProcessed) return state;
      return { ...state, urlProcessed: true };
      
    case 'CLEANUP':
      // Only update if different from initial state
      if (state.processingAuth === initialAuthState.processingAuth && 
          state.authError === initialAuthState.authError &&
          state.urlProcessed === initialAuthState.urlProcessed) {
        return state;
      }
      return initialAuthState;
      
    case 'BATCH_UPDATE':
      // Only update if there are actual changes
      let hasChanges = false;
      for (const key in action.payload) {
        if (state[key as keyof AuthState] !== action.payload[key as keyof Partial<AuthState>]) {
          hasChanges = true;
          break;
        }
      }
      
      if (!hasChanges) return state;
      return { ...state, ...action.payload };
      
    default:
      return state;
  }
};

// Using a useMemo-like pattern to ensure we only create one reducer instance
export const useAuthReducer = () => {
  const initializedRef = useRef(false);
  const instanceRef = useRef<ReturnType<typeof useReducer> | null>(null);
  
  if (!initializedRef.current) {
    initializedRef.current = true;
    instanceRef.current = useReducer(authReducer, initialAuthState);
  }
  
  // This is safe because we only create the reducer once
  return instanceRef.current!;
};
