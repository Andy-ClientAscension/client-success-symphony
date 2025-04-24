
import { isAuthError, isCorsError, isNetworkError, isPlaceholderDSN, isValidationError } from './errorDetection';
import type { ErrorType } from './errorTypes';

export function detectErrorType(error: unknown): ErrorType {
  if (!error) return 'unknown';
  
  if (typeof error === 'string' && isPlaceholderDSN(error)) {
    return 'unknown';
  }
  
  if (isCorsError(error)) return 'cors';
  if (isNetworkError(error)) return 'network';
  if (isAuthError(error)) return 'auth';
  if (isValidationError(error)) return 'validation';
  
  if (error instanceof Error && (error.message.includes('500') || error.message.includes('server error'))) {
    return 'server';
  }
  
  if (typeof error === 'string' && (error.includes('500') || error.includes('server error'))) {
    return 'server';
  }
  
  return 'unknown';
}

export function getUserFriendlyMessage(error: unknown, fallbackMessage = "An unexpected error occurred"): string {
  if (typeof error === 'string' && isPlaceholderDSN(error)) {
    return fallbackMessage;
  }
  
  const errorType = detectErrorType(error);
  
  switch (errorType) {
    case 'cors':
      return "Network request was blocked by CORS policy. Please contact the administrator.";
    case 'network':
      return "Network connection error. Please check your internet connection and try again.";
    case 'auth':
      return "Authentication error. Please log in again to continue.";
    case 'validation':
      return error instanceof Error ? error.message : "The provided data is invalid. Please check your input and try again.";
    case 'server':
      return "Server error. Our team has been notified and is working on a fix.";
    default:
      if (error instanceof Error) {
        return error.message || fallbackMessage;
      }
      if (typeof error === 'string') {
        return error;
      }
      if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
        return error.message;
      }
      return fallbackMessage;
  }
}
