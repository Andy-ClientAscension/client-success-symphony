
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Index from '@/pages/Index';

// Setup providers wrapper
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const AllTheProviders = ({ children }) => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  </BrowserRouter>
);

describe('Dashboard Integration', () => {
  beforeEach(() => {
    queryClient.clear();
  });

  it('renders dashboard with all major components', async () => {
    render(<Index />, { wrapper: AllTheProviders });

    // Check main sections are present
    expect(screen.getByText('Performance Report')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /metrics overview/i })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /performance charts/i })).toBeInTheDocument();
  });

  it('handles tab navigation correctly', async () => {
    render(<Index />, { wrapper: AllTheProviders });

    // Click Team Analytics tab
    fireEvent.click(screen.getByRole('tab', { name: /team analytics/i }));
    
    await waitFor(() => {
      expect(screen.getByRole('tabpanel', { name: /team analytics/i })).toBeInTheDocument();
    });
  });

  it('allows refreshing dashboard data', async () => {
    render(<Index />, { wrapper: AllTheProviders });

    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    fireEvent.click(refreshButton);

    await waitFor(() => {
      expect(screen.getByRole('region', { name: /metrics overview/i })).toBeInTheDocument();
    });
  });
});
