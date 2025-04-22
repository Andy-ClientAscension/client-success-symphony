
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { MockAuthProvider } from '../utils/authTestUtils';

// Mock react-router-dom navigate function
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual as any,
    Navigate: vi.fn(({ to }) => <div data-testid="navigate" data-to={to}>Redirecting...</div>)
  };
});

// Mock console.log to avoid noise in tests
vi.spyOn(console, 'log').mockImplementation(() => {});

describe('ProtectedRoute', () => {
  it('renders children when user is authenticated', () => {
    render(
      <MockAuthProvider authenticated={true}>
        <ProtectedRoute>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRoute>
      </MockAuthProvider>
    );
    
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
  });
  
  it('redirects to login when user is not authenticated', () => {
    render(
      <MockAuthProvider authenticated={false}>
        <ProtectedRoute>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRoute>
      </MockAuthProvider>
    );
    
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    expect(screen.getByTestId('navigate')).toBeInTheDocument();
    expect(screen.getByTestId('navigate')).toHaveAttribute('data-to', '/login');
  });
  
  it('shows loading state when authentication is being checked', () => {
    render(
      <MockAuthProvider authenticated={true} loading={true}>
        <ProtectedRoute>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRoute>
      </MockAuthProvider>
    );
    
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    expect(screen.getByText(/checking authentication/i)).toBeInTheDocument();
  });
  
  it('shows error message when authentication check fails', () => {
    render(
      <MockAuthProvider authenticated={false} error={new Error('Auth error')}>
        <ProtectedRoute>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRoute>
      </MockAuthProvider>
    );
    
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    expect(screen.getByText(/authentication error/i)).toBeInTheDocument();
    expect(screen.getByText(/auth error/i)).toBeInTheDocument();
  });
});
