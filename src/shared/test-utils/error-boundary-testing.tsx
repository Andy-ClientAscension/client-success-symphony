import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';

// Component that throws an error for testing
export function ThrowError({ shouldThrow = true, message = 'Test error' }: {
  shouldThrow?: boolean;
  message?: string;
}) {
  if (shouldThrow) {
    throw new Error(message);
  }
  return <div data-testid="no-error">No error</div>;
}

// Async component that throws an error
export function AsyncThrowError({ 
  shouldThrow = true, 
  message = 'Async test error',
  delay = 0 
}: {
  shouldThrow?: boolean;
  message?: string;
  delay?: number;
}) {
  React.useEffect(() => {
    if (shouldThrow) {
      setTimeout(() => {
        throw new Error(message);
      }, delay);
    }
  }, [shouldThrow, message, delay]);

  return <div data-testid="async-component">Async component</div>;
}

// Promise rejection component for testing
export function PromiseRejectionError({ 
  shouldReject = true, 
  message = 'Promise rejection error' 
}: {
  shouldReject?: boolean;
  message?: string;
}) {
  React.useEffect(() => {
    if (shouldReject) {
      Promise.reject(new Error(message));
    }
  }, [shouldReject, message]);

  return <div data-testid="promise-component">Promise component</div>;
}

// Test utilities for error boundaries
export const errorBoundaryTestUtils = {
  // Suppress console errors during error boundary tests
  suppressConsoleErrors: () => {
    const originalConsoleError = console.error;
    beforeEach(() => {
      console.error = vi.fn();
    });
    afterEach(() => {
      console.error = originalConsoleError;
    });
  },

  // Test that error boundary catches errors
  expectErrorBoundaryCatch: async (ErrorBoundaryComponent: React.ComponentType<any>) => {
    render(
      <ErrorBoundaryComponent>
        <ThrowError />
      </ErrorBoundaryComponent>
    );

    // Should show error UI instead of the error component
    expect(screen.queryByTestId('no-error')).not.toBeInTheDocument();
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  },

  // Test error boundary reset functionality
  expectErrorBoundaryReset: async (
    ErrorBoundaryComponent: React.ComponentType<any>,
    resetButtonSelector = 'button'
  ) => {
    const { rerender } = render(
      <ErrorBoundaryComponent>
        <ThrowError />
      </ErrorBoundaryComponent>
    );

    // Should show error UI
    expect(screen.getByText(/error/i)).toBeInTheDocument();

    // Click reset button
    const resetButton = screen.getByRole(resetButtonSelector);
    fireEvent.click(resetButton);

    // Rerender with non-throwing component
    rerender(
      <ErrorBoundaryComponent>
        <ThrowError shouldThrow={false} />
      </ErrorBoundaryComponent>
    );

    // Should show normal content
    expect(screen.getByTestId('no-error')).toBeInTheDocument();
  },

  // Test custom fallback rendering
  expectCustomFallback: (
    ErrorBoundaryComponent: React.ComponentType<any>,
    fallbackTestId: string
  ) => {
    render(
      <ErrorBoundaryComponent>
        <ThrowError />
      </ErrorBoundaryComponent>
    );

    expect(screen.getByTestId(fallbackTestId)).toBeInTheDocument();
  }
};

// Mock error reporting
export const mockErrorReporting = {
  captureError: vi.fn(),
  captureMessage: vi.fn(),
  addBreadcrumb: vi.fn(),
  setUser: vi.fn(),
  setTag: vi.fn(),
  setLevel: vi.fn(),
  setContext: vi.fn()
};

// Global error handler testing
export const globalErrorTestUtils = {
  // Trigger unhandled promise rejection
  triggerUnhandledRejection: (message = 'Test unhandled rejection') => {
    const promise = Promise.reject(new Error(message));
    // Prevent the promise from being handled
    promise.catch(() => {});
    return promise;
  },

  // Trigger global JavaScript error
  triggerGlobalError: (message = 'Test global error') => {
    const script = document.createElement('script');
    script.textContent = `throw new Error('${message}');`;
    document.head.appendChild(script);
    document.head.removeChild(script);
  },

  // Mock window error event
  mockWindowError: (message = 'Test error', filename = 'test.js', lineno = 1, colno = 1) => {
    const errorEvent = new ErrorEvent('error', {
      message,
      filename,
      lineno,
      colno,
      error: new Error(message)
    });
    window.dispatchEvent(errorEvent);
  },

  // Mock unhandled rejection event
  mockUnhandledRejection: (reason = 'Test rejection') => {
    const rejectionEvent = new PromiseRejectionEvent('unhandledrejection', {
      promise: Promise.reject(reason),
      reason
    });
    window.dispatchEvent(rejectionEvent);
  }
};