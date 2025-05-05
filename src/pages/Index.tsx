
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout } from "@/components/Layout/Layout";
import { useAuth } from "@/hooks/use-auth";
import { LoadingState } from "@/components/LoadingState";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { announceToScreenReader } from "@/lib/accessibility";

// This is the landing page that redirects based on auth state
export default function Index() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading, refreshSession } = useAuth();
  const { toast } = useToast();
  const [navigationAttempted, setNavigationAttempted] = useState(false);
  const [processingToken, setProcessingToken] = useState(false);
  const navigationTimeoutRef = useRef<number | null>(null);
  const tokenProcessingRef = useRef(false);
  const authStateStableRef = useRef(false);
  
  // Process access token from URL if present
  useEffect(() => {
    // Skip if already processed or processing
    if (tokenProcessingRef.current || typeof window === 'undefined') return;
    
    // Check for auth token in URL
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    
    if (!accessToken) {
      // No token in URL, mark token processing as complete
      tokenProcessingRef.current = true;
      return;
    }
    
    // Process the access token
    console.log("[Index] Processing access token from URL");
    tokenProcessingRef.current = true;
    setProcessingToken(true);
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
        await refreshSession();
        
        toast({
          title: "Authentication successful",
          description: "You have been successfully logged in."
        });
        
        // Navigate to dashboard
        setNavigationAttempted(true);
        navigate('/dashboard', { replace: true });
      } catch (error) {
        console.error("[Index] Error setting session from URL:", error);
        
        const errorMessage = error instanceof Error ? error.message : "Authentication failed";
        
        toast({
          title: "Authentication Error",
          description: errorMessage,
          variant: "destructive",
        });
        
        // Navigate to login page with error
        setNavigationAttempted(true);
        navigate('/login', { 
          replace: true,
          state: { authError: errorMessage }
        });
      } finally {
        setProcessingToken(false);
      }
    })();
  }, []);
  
  // Handle standard navigation based on auth state
  useEffect(() => {
    // Skip if navigation already attempted or currently processing tokens
    if (navigationAttempted || processingToken) return;
    
    // Emergency timeout to ensure navigation happens after 1.5s
    if (navigationTimeoutRef.current === null) {
      navigationTimeoutRef.current = window.setTimeout(() => {
        console.warn("[Index] Emergency navigation triggered after timeout");
        if (!navigationAttempted) {
          setNavigationAttempted(true);
          
          // Force navigation regardless of auth state
          const targetPath = isAuthenticated ? '/dashboard' : '/login';
          console.log(`[Index] Emergency timeout: Forcing navigation to ${targetPath}`);
          navigate(targetPath, { replace: true });
        }
      }, 1500); // Short timeout for emergency fallback
    }
    
    // Don't immediately navigate during loading to prevent flickering
    if (isLoading) {
      return;
    }
    
    // Mark that we have stable auth state
    authStateStableRef.current = true;
    
    // Auth state is stable, navigate based on auth status
    console.log('[Index] Navigating based on auth state:', { isAuthenticated, isLoading });
    setNavigationAttempted(true);
    
    if (isAuthenticated) {
      console.log('[Index] User authenticated - navigating to dashboard');
      navigate('/dashboard', { replace: true });
    } else {
      console.log('[Index] User not authenticated - navigating to login');
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, isLoading, processingToken, navigationAttempted, navigate]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current);
        navigationTimeoutRef.current = null;
      }
    };
  }, []);

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
