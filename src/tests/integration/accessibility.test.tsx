
import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { KeyboardNavigationGuide } from '@/components/Dashboard/Accessibility/KeyboardNavigationGuide';
import { SkipLink } from '@/components/Dashboard/Accessibility/SkipLink';
import { PerformanceAlert } from '@/components/Dashboard/PerformanceAlert';
import { DashboardHeader } from '@/components/Dashboard/UnifiedDashboard/DashboardHeader';

// Add jest-axe custom matcher
expect.extend(toHaveNoViolations);

describe('Accessibility Tests', () => {
  it('SkipLink has no accessibility violations', async () => {
    const { container } = render(<SkipLink targetId="main" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('KeyboardNavigationGuide has no accessibility violations', async () => {
    const { container } = render(<KeyboardNavigationGuide />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('PerformanceAlert has no accessibility violations', async () => {
    const { container } = render(
      <PerformanceAlert 
        title="Test Alert" 
        message="This is a test alert message" 
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('DashboardHeader has no accessibility violations', async () => {
    const { container } = render(
      <DashboardHeader 
        isRefreshing={false} 
        handleRefreshData={() => {}} 
        lastUpdated={new Date()} 
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('PerformanceAlert has correct ARIA attributes based on severity', () => {
    // Test info alert
    const { rerender } = render(<PerformanceAlert severity="info" />);
    let alert = screen.getByRole('status');
    expect(alert).toHaveAttribute('aria-live', 'polite');
    
    // Test error alert
    rerender(<PerformanceAlert severity="error" />);
    alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('aria-live', 'assertive');
  });
  
  it('Skip link becomes visible on focus', () => {
    render(<SkipLink targetId="content" />);
    
    const skipLink = screen.getByText('Skip to main content');
    expect(skipLink).toHaveClass('sr-only');
    
    // Focus the skip link
    skipLink.focus();
    
    // It should now have focus class that makes it visible
    expect(skipLink).toHaveClass('focus:not-sr-only');
  });
});
