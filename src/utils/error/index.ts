
import { detectErrorType, getUserFriendlyMessage } from './errorMessages';
import { captureError, captureMessage } from './errorNotification';
import type { ErrorOptions, ErrorState, ErrorType, ErrorSeverity } from './errorTypes';
import { isAuthError, isCorsError, isNetworkError, isValidationError, isPlaceholderDSN } from './errorDetection';

export const errorService = {
  isPlaceholderDSN,
  detectErrorType,
  getUserFriendlyMessage,
  captureError,
  captureMessage,

  createErrorState(error: unknown, fallbackMessage = "An unexpected error occurred"): ErrorState {
    if (typeof error === 'string' && isPlaceholderDSN(error)) {
      return {
        message: fallbackMessage,
        type: 'unknown'
      };
    }
    
    const errorType = detectErrorType(error);
    const message = getUserFriendlyMessage(error, fallbackMessage);
    
    let code: string | number | undefined;
    let details: unknown;
    
    if (error && typeof error === 'object') {
      if ('code' in error) {
        code = (error as { code: string | number }).code;
      }
      details = error;
    }
    
    return { message, type: errorType, code, details };
  },

  handleNetworkError(error: unknown, options: ErrorOptions = {}) {
    const errorType = detectErrorType(error);
    const userFriendlyMessage = getUserFriendlyMessage(error, "Network error occurred");
    
    if (IS_DEV) {
      console.error('Network error:', error);
    }
    
    const errorObject = error instanceof Error ? error : new Error(userFriendlyMessage);
    
    captureError(errorObject, {
      ...options,
      severity: errorType === 'cors' ? 'high' : 'medium',
      context: { 
        errorType,
        isNetwork: errorType === 'network' || errorType === 'cors',
        ...options.context 
      }
    });
    
    return userFriendlyMessage;
  },

  isNetworkError(error: unknown): boolean {
    const errorType = detectErrorType(error);
    return errorType === 'network' || errorType === 'cors';
  },

  isAuthError: isAuthError,
  isValidationError: isValidationError,
  isServerError(error: unknown): boolean {
    return detectErrorType(error) === 'server';
  }
};

export type { ErrorOptions, ErrorState, ErrorType, ErrorSeverity };
