
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
    <CriticalLoadingState message="Preparing your experience..." timeout={5000} />
  </div>
);

// Main content component separated for better code organization
const MainContent = () => {
  const { isLoading } = useAuth();
  
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
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading, refreshSession } = useAuth();
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);
  const [state, dispatch] = useAuthReducer();
  const authTimeoutRef = useRef<number | null>(null);
  
  // Force navigation after delay to prevent being stuck
  useEffect(() => {
    // Clear any existing timeout
    if (authTimeoutRef.current) {
      clearTimeout(authTimeoutRef.current);
    }
    
    // Set a safety timeout - force navigate after 10 seconds
    authTimeoutRef.current = window.setTimeout(() => {
      if (!state.urlProcessed || state.processingAuth) {
        console.warn("Auth process taking too long, forcing navigation");
        dispatch({ type: 'URL_PROCESSED' });
        dispatch({ type: 'PROCESSING_COMPLETE' });
        
        // If still not authenticated after timeout, go to login
        if (!isAuthenticated) {
          navigate('/login', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      }
    }, 10000);
    
    return () => {
      if (authTimeoutRef.current) {
        clearTimeout(authTimeoutRef.current);
      }
    };
  }, [isAuthenticated, navigate, state.urlProcessed, state.processingAuth, dispatch]);
  
  // Process authentication with parallelized requests
  const processAuth = useCallback(async (accessToken: string, refreshToken: string) => {
    dispatch({ type: 'START_PROCESSING' });
    announceToScreenReader("Processing authentication", "polite");
    
    try {
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
      
      if (error) throw error;
      
      // Validate user data
      if (userError || !userData?.user) {
        throw userError || new Error("Failed to fetch user after session set");
      }
      
      console.log("Session validated successfully");
      announceToScreenReader("Authentication successful", "polite");
      
      // Clear the URL hash
      if (typeof window !== 'undefined') {
        window.history.replaceState(null, '', window.location.pathname);
      }
      
      // Refresh auth context
      await refreshSession();
      
      // OPTIMIZATION: Use batch update to reduce state changes
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
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error("Error setting session from URL:", error);
      
      const errorMessage = error instanceof Error ? error.message : "Authentication failed";
      
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage });
      announceToScreenReader(`Authentication error: ${errorMessage}`, "assertive");
      
      toast({
        title: "Authentication Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      navigate('/login', { 
        replace: true,
        state: { authError: errorMessage }
      });
    } finally {
      if (state.processingAuth) {
        dispatch({ type: 'PROCESSING_COMPLETE' });
      }
      dispatch({ type: 'URL_PROCESSED' });
    }
  }, [navigate, toast, refreshSession, dispatch, state.processingAuth]);

  // Handle access token in URL (for email confirmations) - optimized version
  useEffect(() => {
    // OPTIMIZATION: Early return for non-browser environments
    if (typeof window === 'undefined') {
      dispatch({ type: 'URL_PROCESSED' });
      return;
    }
    
    // Cleanup existing controller
    if (abortControllerRef.current) {
      abortControllerRef.current.abort('New effect run');
      abortControllerRef.current = null;
    }
    
    // Create a new abort controller
    abortControllerRef.current = new AbortController();
    
    // Check for auth token in URL
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    
    if (!accessToken) {
      dispatch({ type: 'URL_PROCESSED' });
      return;
    }
    
    // Process the authentication token
    const refreshToken = hashParams.get('refresh_token') || '';
    processAuth(accessToken, refreshToken);
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort('Component unmounted');
        abortControllerRef.current = null;
      }
    };
  }, [location.hash, processAuth, dispatch]);
  
  // OPTIMIZATION: Immediate redirection based on auth state
  useEffect(() => {
    // Force redirection if taking too long
    const redirectTimer = setTimeout(() => {
      if (!state.processingAuth && state.urlProcessed) {
        if (isAuthenticated) {
          navigate('/dashboard', { replace: true });
        } else {
          navigate('/login', { replace: true });
        }
      }
    }, 1000); // Lower timeout for more responsive redirection
    
    return () => clearTimeout(redirectTimer);
  }, [navigate, isAuthenticated, isLoading, state.processingAuth, state.urlProcessed]);

  return (
    <Layout>
      <Suspense fallback={<OptimizedLoader />}>
        <MainContent />
      </Suspense>
    </Layout>
  );
}
