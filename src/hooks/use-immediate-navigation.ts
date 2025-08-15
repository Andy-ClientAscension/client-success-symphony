import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useNavigationGuard } from './use-navigation-guard';
import { navTelemetry } from '@/utils/navigation-telemetry';

/**
 * Hook that ensures immediate navigation without blocking on data fetching
 * Data loads are deferred until after route transition completes
 */
export function useImmediateNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { guardedNavigate } = useNavigationGuard();

  /**
   * Navigate immediately without waiting for any data operations
   * This ensures first-click navigation works regardless of network latency
   */
  const navigateImmediately = useCallback((path: string, replace = false) => {
    // Log navigation click for telemetry
    const clickId = navTelemetry.logNavClick(path);
    
    // Use guarded navigation to prevent double-clicks but don't block on data
    const success = guardedNavigate(path, replace, clickId);
    
    if (success) {
      // Dispatch event to notify components that navigation occurred
      // This allows components to start data loading AFTER navigation
      window.dispatchEvent(new CustomEvent('navigation:completed', {
        detail: { from: location.pathname, to: path, timestamp: Date.now(), clickId }
      }));
      
      // Log completion after a brief delay to ensure DOM has updated
      setTimeout(() => {
        navTelemetry.logNavComplete(path, clickId);
      }, 50);
    }
    
    return success;
  }, [guardedNavigate, location.pathname]);

  /**
   * Navigate with optional data prefetching that doesn't block the transition
   * Prefetch starts immediately but navigation proceeds regardless
   */
  const navigateWithPrefetch = useCallback((path: string, prefetchFn?: () => Promise<void>) => {
    // Start prefetch immediately but don't wait for it
    if (prefetchFn) {
      prefetchFn().catch(error => {
        console.warn('Prefetch failed but navigation will proceed:', error);
      });
    }
    
    // Navigate immediately regardless of prefetch status
    return navigateImmediately(path);
  }, [navigateImmediately]);

  return {
    navigateImmediately,
    navigateWithPrefetch,
    currentPath: location.pathname
  };
}