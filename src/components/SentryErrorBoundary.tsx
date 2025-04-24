
import * as Sentry from '@sentry/react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import type { ComponentType } from 'react';

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
        fallback={(errorData) => {
          // If fallback is a component that accepts error props
          if (typeof options.fallback === 'function') {
            const FallbackComponent = options.fallback;
            return <FallbackComponent error={errorData.error} />;
          }
          // If it's a ReactNode or undefined
          return options.fallback || <ErrorBoundary />;
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
