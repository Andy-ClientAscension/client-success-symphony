
import { toast } from "@/hooks/use-toast";
import type { ErrorOptions, ErrorState } from './errorTypes';
import { detectErrorType } from './errorMessages';

const ENV = process.env.NODE_ENV || 'development';
const IS_DEV = ENV === 'development';

export function captureError(error: Error | string, options: ErrorOptions = {}) {
  const { severity = 'medium', context, shouldNotify = true } = options;
  
  if (typeof error === 'string' && isPlaceholderDSN(error)) {
    if (IS_DEV) {
      console.warn('Error tracking is misconfigured with a placeholder DSN. This is expected in development.');
    }
    return;
  }
  
  const errorType = typeof error === 'string' ? detectErrorType(error) : detectErrorType(error);
  const userFriendlyMessage = typeof error === 'string' ? error : error.message;

  if (shouldNotify) {
    toast({
      title: errorType === 'cors' ? "CORS Error" : 
             errorType === 'network' ? "Connection Error" : 
             errorType === 'server' ? "Server Error" : "Error",
      description: userFriendlyMessage,
      variant: "destructive",
    });
  }

  if (IS_DEV) {
    console.error('Error captured:', {
      error: typeof error === 'string' ? new Error(error) : error,
      severity,
      context,
      userFriendlyMessage,
      errorType
    });
  }
}

export function captureMessage(message: string, options: ErrorOptions = {}) {
  if (IS_DEV) {
    console.log('Message captured:', message, options);
  }
}
