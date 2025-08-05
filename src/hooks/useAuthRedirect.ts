import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { useAuthStateMachineContext } from '@/contexts/auth-state-machine';
import { useSessionCoordination } from '@/hooks/use-session-coordination';
import { useNavigationTimeout } from '@/hooks/use-navigation-timeout';
import { createAbortController } from "@/utils/abortUtils";

interface UseAuthRedirectOptions {
  onAuthenticatedPath?: string;
  onUnauthenticatedPath?: string;
  timeoutMs?: number;
}

export function useAuthRedirect(options: UseAuthRedirectOptions = {}) {
  const {
    onAuthenticatedPath = '/dashboard',
    onUnauthenticatedPath = '/login',
    timeoutMs = 5000
  } = options;

  const navigate = useNavigate();
  const { toast } = useToast();
  const [authCheckComplete, setAuthCheckComplete] = useState(false);
  const [checkingToken, setCheckingToken] = useState(false);
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);
  
  const { startTimeout, clearTimeout, navigateNow } = useNavigationTimeout({
    delay: 1000,
    showToast: false
  });
  
  const { 
    state: authState, 
    isAuthenticated,
    authenticateWithToken,
    getNewOperationId
  } = useAuthStateMachineContext();
  
  const { checkSession } = useSessionCoordination();

  // Process URL token authentication
  const processUrlToken = useCallback(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    
    if (!accessToken) return false;
    
    setCheckingToken(true);
    
    const refreshToken = hashParams.get('refresh_token') || '';
    const { controller, signal } = createAbortController();
    
    // Clean up URL
    window.history.replaceState(null, '', window.location.pathname);
    
    const processToken = async () => {
      try {
        if (signal.aborted) return;
        
        getNewOperationId();
        const success = await authenticateWithToken(accessToken, refreshToken);
        console.log("[useAuthRedirect] Token authentication result:", success);
      } catch (error) {
        if (!signal.aborted) {
          console.error("[useAuthRedirect] Error in token authentication:", error);
        }
      } finally {
        setCheckingToken(false);
      }
    };
    
    processToken();
    return true;
  }, [authenticateWithToken, getNewOperationId]);

  // Initialize session check
  const initializeAuth = useCallback(async () => {
    if (checkingToken || navigatingTo) return;
    
    // Skip if already processing
    if (authState === 'checking_token' || authState === 'checking_session') {
      return;
    }
    
    if (authState === 'initializing' && isAuthenticated === null) {
      const { controller, signal } = createAbortController();
      getNewOperationId();
      
      try {
        if (signal.aborted) return;
        const result = await checkSession(false);
        console.log("[useAuthRedirect] Session check completed:", result);
        setAuthCheckComplete(true);
      } catch (error) {
        if (!signal.aborted) {
          console.error("[useAuthRedirect] Error checking session:", error);
        }
        setAuthCheckComplete(true);
      }
    }
  }, [authState, isAuthenticated, checkingToken, navigatingTo, getNewOperationId, checkSession]);

  // Handle navigation based on auth state
  const handleNavigation = useCallback(() => {
    if (navigatingTo || checkingToken) return;
    
    clearTimeout();
    
    if (isAuthenticated === true && authState === 'authenticated') {
      console.log("[useAuthRedirect] User authenticated, redirecting to:", onAuthenticatedPath);
      setAuthCheckComplete(true);
      setNavigatingTo(onAuthenticatedPath);
      navigateNow(onAuthenticatedPath, true);
    } else if (isAuthenticated === false && authState === 'unauthenticated') {
      console.log("[useAuthRedirect] User unauthenticated, redirecting to:", onUnauthenticatedPath);
      setAuthCheckComplete(true);
      setNavigatingTo(onUnauthenticatedPath);
      navigateNow(onUnauthenticatedPath, true);
    } else if (authState === 'initializing' && !authCheckComplete) {
      startTimeout(onUnauthenticatedPath, { 
        delay: 3000,
        timeoutMessage: 'Authentication check taking too long - redirecting to login'
      });
    }
  }, [
    authState,
    isAuthenticated,
    navigatingTo,
    checkingToken,
    authCheckComplete,
    onAuthenticatedPath,
    onUnauthenticatedPath,
    clearTimeout,
    navigateNow,
    startTimeout
  ]);

  // Setup timeout for stuck states
  useEffect(() => {
    if (!authCheckComplete && !navigatingTo) {
      const timeoutId = setTimeout(() => {
        if (!authCheckComplete && !navigatingTo) {
          console.warn("[useAuthRedirect] Auth check timeout, redirecting to login");
          setNavigatingTo(onUnauthenticatedPath);
          navigateNow(onUnauthenticatedPath, true);
        }
      }, timeoutMs);
      
      return () => {
        clearTimeout();
        window.clearTimeout(timeoutId);
      };
    }
  }, [authCheckComplete, navigatingTo, navigateNow, onUnauthenticatedPath, timeoutMs]);

  return {
    authCheckComplete,
    checkingToken,
    navigatingTo,
    authState,
    isAuthenticated,
    processUrlToken,
    initializeAuth,
    handleNavigation,
    
    // Computed states for UI
    isProcessing: checkingToken || authState === 'checking_token' || authState === 'checking_session',
    isInitializing: authState === 'initializing',
    shouldShowRedirectMessage: !!navigatingTo,
    redirectTarget: navigatingTo
  };
}