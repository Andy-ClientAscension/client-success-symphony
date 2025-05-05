
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout } from "@/components/Layout/Layout";
import { LoadingState } from "@/components/LoadingState";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { announceToScreenReader } from "@/lib/accessibility";
import { useAuthStateMachine } from '@/hooks/use-auth-state-machine';
import { useSessionCoordination } from '@/hooks/use-session-coordination';

// This is the landing page that redirects based on auth state
export default function Index() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { state, dispatch, isAuthenticated } = useAuthStateMachine();
  const { checkSession, refreshSession } = useSessionCoordination();
  
  // Process access token from URL if present
  useEffect(() => {
    console.log("[Index] Checking for auth token in URL");
    
    // Check for auth token in URL
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    
    if (!accessToken) {
      console.log("[Index] No access token in URL");
      return;
    }
    
    // Process the access token
    console.log("[Index] Processing access token from URL");
    dispatch({ type: 'TOKEN_CHECK_START' });
    const refreshToken = hashParams.get('refresh_token') || '';
    
    (async () => {
      try {
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        
        if (error) throw error;
        
        // Clean up URL before navigation
        window.history.replaceState(null, '', window.location.pathname);
        
        // Refresh session to update state
        await refreshSession(true);
        
        toast({
          title: "Authentication successful",
          description: "You have been successfully logged in."
        });
        
        // Force navigation to dashboard
        dispatch({ type: 'AUTHENTICATE_SUCCESS' });
      } catch (error) {
        console.error("[Index] Error setting session from URL:", error);
        
        const errorMessage = error instanceof Error ? error.message : "Authentication failed";
        
        toast({
          title: "Authentication Error",
          description: errorMessage,
          variant: "destructive",
        });
        
        // Navigate to login page with error
        dispatch({ 
          type: 'AUTHENTICATE_FAILURE', 
          error: error instanceof Error ? error : new Error(errorMessage) 
        });
        
        navigate('/login', { 
          replace: true,
          state: { authError: errorMessage }
        });
      }
    })();
  }, [navigate, dispatch, refreshSession, toast]);
  
  // Log current auth state information
  useEffect(() => {
    console.log('[Index] Auth state:', { 
      state,
      isAuthenticated 
    });
  }, [state, isAuthenticated]);

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
