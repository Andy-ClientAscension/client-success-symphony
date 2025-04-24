
import * as Sentry from '@sentry/react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import type { ComponentType } from 'react';

export function withSentryErrorBoundary<P extends object>(
  Component: ComponentType<P>,
  options: {
    fallback?: React.ReactNode;
    name?: string;
  } = {}
) {
  return function WithErrorBoundary(props: P) {
    return (
      <Sentry.ErrorBoundary
        fallback={options.fallback ?? ErrorBoundary}
        beforeCapture={(scope) => {
          scope.setTag('component', options.name || Component.displayName || Component.name);
        }}
      >
        <Component {...props} />
      </Sentry.ErrorBoundary>
    );
  };
}

