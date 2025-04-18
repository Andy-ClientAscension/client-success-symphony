import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import UnifiedDashboard from '@/pages/UnifiedDashboard';
import { BrowserRouter } from 'react-router-dom';
import { 
  getAllClients, 
  getClientsCountByStatus, 
  getAverageNPS, 
  getNPSMonthlyTrend, 
  getChurnData, 
  getClientMetricsByTeam,
  getRecentActivity,
  getUpcomingRenewals 
} from '@/lib/data';

// Import vi explicitly
import { vi } from 'vitest';

// Mock the data functions
vi.mock('@/lib/data', () => ({
  getAllClients: vi.fn(),
  getClientsCountByStatus: vi.fn(),
  getAverageNPS: vi.fn(),
  getNPSMonthlyTrend: vi.fn(),
  getChurnData: vi.fn(),
  getClientMetricsByTeam: vi.fn(),
  getRecentActivity: vi.fn(),
  getUpcomingRenewals: vi.fn()
}));

describe('Dashboard Integration', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  beforeEach(() => {
    queryClient.clear();
    vi.clearAllMocks();
    
    // Setup mock return values using proper Vitest typing
    (getAllClients as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (getClientsCountByStatus as ReturnType<typeof vi.fn>).mockResolvedValue({
      active: 5, 'at-risk': 2, churned: 1, new: 3
    });
    (getAverageNPS as ReturnType<typeof vi.fn>).mockResolvedValue(8.5);
    (getNPSMonthlyTrend as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (getChurnData as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (getClientMetricsByTeam as ReturnType<typeof vi.fn>).mockResolvedValue({
      totalMRR: 10000,
      totalCallsBooked: 42,
      totalDealsClosed: 15,
      performanceTrends: [],
      trends: {
        retentionTrend: 5,
        atRiskTrend: -2,
        churnTrend: -3
      }
    });
    (getRecentActivity as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    (getUpcomingRenewals as ReturnType<typeof vi.fn>).mockResolvedValue([]);
  });

  it('renders dashboard and loads data', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <UnifiedDashboard />
        </BrowserRouter>
      </QueryClientProvider>
    );
    
    // Initial loading state
    expect(screen.getByText(/overview/i)).toBeInTheDocument();
    
    // Check after data is loaded
    await waitFor(() => {
      expect(getAllClients).toHaveBeenCalled();
      expect(getClientsCountByStatus).toHaveBeenCalled();
    });
  });
});
