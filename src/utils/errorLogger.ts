
interface ErrorInfo {
  componentStack: string;
  [key: string]: any;
}

export function logError(error: Error, errorInfo?: ErrorInfo) {
  // Log to console in development
  if (process.env.NODE_ENV !== 'production') {
    console.group('Error Boundary Caught Error:');
    console.error('Error:', error);
    console.error('Component Stack:', errorInfo?.componentStack);
    console.groupEnd();
  }
  
  // Here we can add external error logging services in the future
  // Example: Sentry.captureException(error, { extra: errorInfo });
}
