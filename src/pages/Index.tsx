
import React, { useEffect, useRef, lazy, Suspense, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout } from "@/components/Layout/Layout";
import { useAuth } from "@/hooks/use-auth";
import { LoadingState } from "@/components/LoadingState";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { announceToScreenReader, setFocusToElement } from "@/lib/accessibility";
import { useAuthReducer } from '@/hooks/use-auth-reducer';
import { CriticalLoadingState } from '@/components/CriticalLoadingState';

// Session cache key for improved persistence
const SESSION_CACHE_KEY = 'auth_session_cache';

// Optimized loading component with reduced layout shift
const OptimizedLoader = () => (
  <div className="flex items-center justify-center h-screen" aria-live="polite">
    <CriticalLoadingState message="Preparing your experience..." timeout={3000} />
  </div>
);

// Main content component separated for better code organization
const MainContent = () => {
  const { isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  console.log('[MainContent] Render - Auth state:', { isLoading, isAuthenticated });
  
  return (
    <div id="main-content" tabIndex={-1} className="flex items-center justify-center h-screen">
      {isLoading ? (
        <LoadingState message="Redirecting..." />
      ) : (
        <div className="text-center">
          <h1 className="text-2xl font-bold">Welcome</h1>
          <p className="text-muted-foreground mt-2">Please wait while we redirect you...</p>
        </div>
      )}
    </div>
  );
};

// This is the landing page that redirects based on auth state
export default function Index() {
  console.log('[Index] Component rendering');
  
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading, refreshSession } = useAuth();
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);
  const [state, dispatch] = useAuthReducer();
  const authTimeoutRef = useRef<number | null>(null);
  
  // Log current state on every render
  console.log('[Index] Current state:', { 
    authState: state, 
    isAuthenticated, 
    isLoading,
    location: location.pathname,
    hash: location.hash
  });
  
  // Single consolidated timeout for emergency navigation
  useEffect(() => {
    console.log('[Index] Setting up emergency navigation timeout');
    
    // Clear any existing timeout
    if (authTimeoutRef.current) {
      clearTimeout(authTimeoutRef.current);
      console.log('[Index] Cleared previous emergency timeout');
    }
    
    // Set a single consolidated safety timeout - force navigate after 4 seconds
    authTimeoutRef.current = window.setTimeout(() => {
      console.warn("[Index] Auth process taking too long, forcing navigation");
      dispatch({ type: 'URL_PROCESSED' });
      dispatch({ type: 'PROCESSING_COMPLETE' });
      
      // Force navigation regardless of auth state
      const targetPath = isAuthenticated ? '/dashboard' : '/login';
      console.log(`[Index] Emergency timeout: Forcing navigation to ${targetPath}`);
      navigate(isAuthenticated ? '/dashboard' : '/login', { replace: true });
      
      // Notify the user
      toast({
        title: "Navigation completed",
        description: "Redirected automatically after delay"
      });
      
    }, 4000); // Single consolidated timeout
    
    return () => {
      if (authTimeoutRef.current) {
        clearTimeout(authTimeoutRef.current);
        console.log('[Index] Cleanup: Cleared emergency timeout on unmount');
      }
    };
  }, [navigate, dispatch, isAuthenticated, toast]);
  
  // OPTIMIZATION: Modified navigation logic - navigate when EITHER condition is met
  useEffect(() => {
    console.log('[Index] Navigation effect triggered with:', {
      processingAuth: state.processingAuth,
      urlProcessed: state.urlProcessed,
      isAuthenticated,
      isLoading
    });
    
    if (!state.processingAuth || state.urlProcessed) {
      console.log('[Index] Navigation conditions met - proceeding with navigation');
      
      if (isAuthenticated) {
        console.log('[Index] User authenticated - navigating to dashboard');
        navigate('/dashboard', { replace: true });
      } else if (!isLoading) {
        console.log('[Index] User not authenticated and not loading - navigating to login');
        navigate('/login', { replace: true });
      } else {
        console.log('[Index] Still loading auth state - not navigating yet');
      }
    } else {
      console.log('[Index] Navigation conditions not met yet - waiting');
    }
  }, [navigate, isAuthenticated, isLoading, state.processingAuth, state.urlProcessed]);

  // Process authentication with parallelized requests
  const processAuth = useCallback(async (accessToken: string, refreshToken: string) => {
    console.log('[Index] processAuth started with tokens:', { accessToken: !!accessToken, refreshToken: !!refreshToken });
    
    dispatch({ type: 'START_PROCESSING' });
    announceToScreenReader("Processing authentication", "polite");
    
    try {
      console.log('[Index] Running session setting and user validation in parallel');
      // OPTIMIZATION: Run session setting and user validation in parallel
      const [sessionResult, userResult] = await Promise.all([
        supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '',
        }),
        // Pre-fetch user data in parallel with session setting
        supabase.auth.getUser()
      ]);
      
      const { data, error } = sessionResult;
      const { data: userData, error: userError } = userResult;
      
      console.log('[Index] Session setting results:', { 
        sessionSuccess: !error,
        userSuccess: !userError,
        userId: userData?.user?.id || 'none'
      });
      
      if (error) throw error;
      
      // Validate user data
      if (userError || !userData?.user) {
        console.error('[Index] User validation failed:', userError || 'No user data');
        throw userError || new Error("Failed to fetch user after session set");
      }
      
      console.log("[Index] Session validated successfully");
      announceToScreenReader("Authentication successful", "polite");
      
      // Clear the URL hash
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', window.location.pathname);
        console.log('[Index] Cleared URL hash');
      }
      
      // Refresh auth context - use the imported refreshSession from useAuth()
      console.log('[Index] Refreshing auth session');
      await refreshSession();
      
      // OPTIMIZATION: Use batch update to reduce state changes
      console.log('[Index] Dispatching batch update for successful auth');
      dispatch({ 
        type: 'BATCH_UPDATE', 
        payload: {
          processingAuth: false,
          authError: null,
          urlProcessed: true
        }
      });
      
      toast({
        title: "Authentication successful",
        description: "You have been successfully logged in."
      });
      
      // Navigate to dashboard
      console.log('[Index] Navigating to dashboard after successful auth');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error("[Index] Error setting session from URL:", error);
      
      const errorMessage = error instanceof Error ? error.message : "Authentication failed";
      
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      
      // Ensure both state flags are updated even on error
      console.log('[Index] Dispatching PROCESSING_COMPLETE and URL_PROCESSED after auth error');
      dispatch({ type: 'PROCESSING_COMPLETE' });
      dispatch({ type: 'URL_PROCESSED' });
      
      announceToScreenReader(`Authentication error: ${errorMessage}`, "assertive");
      
      toast({
        title: "Authentication Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      console.log('[Index] Navigating to login page after auth error');
      navigate('/login', { 
        replace: true,
        state: { authError: errorMessage }
      });
    }
  }, [navigate, toast, refreshSession, dispatch]);

  // Handle access token in URL (for email confirmations) - optimized version
  useEffect(() => {
    console.log('[Index] Checking URL for auth tokens');
    
    // OPTIMIZATION: Early return for non-browser environments
    if (typeof window === 'undefined') {
      console.log('[Index] Non-browser environment detected, marking URL as processed');
      dispatch({ type: 'URL_PROCESSED' });
      return;
    }
    
    // Cleanup existing controller
    if (abortControllerRef.current) {
      abortControllerRef.current.abort('New effect run');
      abortControllerRef.current = null;
      console.log('[Index] Aborted previous token processing');
    }
    
    // Create a new abort controller
    abortControllerRef.current = new AbortController();
    
    // Check for auth token in URL
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    
    if (!accessToken) {
      console.log('[Index] No access token found in URL, marking URL as processed');
      dispatch({ type: 'URL_PROCESSED' });
      return;
    }
    
    // Process the authentication token
    console.log('[Index] Found access token in URL, processing authentication');
    const refreshToken = hashParams.get('refresh_token') || '';
    processAuth(accessToken, refreshToken);
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort('Component unmounted');
        abortControllerRef.current = null;
        console.log('[Index] Cleanup: Aborted token processing on unmount');
      }
    };
  }, [location.hash, processAuth, dispatch]);
  
  return (
    <Layout>
      <Suspense fallback={<OptimizedLoader />}>
        <MainContent />
      </Suspense>
    </Layout>
  );
}
