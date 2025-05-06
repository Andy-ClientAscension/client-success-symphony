
import { useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCoordinatedTimeout } from './use-timeout-coordinator';
import { useToast } from './use-toast';

export interface NavigationTimeoutOptions {
  delay?: number;
  showToast?: boolean;
  timeoutMessage?: string;
  replaceCurrent?: boolean;
  isCritical?: boolean;
}

/**
 * Hook for creating navigation timeouts with proper cleanup
 */
export function useNavigationTimeout(options: NavigationTimeoutOptions = {}) {
  const {
    delay = 5000,
    showToast = true,
    timeoutMessage = 'Navigation timed out. Redirecting...',
    replaceCurrent = false
  } = options;
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const pathRef = useRef<string | null>(null);
  
  // Use coordinated timeout system
  const { startTimeout: startCoordinatedTimeout, clearTimeout, clearHierarchy, timeoutId } = useCoordinatedTimeout(
    undefined,
    {
      onTimeout: () => {
        if (pathRef.current) {
          navigate(pathRef.current, { replace: replaceCurrent });
        }
      },
      description: showToast ? timeoutMessage : undefined
    }
  );
  
  // Start navigation timeout
  const startTimeout = useCallback((path: string, customOptions?: Partial<NavigationTimeoutOptions>) => {
    const timeoutDelay = customOptions?.delay ?? delay;
    pathRef.current = path;
    
    if (customOptions?.showToast !== false && customOptions?.timeoutMessage) {
      const finalMessage = customOptions.timeoutMessage;
      toast({
        title: 'Navigation Timer Started',
        description: finalMessage
      });
    }
    
    return startCoordinatedTimeout(timeoutDelay);
  }, [startCoordinatedTimeout, delay, toast]);
  
  // Navigate immediately and cancel timeout
  const navigateNow = useCallback((path: string, replace: boolean = false) => {
    clearTimeout();
    navigate(path, { replace });
  }, [navigate, clearTimeout]);
  
  // Check if there is a pending navigation timeout
  const hasPendingNavigation = useCallback(() => {
    return timeoutId !== null && pathRef.current !== null;
  }, [timeoutId]);
  
  // Get the pending destination path, if any
  const getPendingDestination = useCallback(() => {
    return pathRef.current;
  }, []);
  
  return {
    startTimeout,
    clearTimeout,
    clearHierarchy,
    navigateNow,
    timeoutId,
    hasPendingNavigation,
    getPendingDestination
  };
}
