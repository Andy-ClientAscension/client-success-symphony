
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PerformanceAlert } from '@/components/Dashboard/PerformanceAlert';

describe('PerformanceAlert Component', () => {
  it('renders with default props', () => {
    render(<PerformanceAlert />);
    
    expect(screen.getByText('Performance Mode Active')).toBeInTheDocument();
    expect(screen.getByText(/Heavy components like the Client List/i)).toBeInTheDocument();
    
    // Default severity is success
    const alert = screen.getByRole('status');
    expect(alert).toBeInTheDocument();
  });

  it('renders with custom message and title', () => {
    render(
      <PerformanceAlert 
        title="Custom Title" 
        message="Custom message for testing" 
      />
    );
    
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
    expect(screen.getByText('Custom message for testing')).toBeInTheDocument();
  });

  it('renders with error severity and appropriate ARIA attributes', () => {
    render(<PerformanceAlert severity="error" title="Error Alert" />);
    
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveAttribute('aria-live', 'assertive');
  });

  it('calls onDismiss when dismiss button is clicked', () => {
    const handleDismiss = vi.fn();
    
    render(
      <PerformanceAlert 
        dismissable={true} 
        onDismiss={handleDismiss} 
      />
    );
    
    const dismissButton = screen.getByRole('button', { name: /dismiss alert/i });
    fireEvent.click(dismissButton);
    
    expect(handleDismiss).toHaveBeenCalledTimes(1);
  });

  it('does not render dismiss button when dismissable is false', () => {
    render(<PerformanceAlert dismissable={false} />);
    
    const dismissButton = screen.queryByRole('button', { name: /dismiss alert/i });
    expect(dismissButton).not.toBeInTheDocument();
  });
});
