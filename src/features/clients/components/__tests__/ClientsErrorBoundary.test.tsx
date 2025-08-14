import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@/shared/test-utils';
import { ClientsErrorBoundary } from '../ClientsErrorBoundary';
import { ThrowError, errorBoundaryTestUtils } from '@/shared/test-utils/error-boundary-testing';

// Suppress console errors during tests
const originalConsoleError = console.error;
beforeEach(() => {
  console.error = vi.fn();
});

afterEach(() => {
  console.error = originalConsoleError;
});

describe('ClientsErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <ClientsErrorBoundary>
        <div data-testid="child-content">Client content</div>
      </ClientsErrorBoundary>
    );

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  it('renders error fallback when child component throws', () => {
    render(
      <ClientsErrorBoundary>
        <ThrowError message="Clients module error" />
      </ClientsErrorBoundary>
    );

    expect(screen.getByText(/clients module error/i)).toBeInTheDocument();
    expect(screen.getByText(/something went wrong while loading the clients interface/i)).toBeInTheDocument();
  });

  it('shows try again and go home buttons', () => {
    render(
      <ClientsErrorBoundary>
        <ThrowError />
      </ClientsErrorBoundary>
    );

    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /go home/i })).toBeInTheDocument();
  });

  it('shows error details in development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    render(
      <ClientsErrorBoundary>
        <ThrowError message="Detailed error message" />
      </ClientsErrorBoundary>
    );

    expect(screen.getByText(/error details/i)).toBeInTheDocument();
    
    process.env.NODE_ENV = originalEnv;
  });

  it('handles try again button click', () => {
    const { rerender } = render(
      <ClientsErrorBoundary>
        <ThrowError />
      </ClientsErrorBoundary>
    );

    const tryAgainButton = screen.getByRole('button', { name: /try again/i });
    fireEvent.click(tryAgainButton);

    // Rerender with non-throwing component
    rerender(
      <ClientsErrorBoundary>
        <div data-testid="recovered-content">Recovered content</div>
      </ClientsErrorBoundary>
    );

    expect(screen.getByTestId('recovered-content')).toBeInTheDocument();
  });
});