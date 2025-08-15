import { useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { navTelemetry } from '@/utils/navigation-telemetry';

interface NavigationGuardOptions {
  preventDoubleClick?: boolean;
  debounceMs?: number;
  clickId?: string; // For telemetry tracking
}

/**
 * Hook to prevent navigation race conditions and ensure single-click consistency
 */
export function useNavigationGuard(options: NavigationGuardOptions = {}) {
  const { preventDoubleClick = true, debounceMs = 300 } = options;
  const navigate = useNavigate();
  const location = useLocation();
  const navigationLockRef = useRef<boolean>(false);
  const lastNavigationRef = useRef<{ path: string; timestamp: number } | null>(null);

  const guardedNavigate = useCallback((path: string, replace?: boolean, clickId?: string) => {
    const now = Date.now();
    
    // Prevent navigation to same route
    if (location.pathname === path) {
      console.log(`[NavigationGuard] Already on ${path}, skipping navigation`);
      return false;
    }

    // Prevent double-click navigation
    if (preventDoubleClick && navigationLockRef.current) {
      console.log(`[NavigationGuard] Navigation locked, preventing duplicate navigation to ${path}`);
      return false;
    }

    // Debounce rapid navigation attempts to same path
    if (lastNavigationRef.current?.path === path && 
        now - lastNavigationRef.current.timestamp < debounceMs) {
      console.log(`[NavigationGuard] Debouncing rapid navigation to ${path}`);
      return false;
    }

    // Execute navigation with lock
    navigationLockRef.current = true;
    lastNavigationRef.current = { path, timestamp: now };
    
    console.log(`[NavigationGuard] Navigating to ${path}`, { replace });
    
    try {
      navigate(path, { replace });
      
      // Release lock after navigation completes
      setTimeout(() => {
        navigationLockRef.current = false;
      }, 100);
      
      return true;
    } catch (error) {
      console.error(`[NavigationGuard] Navigation failed:`, error);
      navigationLockRef.current = false;
      return false;
    }
  }, [navigate, location.pathname, preventDoubleClick, debounceMs]);

  const clearNavigationLock = useCallback(() => {
    navigationLockRef.current = false;
  }, []);

  return {
    guardedNavigate,
    clearNavigationLock,
    isNavigationLocked: () => navigationLockRef.current
  };
}