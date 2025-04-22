
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import UnifiedDashboard from '@/pages/UnifiedDashboard';
import Index from '@/pages/Index';
import * as dataService from '@/lib/data';
import { PerformanceAlert } from '@/components/Dashboard/PerformanceAlert';

// Mock the data service
vi.mock('@/lib/data', () => ({
  getAllClients: vi.fn(),
  getClientsCountByStatus: vi.fn(),
  getAverageNPS: vi.fn(),
  getNPSMonthlyTrend: vi.fn(),
  getChurnData: vi.fn(),
  getClientMetricsByTeam: vi.fn(),
  getRecentActivity: vi.fn(),
  getUpcomingRenewals: vi.fn(),
  updateClientNPSScore: vi.fn()
}));

// Create a wrapper with necessary providers
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Dashboard User Flows', () => {
  beforeEach(() => {
    // Setup mock return values
    vi.mocked(dataService.getAllClients).mockReturnValue([
      { id: '1', name: 'Client A', status: 'active', team: 'Team 1', npsScore: 8, startDate: '2023-01-01', endDate: '2024-01-01', contractValue: 10000 },
      { id: '2', name: 'Client B', status: 'at-risk', team: 'Team 2', npsScore: 5, startDate: '2023-01-01', endDate: '2024-01-01', contractValue: 10000 }
    ]);
    
    vi.mocked(dataService.getClientsCountByStatus).mockReturnValue({
      active: 5, 'at-risk': 2, churned: 1, new: 3, paused: 0, graduated: 0
    });
    
    vi.mocked(dataService.getAverageNPS).mockReturnValue({
      current: 7.5,
      previous: 7.2,
      change: 0.3,
      trend: 'up'
    });
    
    vi.mocked(dataService.getNPSMonthlyTrend).mockReturnValue([
      { month: 'Jan', score: 7.2, count: 10 },
      { month: 'Feb', score: 7.5, count: 12 },
      { month: 'Mar', score: 7.8, count: 15 }
    ]);
    
    vi.mocked(dataService.getChurnData).mockReturnValue([
      { month: 'Q1', rate: 5 },
      { month: 'Q2', rate: 4 }
    ]);
    
    vi.mocked(dataService.updateClientNPSScore).mockReturnValue(true);

    // Mock localStorage
    const localStorageMock = (() => {
      let store: Record<string, string> = {};
      return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => { store[key] = value; },
        clear: () => { store = {}; }
      };
    })();
    
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
  });

  afterEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
  });

  it('UnifiedDashboard loads and displays metrics', async () => {
    render(<UnifiedDashboard />, {
      wrapper: createWrapper()
    });
    
    // Initially shows loading state
    expect(screen.getByText(/loading dashboard data/i)).toBeInTheDocument();
    
    // Wait for data to load
    await waitFor(() => {
      expect(dataService.getAllClients).toHaveBeenCalled();
      expect(dataService.getClientsCountByStatus).toHaveBeenCalled();
    });
  });

  it('Index page shows performance mode alert when enabled', async () => {
    // Set performance mode in localStorage
    window.localStorage.setItem('performanceMode', 'true');
    
    render(<Index />, {
      wrapper: createWrapper()
    });
    
    await waitFor(() => {
      // Look for the performance alert
      expect(screen.getByText(/performance mode active/i)).toBeInTheDocument();
    });
  });

  it('Dashboard responds to refresh data action', async () => {
    render(<UnifiedDashboard />, {
      wrapper: createWrapper()
    });
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.queryByText(/loading dashboard data/i)).not.toBeInTheDocument();
    });
    
    // Find and click refresh button
    const refreshButton = await screen.findByRole('button', { name: /refresh dashboard data/i });
    act(() => {
      fireEvent.click(refreshButton);
    });
    
    // Verify data service methods were called again
    await waitFor(() => {
      expect(dataService.getAllClients).toHaveBeenCalledTimes(2);
    });
  });

  it('Dashboard shows error state when data loading fails', async () => {
    // Make one of the data methods throw an error
    vi.mocked(dataService.getAllClients).mockImplementation(() => {
      throw new Error('Failed to load clients');
    });
    
    render(<UnifiedDashboard />, {
      wrapper: createWrapper()
    });
    
    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText(/failed to load clients/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });
  });

  it('PerformanceAlert can be dismissed', async () => {
    render(
      <PerformanceAlert 
        dismissable={true} 
        onDismiss={() => {
          window.localStorage.setItem('hidePerformanceAlert', 'true');
        }}
        data-testid="performance-alert"
      />, 
      { wrapper: createWrapper() }
    );
    
    // Find and click dismiss button
    const dismissButton = screen.getByRole('button', { name: /dismiss alert/i });
    fireEvent.click(dismissButton);
    
    // Check localStorage was updated
    expect(window.localStorage.getItem('hidePerformanceAlert')).toBe('true');
  });

  it('Dashboard tabs navigation works correctly', async () => {
    render(<UnifiedDashboard />, {
      wrapper: createWrapper()
    });
    
    // Wait for dashboard to load
    await waitFor(() => {
      expect(screen.queryByText(/loading dashboard data/i)).not.toBeInTheDocument();
    });
    
    // Find and click on the Team Analytics tab  
    const teamAnalyticsTab = await screen.findByRole('tab', { name: /team analytics/i });
    fireEvent.click(teamAnalyticsTab);
    
    // Check that Team Analytics section is active
    await waitFor(() => {
      const teamAnalyticsSection = screen.getByRole('tabpanel', { selected: true });
      expect(teamAnalyticsSection).toBeInTheDocument();
    });
  });
});
