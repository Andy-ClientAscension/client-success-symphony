
interface ErrorInfo {
  componentStack: string;
  [key: string]: any;
}

export function logError(error: Error, errorInfo?: ErrorInfo) {
  // Log to console in development
  if (process.env.NODE_ENV !== 'production') {
    console.group('Error Boundary Caught Error:');
    console.error('Error:', error);
    console.error('Error Name:', error.name);
    console.error('Error Message:', error.message);
    console.error('Error Stack:', error.stack);
    if (errorInfo) {
      console.error('Component Stack:', errorInfo.componentStack);
      console.error('Additional Info:', errorInfo);
    }
    console.groupEnd();
  }
  
  // Here we can add external error logging services in the future
  // Example: Sentry.captureException(error, { extra: errorInfo });
}
