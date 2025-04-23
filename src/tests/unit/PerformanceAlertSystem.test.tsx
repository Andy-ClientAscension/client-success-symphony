
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PerformanceAlertSystem } from '@/components/Dashboard/PerformanceAlertSystem';
import * as accessibilityLib from '@/lib/accessibility';

// Mock the announceToScreenReader function
vi.mock('@/lib/accessibility', () => ({
  announceToScreenReader: vi.fn(),
  focusRingClasses: 'focus:outline-none focus:ring-2 focus:ring-primary'
}));

describe('PerformanceAlertSystem Component', () => {
  // Mock localStorage before each test
  let localStorageMock: Record<string, string> = {};
  
  beforeEach(() => {
    localStorageMock = {};
    global.localStorage = {
      getItem: (key: string) => localStorageMock[key] || null,
      setItem: (key: string, value: string) => { localStorageMock[key] = value; },
      removeItem: (key: string) => { delete localStorageMock[key]; },
      clear: () => { localStorageMock = {}; },
      length: 0,
      key: () => null
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when performance mode is off', () => {
    render(<PerformanceAlertSystem performanceMode={false} />);
    expect(screen.queryByTestId('performance-alert')).not.toBeInTheDocument();
  });

  it('should render when performance mode is on and alert not dismissed', () => {
    render(<PerformanceAlertSystem performanceMode={true} />);
    expect(screen.getByTestId('performance-alert')).toBeInTheDocument();
  });

  it('should not render when performance mode is on but alert was dismissed', () => {
    // Set localStorage to indicate the alert was dismissed
    localStorageMock['hidePerformanceAlert'] = 'true';
    
    render(<PerformanceAlertSystem performanceMode={true} />);
    expect(screen.queryByTestId('performance-alert')).not.toBeInTheDocument();
  });

  it('should announce to screen readers when performance mode is activated', () => {
    render(<PerformanceAlertSystem performanceMode={true} />);
    
    expect(accessibilityLib.announceToScreenReader).toHaveBeenCalledWith(
      'Performance mode activated. Some heavy components have been moved to improve dashboard speed.',
      'polite'
    );
  });

  it('should dismiss alert and set localStorage when dismiss button is clicked', () => {
    render(<PerformanceAlertSystem performanceMode={true} />);
    
    const dismissButton = screen.getByRole('button', { name: /dismiss alert/i });
    fireEvent.click(dismissButton);
    
    // Check localStorage was updated
    expect(localStorageMock['hidePerformanceAlert']).toBe('true');
    
    // Check announcement was made
    expect(accessibilityLib.announceToScreenReader).toHaveBeenCalledWith(
      'Performance alert dismissed',
      'polite'
    );
    
    // Check alert is no longer in the document
    expect(screen.queryByTestId('performance-alert')).not.toBeInTheDocument();
  });
});
