
import * as Sentry from '@sentry/react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import type { ComponentType, ReactNode } from 'react';

// Define the expected fallback prop types to match Sentry's requirements
type FallbackProps = {
  error: Error;
  componentStack: string;
  eventId: string;
  resetError: () => void;
};

export function withSentryErrorBoundary<P extends object>(
  Component: ComponentType<P>,
  options: {
    fallback?: React.ComponentType<{ error: Error; resetError?: () => void }> | React.ReactNode;
    name?: string;
  } = {}
) {
  return function WithErrorBoundary(props: P) {
    return (
      <Sentry.ErrorBoundary
        fallback={(errorData: FallbackProps) => {
          // If fallback is a component that accepts error props
          if (typeof options.fallback === 'function') {
            const FallbackComponent = options.fallback;
            return <FallbackComponent error={errorData.error} resetError={errorData.resetError} />;
          }
          
          // If it's a ReactNode, return it directly
          if (options.fallback && React.isValidElement(options.fallback)) {
            return options.fallback;
          }
          
          // Default fallback component
          return <ErrorBoundary customMessage="An unexpected error occurred">{null}</ErrorBoundary>;
        }}
        beforeCapture={(scope) => {
          scope.setTag('component', options.name || Component.displayName || Component.name);
        }}
      >
        <Component {...props} />
      </Sentry.ErrorBoundary>
    );
  };
}
