
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
  console.log('[AuthReducer] Action:', action.type, action);
  
  let newState: AuthState;
  
  switch (action.type) {
    case 'START_PROCESSING':
      // Only update if not already processing
      if (state.processingAuth) return state;
      newState = { ...state, processingAuth: true, authError: null };
      break;
    case 'PROCESSING_COMPLETE':
      // Only update if currently processing
      if (!state.processingAuth) return state;
      newState = { ...state, processingAuth: false };
      break;
    case 'AUTH_SUCCESS':
      newState = { ...state, processingAuth: false, authError: null };
      break;
    case 'AUTH_ERROR':
      newState = { ...state, processingAuth: false, authError: action.payload };
      break;
    case 'URL_PROCESSED':
      // Only update if not already processed
      if (state.urlProcessed) return state;
      newState = { ...state, urlProcessed: true };
      break;
    case 'CLEANUP':
      newState = initialAuthState;
      break;
    case 'BATCH_UPDATE':
      newState = { ...state, ...action.payload };
      break;
    default:
      return state;
  }
  
  console.log('[AuthReducer] State updated:', { previous: state, new: newState });
  return newState;
};

export const useAuthReducer = () => {
  console.log('[useAuthReducer] Hook initialized');
  return useReducer(authReducer, initialAuthState);
};
