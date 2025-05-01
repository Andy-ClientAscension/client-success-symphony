
import React from 'react';
import * as Sentry from '@sentry/react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";
import type { ComponentType, ReactNode } from 'react';

// Define the expected fallback prop types to match Sentry's requirements
type FallbackProps = {
  error: Error;
  componentStack: string;
  eventId: string;
  resetError: () => void;
};

// Default error fallback component with Sentry integration
export function DefaultErrorFallback({ 
  error, 
  eventId,
  resetError 
}: FallbackProps) {
  return (
    <div className="min-h-[200px] p-6 flex items-center justify-center">
      <Alert variant="destructive" className="max-w-lg">
        <AlertTriangle className="h-5 w-5" />
        <AlertTitle className="mb-2">Something went wrong</AlertTitle>
        <AlertDescription className="space-y-4">
          <p className="text-sm">{error.message || "An unexpected error occurred"}</p>
          
          {eventId && (
            <p className="text-xs text-muted-foreground">
              Error ID: {eventId}
            </p>
          )}
          
          <div className="flex gap-2 mt-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={resetError}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}

// Higher order component for wrapping components with Sentry error boundary
export function withSentryErrorBoundary<P extends object>(
  Component: ComponentType<P>,
  options: {
    fallback?: React.ComponentType<FallbackProps> | React.ReactNode;
    name?: string;
    onError?: (error: Error, componentStack: string, eventId: string) => void;
  } = {}
) {
  return function WithErrorBoundary(props: P) {
    const componentName = options.name || Component.displayName || Component.name || 'UnknownComponent';
    
    return (
      <Sentry.ErrorBoundary
        fallback={(fallbackProps: FallbackProps) => {
          // If fallback is a component that accepts error props
          if (typeof options.fallback === 'function') {
            const FallbackComponent = options.fallback as React.ComponentType<FallbackProps>;
            return <FallbackComponent {...fallbackProps} />;
          }
          
          // If it's a ReactNode, return it directly
          if (options.fallback && React.isValidElement(options.fallback)) {
            return options.fallback;
          }
          
          // Default fallback component
          return <DefaultErrorFallback {...fallbackProps} />;
        }}
        beforeCapture={(scope) => {
          scope.setTag("component", componentName);
          scope.setLevel("error");
        }}
        onError={(error, componentStack, eventId) => {
          console.error(`Error in component ${componentName}:`, error);
          options.onError?.(error, componentStack, eventId);
        }}
      >
        <Component {...props} />
      </Sentry.ErrorBoundary>
    );
  };
}

// Wrapper component for route-level error boundaries
export function SentryRouteErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <Sentry.ErrorBoundary
      fallback={({ error, resetError }) => (
        <div className="min-h-screen p-8 flex items-center justify-center">
          <div className="max-w-md w-full space-y-6 bg-card p-8 rounded-lg shadow-lg border">
            <div className="text-center">
              <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
              <h2 className="mt-4 text-xl font-bold">Something went wrong</h2>
              <p className="mt-2 text-muted-foreground">
                We're sorry, but something went wrong with this page. Our team has been notified.
              </p>
            </div>
            <div className="text-sm bg-muted/50 p-4 rounded-md overflow-auto max-h-32">
              {error.message}
            </div>
            <div className="flex justify-center space-x-4">
              <Button onClick={resetError} variant="outline">
                Try Again
              </Button>
              <Button onClick={() => window.location.href = '/'}>
                Go to Homepage
              </Button>
            </div>
          </div>
        </div>
      )}
    >
      {children}
    </Sentry.ErrorBoundary>
  );
}
