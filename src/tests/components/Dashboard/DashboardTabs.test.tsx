
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DashboardTabs } from '@/components/Dashboard/UnifiedDashboard/DashboardTabs';

// Mock child components
vi.mock('../TeamAnalytics', () => ({
  TeamAnalytics: () => <div data-testid="team-analytics">Team Analytics</div>
}));

vi.mock('../ClientAnalytics', () => ({
  ClientAnalytics: () => <div data-testid="client-analytics">Client Analytics</div>
}));

describe('DashboardTabs', () => {
  const defaultProps = {
    activeTab: 'overview',
    setActiveTab: vi.fn(),
    predictions: [],
    insights: [],
    isAnalyzing: false,
    error: null,
    comparisons: [],
    handleRefreshData: vi.fn(),
    trendData: [],
    lastAnalyzed: null,
    cancelAnalysis: vi.fn()
  };

  it('renders all tab triggers', () => {
    render(<DashboardTabs {...defaultProps} />);
    
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Team Analytics')).toBeInTheDocument();
    expect(screen.getByText('Client Analytics')).toBeInTheDocument();
    expect(screen.getByText('AI Insights')).toBeInTheDocument();
  });

  it('changes active tab when clicking tab triggers', () => {
    const setActiveTab = vi.fn();
    render(<DashboardTabs {...defaultProps} setActiveTab={setActiveTab} />);
    
    fireEvent.click(screen.getByText('Team Analytics'));
    expect(setActiveTab).toHaveBeenCalledWith('team-analytics');
  });

  it('displays loading state when switching tabs', () => {
    render(<DashboardTabs {...defaultProps} />);
    
    fireEvent.click(screen.getByText('Team Analytics'));
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
