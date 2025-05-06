
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNavigationTimeout } from '@/hooks/use-navigation-timeout';

// Mock dependencies
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(() => {})
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

vi.mock('@/contexts/auth-state-machine', () => ({
  useAuthStateMachineContext: () => ({
    dispatch: vi.fn(),
    state: 'initializing'
  })
}));

describe('useNavigationTimeout', () => {
  beforeEach(() => {
    // Mock timers
    vi.useFakeTimers();
  });

  afterEach(() => {
    // Reset mocks and timers
    vi.resetAllMocks();
    vi.useRealTimers();
  });

  it('should create a timeout that triggers navigation', () => {
    const { result } = renderHook(() => useNavigationTimeout({ delay: 1000 }));
    
    // Start a timeout
    act(() => {
      result.current.startTimeout('/test');
    });
    
    // Check that we have a pending navigation
    expect(result.current.hasPendingNavigation()).toBe(true);
    expect(result.current.getPendingDestination()).toBe('/test');
    
    // Fast forward time to trigger the timeout
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    
    // After timeout, navigation should be triggered
    expect(result.current.hasPendingNavigation()).toBe(false);
  });

  it('should clear existing timeout when new one is started', () => {
    const { result } = renderHook(() => useNavigationTimeout());
    
    // Start a timeout
    act(() => {
      result.current.startTimeout('/first');
    });
    
    // Start another one that should clear the first
    act(() => {
      result.current.startTimeout('/second');
    });
    
    // Check that destination was updated
    expect(result.current.getPendingDestination()).toBe('/second');
    
    // Manually clear the timeout
    act(() => {
      result.current.clearTimeout();
    });
    
    // Check that timeout was cleared
    expect(result.current.hasPendingNavigation()).toBe(false);
    expect(result.current.getPendingDestination()).toBeNull();
  });
  
  it('should execute immediate navigation and clear any pending timeouts', () => {
    const { result } = renderHook(() => useNavigationTimeout());
    
    // Start a timeout
    act(() => {
      result.current.startTimeout('/delayed');
    });
    
    // Execute immediate navigation
    act(() => {
      result.current.navigateNow('/immediate');
    });
    
    // Check that timeout was cleared and we're no longer navigating
    expect(result.current.hasPendingNavigation()).toBe(false);
    
    // Fast forward past the original timeout
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    
    // No additional navigation should happen
    expect(result.current.hasPendingNavigation()).toBe(false);
  });
});
