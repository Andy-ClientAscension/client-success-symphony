
import { useReducer } from 'react';

export interface AuthState {
  isCheckingAuth: boolean;
  processingAuth: boolean;
  authError: string | null;
  urlProcessed: boolean;
}

export type AuthAction = 
  | { type: 'START_AUTH_CHECK' }
  | { type: 'FINISH_AUTH_CHECK' }
  | { type: 'PROCESSING_AUTH' }
  | { type: 'AUTH_SUCCESS' }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'URL_PROCESSED' };

export const initialAuthState: AuthState = {
  isCheckingAuth: true,
  processingAuth: false,
  authError: null,
  urlProcessed: false
};

export const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'START_AUTH_CHECK':
      return { ...state, isCheckingAuth: true };
    case 'FINISH_AUTH_CHECK':
      return { ...state, isCheckingAuth: false };
    case 'PROCESSING_AUTH':
      return { ...state, processingAuth: true };
    case 'AUTH_SUCCESS':
      return { ...state, processingAuth: false, authError: null };
    case 'AUTH_ERROR':
      return { ...state, processingAuth: false, authError: action.payload };
    case 'URL_PROCESSED':
      return { ...state, urlProcessed: true };
    default:
      return state;
  }
};

export const useAuthReducer = () => {
  return useReducer(authReducer, initialAuthState);
};
