
import { useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuthStateMachineContext } from '@/contexts/auth-state-machine';

interface NavigationTimeoutOptions {
  /** Delay before navigation in milliseconds */
  delay?: number;
  /** Whether to show a toast when the timeout fires */
  showToast?: boolean;
  /** Custom toast message when timeout navigation occurs */
  timeoutMessage?: string;
  /** Whether the navigation is critical (will force navigation on timeout) */
  isCritical?: boolean;
}

/**
 * Hook for managing navigation timeouts with auth state integration
 */
export function useNavigationTimeout(defaultOptions: NavigationTimeoutOptions = {}) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const timeoutIdRef = useRef<NodeJS.Timeout | undefined>();
  const isNavigatingRef = useRef<boolean>(false);
  const destinationRef = useRef<string | null>(null);
  
  // Get auth context for coordination with auth state
  const { dispatch: authDispatch, state: authState } = useAuthStateMachineContext();

  // Default options
  const defaultDelay = defaultOptions.delay || 5000;
  const defaultShowToast = defaultOptions.showToast !== false;
  const defaultIsCritical = defaultOptions.isCritical || false;
  
  // Clear any existing timeout when component unmounts
  useEffect(() => {
    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = undefined;
      }
    };
  }, []);
  
  // Method to clear the current timeout
  const clearTimeout = useCallback(() => {
    if (timeoutIdRef.current) {
      window.clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = undefined;
      destinationRef.current = null;
    }
  }, []);
  
  // Start a new navigation timeout
  const startTimeout = useCallback((
    path: string, 
    options: NavigationTimeoutOptions = {}
  ) => {
    // Clear any existing timeout first
    clearTimeout();
    
    // Set the destination
    destinationRef.current = path;
    
    // Use provided options or fall back to defaults
    const delay = options.delay ?? defaultDelay;
    const showToast = options.showToast ?? defaultShowToast;
    const timeoutMessage = options.timeoutMessage ?? 'Navigation timeout - redirecting';
    const isCritical = options.isCritical ?? defaultIsCritical;
    
    // Notify auth state machine that navigation was triggered
    authDispatch({ type: 'NAVIGATE_START' });
    
    // Start the timeout
    timeoutIdRef.current = setTimeout(() => {
      if (!isNavigatingRef.current) {
        isNavigatingRef.current = true;
        
        // Show toast if enabled
        if (showToast) {
          toast({
            title: 'Navigation Timeout',
            description: timeoutMessage,
            variant: isCritical ? 'destructive' : 'default',
          });
        }
        
        // Perform the navigation
        console.log(`[NavigationTimeout] Timeout triggered - navigating to: ${path}`);
        navigate(path, { replace: true });
        
        // Notify auth state machine that navigation completed
        authDispatch({ type: 'NAVIGATE_COMPLETE' });
        
        // Reset after navigation
        setTimeout(() => {
          isNavigatingRef.current = false;
          destinationRef.current = null;
        }, 100);
      }
    }, delay);
    
    // Return the destination path for reference
    return path;
  }, [navigate, clearTimeout, toast, authDispatch, defaultDelay, defaultShowToast, defaultIsCritical]);
  
  // Execute immediate navigation and clear any pending timeout
  const navigateNow = useCallback((path: string, replace: boolean = true) => {
    clearTimeout();
    isNavigatingRef.current = true;
    
    console.log(`[NavigationTimeout] Immediate navigation to: ${path}`);
    navigate(path, { replace });
    
    // Notify auth state machine that navigation completed
    authDispatch({ type: 'NAVIGATE_COMPLETE' });
    
    // Reset after navigation
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 100);
  }, [navigate, clearTimeout, authDispatch]);
  
  // Check if there's a pending navigation
  const hasPendingNavigation = useCallback(() => {
    return timeoutIdRef.current !== undefined;
  }, []);
  
  // Get the current destination if any
  const getPendingDestination = useCallback(() => {
    return destinationRef.current;
  }, []);
  
  return {
    startTimeout,
    clearTimeout,
    navigateNow,
    hasPendingNavigation,
    getPendingDestination,
    isNavigating: isNavigatingRef.current
  };
}
