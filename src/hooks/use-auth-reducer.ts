
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
  // Use a more direct approach to reduce re-renders
  switch (action.type) {
    case 'START_PROCESSING':
      return state.processingAuth ? state : { ...state, processingAuth: true, authError: null };
      
    case 'PROCESSING_COMPLETE':
      return state.processingAuth ? { ...state, processingAuth: false } : state;
      
    case 'AUTH_SUCCESS':
      return { ...state, processingAuth: false, authError: null };
      
    case 'AUTH_ERROR':
      return { ...state, processingAuth: false, authError: action.payload };
      
    case 'URL_PROCESSED':
      return state.urlProcessed ? state : { ...state, urlProcessed: true };
      
    case 'CLEANUP':
      return initialAuthState;
      
    case 'BATCH_UPDATE':
      return { ...state, ...action.payload };
      
    default:
      return state;
  }
};

// Custom hook that ensures only one reducer instance
export const useAuthReducer = () => {
  const memoizedReducer = useRef<ReturnType<typeof useReducer> | null>(null);
  
  if (memoizedReducer.current === null) {
    memoizedReducer.current = useReducer(authReducer, initialAuthState);
  }
  
  return memoizedReducer.current;
};
