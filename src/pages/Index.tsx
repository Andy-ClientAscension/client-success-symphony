
import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout } from "@/components/Layout/Layout";
import { LoadingState } from "@/components/LoadingState";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { announceToScreenReader } from "@/lib/accessibility";
import { useAuthStateMachineContext } from '@/contexts/auth-state-machine';
import { useSessionCoordination } from '@/hooks/use-session-coordination';
import { safeAbort, createAbortController } from "@/utils/abortUtils";

// This is the landing page that redirects based on auth state
export default function Index() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const processedUrlRef = useRef<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Get the auth state machine context with all its methods
  const authContext = useAuthStateMachineContext();
  const { 
    state: authState, 
    dispatch, 
    isAuthenticated,
    authenticateWithToken
  } = authContext;
  
  const { 
    refreshSession, 
    checkSession 
  } = useSessionCoordination();

  // Clean up abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        safeAbort(abortControllerRef.current, 'Component unmounted');
        abortControllerRef.current = null;
      }
    };
  }, []);
  
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
    
    // Abort any previous ongoing request
    if (abortControllerRef.current) {
      safeAbort(abortControllerRef.current, 'New token authentication requested');
    }

    // Create a new abort controller for this request
    const { controller, signal } = createAbortController();
    abortControllerRef.current = controller;
    
    // Clean up URL before authentication attempt
    window.history.replaceState(null, '', window.location.pathname);
    
    // Use the new authentication helper with abort signal handling
    const processToken = async () => {
      try {
        if (signal.aborted) return;
        
        await authenticateWithToken(accessToken, refreshToken);
        
        // Check if aborted during API call
        if (signal.aborted) {
          console.log("[Index] Token authentication aborted after API call");
          return;
        }
      } catch (error) {
        if (!signal.aborted) {
          console.error("[Index] Error in token authentication:", error);
        }
      } finally {
        // Clear the reference if this is still the active controller
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }
      }
    };
    
    processToken();
    
  }, [navigate, authenticateWithToken, toast]);
  
  // Initialize auth state and handle redirects
  useEffect(() => {
    // Skip if we're already processing auth
    if (authState === 'checking_token' || authState === 'checking_session') {
      return;
    }
    
    // Initialize auth state if needed
    if (authState === 'initializing' && !isAuthenticated) {
      console.log("[Index] Initializing auth state machine");
      
      // Create a separate abort controller for session check
      const { controller, signal } = createAbortController();
      
      const checkAuthSession = async () => {
        try {
          if (signal.aborted) return;
          
          await checkSession(false);
          
          if (signal.aborted) {
            console.log("[Index] Session check aborted after API call");
          }
        } catch (error) {
          if (!signal.aborted) {
            console.error("[Index] Error checking session:", error);
          }
        } finally {
          // No need to clear reference as this is a one-time check
          controller.abort('Operation completed');
        }
      };
      
      checkAuthSession();
    }
    
    // Handle authenticated state
    if (isAuthenticated === true && authState === 'authenticated') {
      console.log("[Index] User is authenticated, redirecting to dashboard");
      navigate('/dashboard', { replace: true });
    }
    
    // Handle unauthenticated state with a slight delay to allow for race conditions
    if (isAuthenticated === false && authState === 'unauthenticated') {
      console.log("[Index] User is not authenticated, redirecting to login");
      navigate('/login', { replace: true });
    }
    
  }, [authState, isAuthenticated, navigate, checkSession]);
  
  // Log current auth state information
  useEffect(() => {
    console.log('[Index] Auth state:', { 
      state: authState,
      isAuthenticated 
    });
  }, [authState, isAuthenticated]);

  // Announce loading state to screen readers
  useEffect(() => {
    announceToScreenReader("Checking authentication status and redirecting", "polite");
  }, []);

  return (
    <Layout>
      <div id="main-content" tabIndex={-1} className="flex items-center justify-center h-screen">
        <LoadingState message="Please wait while we redirect you..." />
      </div>
    </Layout>
  );
}
