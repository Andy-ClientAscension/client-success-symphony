
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DashboardHeader } from '@/components/Dashboard/UnifiedDashboard/DashboardHeader';

describe('DashboardHeader Component', () => {
  const mockProps = {
    isRefreshing: false,
    handleRefreshData: vi.fn(),
    lastUpdated: new Date(),
  };

  it('renders correctly with all required props', () => {
    render(<DashboardHeader {...mockProps} />);
    
    expect(screen.getByText(/last updated:/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /refresh dashboard data/i })).toBeInTheDocument();
  });

  it('shows loading state when refreshing', () => {
    render(<DashboardHeader {...mockProps} isRefreshing={true} />);
    
    expect(screen.getByText(/refreshing…/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /refreshing…/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /refreshing…/i })).toBeDisabled();
  });

  it('displays error message when provided', () => {
    const errorProps = {
      ...mockProps,
      error: new Error('Test error message'),
    };
    
    render(<DashboardHeader {...errorProps} />);
    
    expect(screen.getByText('Test error message')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('calls refresh function when refresh button is clicked', () => {
    render(<DashboardHeader {...mockProps} />);
    
    const refreshButton = screen.getByRole('button', { name: /refresh dashboard data/i });
    fireEvent.click(refreshButton);
    
    expect(mockProps.handleRefreshData).toHaveBeenCalledTimes(1);
  });

  it('renders children when provided', () => {
    render(
      <DashboardHeader {...mockProps}>
        <button>Test Child</button>
      </DashboardHeader>
    );
    
    expect(screen.getByRole('button', { name: 'Test Child' })).toBeInTheDocument();
  });
});
