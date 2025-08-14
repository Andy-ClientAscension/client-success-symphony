
import { useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Hook for safe navigation with protection against race conditions
 */
export function useProtectedNavigation() {
  const navigate = useNavigate();
  const navigationLockRef = useRef<boolean>(false);
  const isMountedRef = useRef<boolean>(true);
  
  // Safe navigation with lock mechanism to prevent race conditions
  const navigateWithLock = useCallback((path: string, options?: { replace?: boolean }) => {
    if (!navigationLockRef.current && isMountedRef.current) {
      navigationLockRef.current = true;
      // Navigating to specified path
      navigate(path, options);
      
      // Release lock after a short delay
      setTimeout(() => {
        navigationLockRef.current = false;
      }, 100);
      
      return true;
    } else {
      // Navigation blocked by lock or unmount
      return false;
    }
  }, [navigate]);
  
  return { navigateWithLock };
}
