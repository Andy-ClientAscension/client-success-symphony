import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { safeLogger } from '@/utils/code-quality-fixes';
import { errorService, type ErrorState } from '@/utils/error';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  const errorState: ErrorState = errorService.createErrorState(error);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-3">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">
            Something went wrong
          </h1>
          <p className="text-muted-foreground">
            {errorState.message || "An unexpected error occurred"}
          </p>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={resetErrorBoundary}
            className="w-full"
            variant="default"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try again
          </Button>
          
          <Button 
            onClick={() => window.location.reload()}
            variant="outline"
            className="w-full"
          >
            Reload page
          </Button>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <details className="text-left bg-muted p-4 rounded text-sm">
            <summary className="cursor-pointer font-medium mb-2">
              Error details (development only)
            </summary>
            <pre className="whitespace-pre-wrap text-xs overflow-auto">
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

interface EnhancedErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: { componentStack: string }) => void;
}

export function EnhancedErrorBoundary({ 
  children, 
  fallback = ErrorFallback,
  onError 
}: EnhancedErrorBoundaryProps) {
  const handleError = (error: Error, errorInfo: { componentStack: string }) => {
    // Log error using safe logger
    safeLogger.error('React Error Boundary caught error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });

    // Use error service for consistent error handling
    errorService.captureError(error, {
      severity: 'high',
      context: errorInfo,
      shouldNotify: false // Don't show toast as we have the fallback UI
    });

    // Call custom error handler if provided
    onError?.(error, errorInfo);
  };

  return (
    <ErrorBoundary
      FallbackComponent={fallback}
      onError={handleError}
      onReset={() => {
        // Optional: Clear any error state when resetting
        window.location.hash = '';
      }}
    >
      {children}
    </ErrorBoundary>
  );
}