import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppRoutes from '../../../routes';
import { createTestQueryClient } from '../mock-providers';

// Mock pages to avoid complex dependencies
vi.mock('../../../pages/Dashboard', () => ({
  default: () => <div data-testid="dashboard-page">Dashboard Page</div>
}));

vi.mock('../../../pages/Clients', () => ({
  default: () => <div data-testid="clients-page">Clients Page</div>
}));

vi.mock('../../../pages/Analytics', () => ({
  default: () => <div data-testid="analytics-page">Analytics Page</div>
}));

vi.mock('../../../pages/Login', () => ({
  default: () => <div data-testid="login-page">Login Page</div>
}));

vi.mock('../../../pages/NotFound', () => ({
  default: () => <div data-testid="not-found-page">404 Not Found</div>
}));

vi.mock('../../../pages/Settings', () => ({
  default: () => <div data-testid="settings-page">Settings Page</div>
}));

describe('Routes Integration Tests', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
  });

  const renderWithProviders = (initialEntries: string[] = ['/']) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          <AppRoutes />
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  it('should redirect root path to dashboard', async () => {
    renderWithProviders(['/']);
    
    await waitFor(() => {
      expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
    });
  });

  it('should render dashboard route', async () => {
    renderWithProviders(['/dashboard']);
    
    await waitFor(() => {
      expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
    });
  });

  it('should render clients route', async () => {
    renderWithProviders(['/clients']);
    
    await waitFor(() => {
      expect(screen.getByTestId('clients-page')).toBeInTheDocument();
    });
  });

  it('should render analytics route', async () => {
    renderWithProviders(['/analytics']);
    
    await waitFor(() => {
      expect(screen.getByTestId('analytics-page')).toBeInTheDocument();
    });
  });

  it('should render login route', async () => {
    renderWithProviders(['/login']);
    
    await waitFor(() => {
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });
  });

  it('should render settings route', async () => {
    renderWithProviders(['/settings']);
    
    await waitFor(() => {
      expect(screen.getByTestId('settings-page')).toBeInTheDocument();
    });
  });

  it('should render 404 page for unknown routes', async () => {
    renderWithProviders(['/unknown-route']);
    
    await waitFor(() => {
      expect(screen.getByTestId('not-found-page')).toBeInTheDocument();
    });
  });

  it('should handle multiple route navigation', async () => {
    const { rerender } = renderWithProviders(['/dashboard']);
    
    await waitFor(() => {
      expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
    });

    rerender(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/clients']}>
          <AppRoutes />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('clients-page')).toBeInTheDocument();
    });
  });

  it('should handle route with params', async () => {
    renderWithProviders(['/analytics?period=30d']);
    
    await waitFor(() => {
      expect(screen.getByTestId('analytics-page')).toBeInTheDocument();
    });
  });
});