
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DashboardTabs } from '@/components/Dashboard/UnifiedDashboard/DashboardTabs';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

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

describe('DashboardTabs Integration', () => {
  const mockProps = {
    activeTab: 'overview',
    setActiveTab: vi.fn(),
    predictions: [],
    insights: [],
    isAnalyzing: false,
    error: null,
    comparisons: [],
    handleRefreshData: vi.fn(),
    cancelAnalysis: vi.fn(),
    trendData: [],
    lastAnalyzed: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all tab triggers', () => {
    render(<DashboardTabs {...mockProps} />, {
      wrapper: createWrapper()
    });
    
    expect(screen.getByRole('tab', { name: /overview section/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /team analytics section/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /client analytics section/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /ai insights section/i })).toBeInTheDocument();
  });

  it('changes tab when a tab trigger is clicked', async () => {
    render(<DashboardTabs {...mockProps} />, {
      wrapper: createWrapper()
    });
    
    // Click on Team Analytics tab
    const teamAnalyticsTab = screen.getByRole('tab', { name: /team analytics section/i });
    fireEvent.click(teamAnalyticsTab);
    
    // Check if setActiveTab was called with correct value
    expect(mockProps.setActiveTab).toHaveBeenCalledWith('team-analytics');
  });

  it('displays loading skeleton when lazy-loaded content is loading', async () => {
    // Set active tab to a lazy-loaded component
    render(<DashboardTabs {...mockProps} activeTab="team-analytics" />, {
      wrapper: createWrapper()
    });
    
    // Check if loading state is shown initially
    expect(screen.getByRole('status', { name: /loading tab content/i })).toBeInTheDocument();
  });

  it('handles error state in AI insights tab', async () => {
    // Set props with error
    const errorProps = {
      ...mockProps,
      activeTab: 'ai-insights',
      error: new Error('AI insights error'),
    };
    
    render(<DashboardTabs {...errorProps} />, {
      wrapper: createWrapper()
    });
    
    // Wait for error fallback to render
    await waitFor(() => {
      expect(screen.getByText(/failed to load ai insights/i)).toBeInTheDocument();
    });
  });
});
