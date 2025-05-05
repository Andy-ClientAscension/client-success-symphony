
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout } from "@/components/Layout/Layout";
import { useAuth } from "@/hooks/use-auth";
import { LoadingState } from "@/components/LoadingState";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { announceToScreenReader } from "@/lib/accessibility";
import { useAuthReducer } from '@/hooks/use-auth-reducer';

// This is the landing page that redirects based on auth state
export default function Index() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading, refreshSession } = useAuth();
  const { toast } = useToast();
  const [state, dispatch] = useAuthReducer();
  const processingTokenRef = useRef(false);
  const authStateCheckedRef = useRef(false);
  const navigationAttemptedRef = useRef(false);
  
  // Process access token from URL if present
  useEffect(() => {
    // Skip if already processed or processing
    if (processingTokenRef.current || typeof window === 'undefined') return;
    
    // Check for auth token in URL
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    
    if (!accessToken) {
      // No token in URL, mark token processing as complete
      processingTokenRef.current = true;
      dispatch({ type: 'URL_PROCESSED' });
      return;
    }
    
    // Process the access token
    console.log("[Index] Processing access token from URL");
    processingTokenRef.current = true;
    dispatch({ type: 'START_PROCESSING' });
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
        
        // Navigate to dashboard and mark URL as processed
        dispatch({ type: 'URL_PROCESSED' });
        dispatch({ type: 'AUTH_SUCCESS' });
        
        // Force navigation to avoid waiting for the next effect cycle
        navigationAttemptedRef.current = true;
        dispatch({ type: 'NAVIGATION_ATTEMPTED' });
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
        dispatch({ type: 'URL_PROCESSED' });
        dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
        
        // Force navigation to avoid waiting for the next effect cycle
        navigationAttemptedRef.current = true;
        dispatch({ type: 'NAVIGATION_ATTEMPTED' });
        navigate('/login', { 
          replace: true,
          state: { authError: errorMessage }
        });
      } finally {
        dispatch({ type: 'PROCESSING_COMPLETE' });
      }
    })();
  }, []);
  
  // Separate effect for stable auth state navigation
  useEffect(() => {
    // Skip navigation if we're still processing a token
    if (processingTokenRef.current || navigationAttemptedRef.current) {
      return;
    }
    
    // If we've checked auth state before, don't repeat the check
    if (authStateCheckedRef.current) {
      return;
    }
    
    // Skip if we're still waiting for auth to initialize
    if (isLoading && !state.timeoutLevel) {
      return;
    }
    
    // Mark that we've checked auth state to prevent multiple redirects
    authStateCheckedRef.current = true;
    
    // We now have stable auth state or timed out, navigate based on what we know
    console.log('[Index] Navigating based on auth state:', { 
      isAuthenticated, 
      isLoading, 
      timeoutLevel: state.timeoutLevel
    });
    
    navigationAttemptedRef.current = true;
    dispatch({ type: 'NAVIGATION_ATTEMPTED' });
    
    // Navigate based on authentication status
    if (isAuthenticated) {
      console.log('[Index] User authenticated - navigating to dashboard');
      navigate('/dashboard', { replace: true });
    } else {
      console.log('[Index] User not authenticated - navigating to login');
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, state.timeoutLevel]);

  // Emergency timeout to guarantee navigation happens
  useEffect(() => {
    const emergencyTimeoutId = setTimeout(() => {
      if (!navigationAttemptedRef.current) {
        console.warn("[Index] Emergency navigation triggered after timeout");
        navigationAttemptedRef.current = true;
        dispatch({ type: 'NAVIGATION_ATTEMPTED' });
        
        // Force navigation regardless of auth state
        const targetPath = isAuthenticated ? '/dashboard' : '/login';
        console.log(`[Index] Emergency timeout: Forcing navigation to ${targetPath}`);
        navigate(targetPath, { replace: true });
      }
    }, 2000); // Shorter emergency timeout
    
    return () => clearTimeout(emergencyTimeoutId);
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
