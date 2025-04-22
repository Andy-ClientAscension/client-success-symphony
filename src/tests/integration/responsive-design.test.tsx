
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import UnifiedDashboard from '@/pages/UnifiedDashboard';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PerformanceAlert } from '@/components/Dashboard/PerformanceAlert';
import { DashboardHeader } from '@/components/Dashboard/UnifiedDashboard/DashboardHeader';
import * as dataService from '@/lib/data';

// Mock the data service
vi.mock('@/lib/data', () => ({
  getAllClients: vi.fn().mockReturnValue([]),
  getClientsCountByStatus: vi.fn().mockReturnValue({
    active: 5, 'at-risk': 2, churned: 1, new: 3
  }),
  getAverageNPS: vi.fn().mockReturnValue(8),
  getNPSMonthlyTrend: vi.fn().mockReturnValue([]),
  getChurnData: vi.fn().mockReturnValue([]),
  getClientMetricsByTeam: vi.fn().mockReturnValue({
    totalMRR: 10000,
    totalCallsBooked: 42,
    totalDealsClosed: 15
  }),
  getRecentActivity: vi.fn().mockReturnValue([]),
  getUpcomingRenewals: vi.fn().mockReturnValue([])
}));

// Mock useIsMobile hook
vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: vi.fn().mockReturnValue({ isMobile: false })
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

describe('Responsive Design Tests', () => {
  const originalInnerWidth = window.innerWidth;
  const originalInnerHeight = window.innerHeight;
  
  const setScreenSize = (width: number, height: number) => {
    Object.defineProperty(window, 'innerWidth', { value: width, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: height, writable: true });
    window.dispatchEvent(new Event('resize'));
  };
  
  afterEach(() => {
    setScreenSize(originalInnerWidth, originalInnerHeight);
  });

  describe('Mobile viewport tests', () => {
    beforeEach(() => {
      setScreenSize(375, 667); // iPhone 8 size
      
      // Override the mock to return mobile: true
      vi.mock('@/hooks/use-mobile', () => ({
        useIsMobile: vi.fn().mockReturnValue({ isMobile: true })
      }));
    });

    it('DashboardHeader adapts to mobile viewport', () => {
      const { container } = render(
        <DashboardHeader 
          isRefreshing={false} 
          handleRefreshData={() => {}} 
          lastUpdated={new Date()} 
        />
      );
      
      // Check for flex-col class which makes it stack vertically on mobile
      const header = container.firstChild;
      expect(header).toHaveClass('flex-col');
    });

    it('PerformanceAlert adapts to mobile viewport', () => {
      render(<PerformanceAlert />);
      
      // In mobile mode, text should still be readable
      const alertTitle = screen.getByText('Performance Mode Active');
      const computedStyle = window.getComputedStyle(alertTitle);
      expect(Number(computedStyle.fontSize.replace('px', ''))).toBeGreaterThanOrEqual(14);
    });
  });

  describe('Desktop viewport tests', () => {
    beforeEach(() => {
      setScreenSize(1920, 1080); // Large desktop
      
      // Override the mock to return mobile: false
      vi.mock('@/hooks/use-mobile', () => ({
        useIsMobile: vi.fn().mockReturnValue({ isMobile: false })
      }));
    });

    it('DashboardHeader uses horizontal layout on desktop', () => {
      const { container } = render(
        <DashboardHeader 
          isRefreshing={false} 
          handleRefreshData={() => {}} 
          lastUpdated={new Date()} 
        />
      );
      
      // Check for md:flex-row class which makes it horizontal on desktop
      const header = container.firstChild;
      expect(header).toHaveClass('md:flex-row');
    });
  });

  describe('Tablet viewport tests', () => {
    beforeEach(() => {
      setScreenSize(768, 1024); // iPad size
    });

    it('Dashboard layout adjusts to tablet size', async () => {
      render(<UnifiedDashboard />, {
        wrapper: createWrapper()
      });
      
      // Check for classes specific to tablet layout (like a grid with fewer columns)
      // Wait for loading to complete
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      // Check that grid layout is changed for tablet
      const gridContainers = document.querySelectorAll('.grid');
      expect(gridContainers.length).toBeGreaterThan(0);
      
      // At least one grid container should have a responsive class
      let hasResponsiveGrid = false;
      gridContainers.forEach(container => {
        if (container.classList.contains('md:grid-cols-2')) {
          hasResponsiveGrid = true;
        }
      });
      
      expect(hasResponsiveGrid).toBeTruthy();
    });
  });
});
