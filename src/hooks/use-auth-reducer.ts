
import { useReducer } from 'react';

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
  switch (action.type) {
    case 'START_PROCESSING':
      return { ...state, processingAuth: true, authError: null };
    case 'PROCESSING_COMPLETE':
      return { ...state, processingAuth: false };
    case 'AUTH_SUCCESS':
      return { ...state, processingAuth: false, authError: null };
    case 'AUTH_ERROR':
      return { ...state, processingAuth: false, authError: action.payload };
    case 'URL_PROCESSED':
      return { ...state, urlProcessed: true };
    case 'CLEANUP':
      return initialAuthState;
    case 'BATCH_UPDATE':
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

export const useAuthReducer = () => {
  return useReducer(authReducer, initialAuthState);
};
