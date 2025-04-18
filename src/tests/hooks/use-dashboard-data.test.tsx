
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { 
  getAllClients, 
  getClientsCountByStatus, 
  getAverageNPS, 
  getNPSMonthlyTrend, 
  getChurnData, 
  getClientMetricsByTeam 
} from '@/lib/data';
import React from 'react';
import { calculatePerformanceTrends } from '@/utils/aiDataAnalyzer';

// Mock the data functions
vi.mock('@/lib/data', () => ({
  getAllClients: vi.fn(),
  getClientsCountByStatus: vi.fn(),
  getAverageNPS: vi.fn(),
  getNPSMonthlyTrend: vi.fn(),
  getChurnData: vi.fn(),
  getClientMetricsByTeam: vi.fn()
}));

// Mock the aiDataAnalyzer utility
vi.mock('@/utils/aiDataAnalyzer', () => ({
  calculatePerformanceTrends: vi.fn(() => [])
}));

describe('useDashboardData', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  // Wrapper for the React Query provider
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

    const mockNPSData = [
      { month: 'Jan', score: 8, count: 10 },
      { month: 'Feb', score: 9, count: 12 }
    ];

    const mockChurnData = [
      { month: 'Jan', rate: 2.1 },
      { month: 'Feb', rate: 1.8 }
    ];

    const mockMetrics = {
      totalMRR: 10000,
      totalCallsBooked: 42,
      totalDealsClosed: 15,
      performanceTrends: [],
      trends: {
        retentionTrend: 5,
        atRiskTrend: -2,
        churnTrend: -3
      }
    };

    // Set up mock return values
    (getAllClients as unknown as vi.Mock).mockResolvedValue(mockClients);
    (getClientsCountByStatus as unknown as vi.Mock).mockResolvedValue(mockCounts);
    (getAverageNPS as unknown as vi.Mock).mockResolvedValue(9.2);
    (getNPSMonthlyTrend as unknown as vi.Mock).mockResolvedValue(mockNPSData);
    (getChurnData as unknown as vi.Mock).mockResolvedValue(mockChurnData);
    (getClientMetricsByTeam as unknown as vi.Mock).mockResolvedValue(mockMetrics);
    (calculatePerformanceTrends as unknown as vi.Mock).mockReturnValue([]);

    const { result } = renderHook(() => useDashboardData(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.clients).toEqual(mockClients);
    expect(result.current.clientCounts).toEqual(mockCounts);
    expect(result.current.npsData).toEqual(mockNPSData);
    expect(result.current.churnData).toEqual(mockChurnData);
    expect(result.current.metrics).toEqual(mockMetrics);
    expect(result.current.error).toBe(null);
  });

  it('handles errors appropriately', async () => {
    const error = new Error('Failed to fetch clients');
    (getAllClients as unknown as vi.Mock).mockRejectedValue(error);

    const { result } = renderHook(() => useDashboardData(), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
  });
});
