
import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from "@/components/Layout/Layout";
import { useToast } from "@/hooks/use-toast";
import { useAuthStateMachineContext } from '@/contexts/auth-state-machine';
import { useSessionCoordination } from '@/hooks/use-session-coordination';
import { PageLoader } from '@/components/PageTransition/PageLoader';
import { createAbortController } from "@/utils/abortUtils";

// This is the landing page that redirects based on auth state
export default function Index() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const processedUrlRef = useRef<boolean>(false);
  const navigationLockRef = useRef<boolean>(false);
  
  // Get the auth state machine context with all its methods
  const { 
    state: authState, 
    isAuthenticated,
    authenticateWithToken,
    getNewOperationId
  } = useAuthStateMachineContext();
  
  const { checkSession } = useSessionCoordination();

  // Process access token from URL if present (only once)
  useEffect(() => {
    if (processedUrlRef.current) return;
    
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
        getNewOperationId();
        
        await authenticateWithToken(accessToken, refreshToken);
      } catch (error) {
        if (!signal.aborted) {
          console.error("[Index] Error in token authentication:", error);
        }
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
    // Skip if we're already processing auth
    if (authState === 'checking_token' || authState === 'checking_session') {
      return;
    }
    
    // Initialize auth state if needed
    if (authState === 'initializing' && isAuthenticated === null) {
      console.log("[Index] Initializing auth state machine");
      
      // Create a separate abort controller for session check
      const { controller, signal } = createAbortController();
      getNewOperationId();
      
      const checkAuthSession = async () => {
        try {
          if (signal.aborted) return;
          
          await checkSession(false);
        } catch (error) {
          if (!signal.aborted) {
            console.error("[Index] Error checking session:", error);
          }
        }
      };
      
      checkAuthSession();
      
      // Clean up the controller on effect cleanup
      return () => {
        controller.abort('Operation completed');
      };
    }
    
    // Handle navigation with lock mechanism to prevent race conditions
    const navigateWithLock = (path: string, replace = true) => {
      if (!navigationLockRef.current) {
        navigationLockRef.current = true;
        console.log(`[Index] Navigating to: ${path}`);
        navigate(path, { replace });
        
        // Release lock after a short delay
        setTimeout(() => {
          navigationLockRef.current = false;
        }, 100);
      } else {
        console.log(`[Index] Navigation to ${path} blocked by lock`);
      }
    };
    
    // Handle authenticated state
    if (isAuthenticated === true && authState === 'authenticated') {
      console.log("[Index] User is authenticated, redirecting to dashboard");
      navigateWithLock('/dashboard', true);
    }
    
    // Handle unauthenticated state with a slight delay to allow for race conditions
    if (isAuthenticated === false && authState === 'unauthenticated') {
      console.log("[Index] User is not authenticated, redirecting to login");
      navigateWithLock('/login', true);
    }
    
  }, [authState, isAuthenticated, navigate, checkSession, getNewOperationId]);
  
  // Log current auth state information
  useEffect(() => {
    console.log('[Index] Auth state:', { 
      state: authState,
      isAuthenticated
    });
  }, [authState, isAuthenticated]);

  return (
    <Layout>
      <PageLoader message="Checking authentication status and redirecting" />
    </Layout>
  );
}
