
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from "@/components/Layout/Layout";
import { useToast } from "@/hooks/use-toast";
import { useAuthStateMachineContext } from '@/contexts/auth-state-machine';
import { useSessionCoordination } from '@/hooks/use-session-coordination';
import { PageLoader } from '@/components/PageTransition/PageLoader';
import { createAbortController } from "@/utils/abortUtils";
import { useNavigationTimeout } from '@/hooks/use-navigation-timeout';
import { CriticalLoadingState } from '@/components/CriticalLoadingState';

// This is the landing page that redirects based on auth state
export default function Index() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const processedUrlRef = useRef<boolean>(false);
  const [authCheckComplete, setAuthCheckComplete] = useState<boolean>(false);
  const [checkingToken, setCheckingToken] = useState<boolean>(false);
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);
  
  // Use our new navigation timeout hook
  const { startTimeout, clearTimeout, navigateNow } = useNavigationTimeout({
    delay: 1000, // Slightly increased delay for Index page navigation
    showToast: false // Don't show toast for normal redirects
  });
  
  // Get the auth state machine context with all its methods
  const { 
    state: authState, 
    isAuthenticated,
    authenticateWithToken,
    getNewOperationId
  } = useAuthStateMachineContext();
  
  const { checkSession } = useSessionCoordination();
  
  // Handle timeout for stuck states
  useEffect(() => {
    // Only set up a timeout if we're still checking auth
    if (!authCheckComplete && !navigatingTo) {
      console.log("[Index] Setting up auth check timeout");
      
      const timeoutId = setTimeout(() => {
        if (!authCheckComplete && !navigatingTo) {
          console.warn("[Index] Auth check timeout reached, redirecting to login");
          setNavigatingTo('/login');
          navigateNow('/login', true);
        }
      }, 5000); // 5 seconds max for auth check
      
      return () => clearTimeout(timeoutId);
    }
  }, [authCheckComplete, navigatingTo, navigateNow]);

  // Process access token from URL if present (only once)
  useEffect(() => {
    if (processedUrlRef.current || checkingToken) return;
    
    console.log("[Index] Checking for auth token in URL");
    
    // Check for auth token in URL
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    
    if (!accessToken) {
      console.log("[Index] No access token in URL");
      processedUrlRef.current = true;
      return;
    }
    
    // Flag as processed immediately to prevent duplicate processing
    processedUrlRef.current = true;
    setCheckingToken(true);
    
    // Process the access token with abort control
    console.log("[Index] Processing access token from URL");
    const refreshToken = hashParams.get('refresh_token') || '';
    
    // Create a new abort controller for this request
    const { controller, signal } = createAbortController();
    
    // Clean up URL before authentication attempt
    window.history.replaceState(null, '', window.location.pathname);
    
    // Use the authentication helper with abort signal handling
    const processToken = async () => {
      try {
        if (signal.aborted) return;
        
        // Track the current operation ID to detect outdated operations
        getNewOperationId(); // Fixed: Removed the argument
        
        const success = await authenticateWithToken(accessToken, refreshToken);
        console.log("[Index] Token authentication result:", success);
        
        setCheckingToken(false);
      } catch (error) {
        if (!signal.aborted) {
          console.error("[Index] Error in token authentication:", error);
        }
        setCheckingToken(false);
      }
    };
    
    processToken();
    
    // Clean up the controller on effect cleanup
    return () => {
      controller.abort('Component unmounted');
    };
    
  }, [navigate, authenticateWithToken, toast, getNewOperationId]);
  
  // Initialize auth state and handle redirects
  useEffect(() => {
    // Skip if we're already navigating somewhere
    if (navigatingTo) return;
    
    // Cancel any pending navigation timeouts when auth state changes
    clearTimeout();
    
    // Skip if we're checking a token from the URL
    if (checkingToken) {
      console.log("[Index] Skipping auth check while processing token from URL");
      return;
    }
    
    // Skip if we're already processing auth
    if (authState === 'checking_token' || authState === 'checking_session') {
      console.log("[Index] Skipping auth check while state is:", authState);
      return;
    }
    
    // Initialize auth state if needed
    if (authState === 'initializing' && isAuthenticated === null) {
      console.log("[Index] Initializing auth state machine");
      
      // Create a separate abort controller for session check
      const { controller, signal } = createAbortController();
      getNewOperationId(); // Fixed: Removed the argument
      
      const checkAuthSession = async () => {
        try {
          if (signal.aborted) return;
          
          const result = await checkSession(false);
          console.log("[Index] Session check completed with result:", result);
          setAuthCheckComplete(true);
        } catch (error) {
          if (!signal.aborted) {
            console.error("[Index] Error checking session:", error);
          }
          setAuthCheckComplete(true);
        }
      };
      
      checkAuthSession();
      
      // Clean up the controller on effect cleanup
      return () => {
        controller.abort('Operation completed');
      };
    }
    
    // Handle authenticated state with navigation timeout
    if (isAuthenticated === true && authState === 'authenticated') {
      console.log("[Index] User is authenticated, redirecting to dashboard");
      setAuthCheckComplete(true);
      setNavigatingTo('/dashboard');
      navigateNow('/dashboard', true);
      return;
    }
    
    // Handle unauthenticated state with navigation timeout
    if (isAuthenticated === false && authState === 'unauthenticated') {
      console.log("[Index] User is not authenticated, redirecting to login");
      setAuthCheckComplete(true);
      setNavigatingTo('/login');
      navigateNow('/login', true);
      return;
    }
    
    // Set up a backup navigation timeout for uncertain states
    if (authState === 'initializing' && !authCheckComplete) {
      console.log("[Index] Setting up backup navigation timeout");
      // Will redirect to login after delay if no state resolution
      startTimeout('/login', { 
        delay: 3000,
        timeoutMessage: 'Authentication check taking too long - redirecting to login'
      });
      return;
    }
    
  }, [
    authState, 
    isAuthenticated, 
    navigateNow, 
    startTimeout, 
    clearTimeout, 
    checkSession, 
    getNewOperationId, 
    navigatingTo, 
    checkingToken,
    authCheckComplete
  ]);
  
  // Render appropriate loading or redirecting UI
  if (navigatingTo) {
    return (
      <Layout>
        <PageLoader message={`Redirecting to ${navigatingTo.replace('/', '')}`} />
      </Layout>
    );
  }

  if (checkingToken) {
    return (
      <Layout>
        <PageLoader message="Verifying authentication token" />
      </Layout>
    );
  }

  if (authState === 'checking_token' || authState === 'checking_session') {
    return (
      <Layout>
        <PageLoader message={`Checking authentication (${authState})`} />
      </Layout>
    );
  }

  if (authState === 'initializing') {
    return (
      <Layout>
        <CriticalLoadingState 
          message="Initializing authentication" 
          timeout={3000}
          fallbackAction={() => {
            console.log("[Index] Auth initialization timeout, redirecting to login");
            navigateNow('/login', true);
          }}
        />
      </Layout>
    );
  }

  // Default loading state
  return (
    <Layout>
      <PageLoader message="Checking authentication status and redirecting" />
    </Layout>
  );
}
