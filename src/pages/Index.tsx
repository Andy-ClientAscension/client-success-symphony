import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout } from "@/components/Layout/Layout";
import { LoadingState } from "@/components/LoadingState";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { announceToScreenReader } from "@/lib/accessibility";
import { useAuthStateMachineContext } from '@/contexts/auth-state-machine';
import { useSessionCoordination } from '@/hooks/use-session-coordination';

// This is the landing page that redirects based on auth state
export default function Index() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const processedUrlRef = useRef<boolean>(false);
  
  // Get the auth state machine context with all its methods
  const authContext = useAuthStateMachineContext();
  const { 
    state: authState, 
    dispatch, 
    isAuthenticated,
    authenticateWithToken  // This is properly typed now
  } = authContext;
  
  const { 
    refreshSession, 
    checkSession 
  } = useSessionCoordination();
  
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
    
    // Process the access token
    console.log("[Index] Processing access token from URL");
    const refreshToken = hashParams.get('refresh_token') || '';
    
    // Clean up URL before authentication attempt
    window.history.replaceState(null, '', window.location.pathname);
    
    // Use the new authentication helper
    authenticateWithToken(accessToken, refreshToken)
      .catch(error => {
        console.error("[Index] Error in token authentication:", error);
      });
    
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
      
      // Start session check with the state machine
      checkSession(false).catch(error => {
        console.error("[Index] Error checking session:", error);
      });
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
