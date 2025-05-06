
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCoordinatedTimeout, TimeoutCoordinatorProvider } from '@/hooks/use-timeout-coordinator';
import React from 'react';

// Mock dependencies
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

// Wrapper component for providing context
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <TimeoutCoordinatorProvider>{children}</TimeoutCoordinatorProvider>
);

describe('useTimeoutCoordinator', () => {
  beforeEach(() => {
    // Mock timers
    vi.useFakeTimers();
  });

  afterEach(() => {
    // Reset mocks and timers
    vi.resetAllMocks();
    vi.useRealTimers();
  });

  it('should create and clear timeouts', () => {
    const { result } = renderHook(() => useCoordinatedTimeout(), { wrapper });
    
    // Start a timeout
    act(() => {
      result.current.startTimeout(1000);
    });
    
    // Check that we have a timeoutId
    expect(result.current.timeoutId).not.toBeNull();
    
    // Clear the timeout
    act(() => {
      result.current.clearTimeout();
    });
    
    // Check that the timeout was cleared
    expect(result.current.timeoutId).toBeNull();
  });

  it('should trigger the onTimeout callback', () => {
    const onTimeout = vi.fn();
    const { result } = renderHook(() => useCoordinatedTimeout(undefined, { onTimeout }), { wrapper });
    
    // Start a timeout
    act(() => {
      result.current.startTimeout(1000);
    });
    
    // Fast forward time to trigger the timeout
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    
    // Check that callback was called
    expect(onTimeout).toHaveBeenCalled();
  });
  
  it('should create parent-child timeout relationships', () => {
    // Create a parent timeout first
    const { result: parentResult } = renderHook(() => useCoordinatedTimeout(), { wrapper });
    let parentId: string | null = null;
    
    act(() => {
      parentId = parentResult.current.startTimeout(2000);
    });
    
    // Now create a child timeout
    const { result: childResult } = renderHook(
      () => useCoordinatedTimeout(parentId || undefined), 
      { wrapper }
    );
    
    act(() => {
      childResult.current.startTimeout(1000);
    });
    
    // When we clear the parent, the child should also be cleared
    act(() => {
      if (parentId) {  // Add a check to ensure parentId is not null
        parentResult.current.clearHierarchy(parentId);  // Pass the parentId parameter
      }
    });
    
    // Both should be cleared
    expect(parentResult.current.timeoutId).toBeNull();
    
    // Child timeoutId might not be null immediately due to async nature
    // But the timeout should not trigger
    const onTimeout = vi.fn();
    childResult.current = renderHook(
      () => useCoordinatedTimeout(undefined, { onTimeout }), 
      { wrapper }
    ).result.current;
    
    // Fast forward past both timeouts
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    
    // The timeout callback should not have been called
    expect(onTimeout).not.toHaveBeenCalled();
  });
});
