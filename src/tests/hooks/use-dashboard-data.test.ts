
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getAllClients, getClientsCountByStatus } from '@/lib/data';

// Mock the data functions
vi.mock('@/lib/data', () => ({
  getAllClients: vi.fn(),
  getClientsCountByStatus: vi.fn(),
  getAverageNPS: vi.fn(),
  getNPSMonthlyTrend: vi.fn(),
  getChurnData: vi.fn()
}));

describe('useDashboardData', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  // Fix the wrapper component type definition
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  beforeEach(() => {
    queryClient.clear();
    vi.clearAllMocks();
  });

  it('fetches and returns dashboard data successfully', async () => {
    const mockClients = [
      { id: '1', name: 'Client 1' },
      { id: '2', name: 'Client 2' }
    ];

    const mockCounts = {
      active: 5,
      'at-risk': 2,
      churned: 1,
      new: 3
    };

    (getAllClients as jest.Mock).mockResolvedValue(mockClients);
    (getClientsCountByStatus as jest.Mock).mockResolvedValue(mockCounts);

    const { result } = renderHook(() => useDashboardData(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.clients).toEqual(mockClients);
    expect(result.current.clientCounts).toEqual(mockCounts);
    expect(result.current.error).toBe(null);
  });

  it('handles errors appropriately', async () => {
    const error = new Error('Failed to fetch clients');
    (getAllClients as jest.Mock).mockRejectedValue(error);

    const { result } = renderHook(() => useDashboardData(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
  });
});
