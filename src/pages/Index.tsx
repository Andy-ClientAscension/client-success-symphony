
import React, { useEffect, useRef, lazy, Suspense } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout } from "@/components/Layout/Layout";
import { useAuth } from "@/hooks/use-auth";
import { LoadingState } from "@/components/LoadingState";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { announceToScreenReader, setFocusToElement } from "@/lib/accessibility";
import { useAuthReducer } from '@/hooks/use-auth-reducer';

// This is the landing page that redirects based on auth state
export default function Index() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading, refreshSession } = useAuth();
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);
  const [state, dispatch] = useAuthReducer();
  
  // Preload critical dashboard assets when authentication is being processed
  useEffect(() => {
    if (state.processingAuth) {
      // Prefetch critical components that will be needed after auth
      const prefetchComponents = async () => {
        // Preload dashboard components in parallel
        const componentPromises = [
          import(/* webpackChunkName: "dashboard-core" */ '@/components/Dashboard/DashboardComponents'),
          import(/* webpackChunkName: "chart-library" */ '@/components/Dashboard/ChartLibrary'),
          import(/* webpackChunkName: "lazy-charts" */ '@/components/Dashboard/LazyCharts'),
        ];
        
        try {
          await Promise.all(componentPromises);
          console.log('Critical dashboard components prefetched successfully');
        } catch (error) {
          console.warn('Non-critical error during prefetch:', error);
          // Don't throw, this is just a prefetch optimization
        }
      };
      
      // Add resource hints to head
      const addResourceHints = () => {
        const hints = [
          { rel: 'preload', href: '/src/components/Dashboard/Metrics/HeroMetrics.tsx', as: 'script' },
          { rel: 'prefetch', href: '/src/components/Dashboard/Metrics/MetricsCards.tsx', as: 'script' },
        ];
        
        hints.forEach(hint => {
          // Skip if already exists
          const existingHint = document.querySelector(`link[rel="${hint.rel}"][href="${hint.href}"]`);
          if (existingHint) return;
          
          const link = document.createElement('link');
          link.rel = hint.rel;
          link.href = hint.href;
          if (hint.as) link.setAttribute('as', hint.as);
          document.head.appendChild(link);
        });
      };
      
      // Execute prefetch strategies
      prefetchComponents();
      addResourceHints();
    }
  }, [state.processingAuth]);
  
  // Immediate redirection for faster loading based on auth state
  useEffect(() => {
    if (!isLoading && !state.processingAuth && state.urlProcessed) {
      if (isAuthenticated) {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    }
  }, [navigate, isAuthenticated, isLoading, state.processingAuth, state.urlProcessed]);
  
  // Handle access token in URL (for email confirmations)
  useEffect(() => {
    // Create a new abort controller for this effect
    abortControllerRef.current = new AbortController();
    
    // Skip URL processing if we're in a non-browser environment
    if (typeof window === 'undefined') {
      dispatch({ type: 'URL_PROCESSED' });
      return;
    }
    
    // Check if we have an access_token in the URL
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    
    // No token, mark as processed and exit early
    if (!accessToken) {
      dispatch({ type: 'URL_PROCESSED' });
      return;
    }
    
    const handleEmailConfirmation = async () => {
      dispatch({ type: 'START_PROCESSING' });
      announceToScreenReader("Processing authentication", "polite");
      
      // Improved timeout strategy with staggered timeouts
      const INITIAL_TIMEOUT_MS = 5000; // Reduced from 10s to 5s
      const GRACE_PERIOD_MS = 2000; // Additional buffer

      // Create a timeout to abort long-running requests
      let isTimedOut = false;
      const timeoutId = setTimeout(() => {
        isTimedOut = true;
        toast({
          title: "Authentication is taking longer than expected",
          description: "Please wait a bit longer while we complete the process...",
          variant: "default"
        });
        
        // Grace period timeout
        setTimeout(() => {
          if (abortControllerRef.current) {
            abortControllerRef.current.abort('Timeout exceeded after grace period');
          }
        }, GRACE_PERIOD_MS);
      }, INITIAL_TIMEOUT_MS);
      
      try {
        console.log("Found access token in URL, setting session");
        
        // OPTIMIZATION: Run session setting and user validation in parallel
        const [sessionResult, userResult] = await Promise.all([
          supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: hashParams.get('refresh_token') || '',
          }),
          // Pre-fetch user data in parallel with session setting
          supabase.auth.getUser()
        ]);
        
        // Clear timeout as we got the response
        clearTimeout(timeoutId);
        
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
        
        // Show success toast
        toast({
          title: "Authentication successful",
          description: "You have been successfully logged in."
        });
        
        dispatch({ type: 'AUTH_SUCCESS' });
        
        // Navigate to dashboard
        navigate('/dashboard', { replace: true });
      } catch (error) {
        // Clear timeout as we got an error
        clearTimeout(timeoutId);
        
        // Don't process abort errors as real errors
        if (error instanceof DOMException && error.name === 'AbortError') {
          console.log("Authentication request was cancelled");
          dispatch({ 
            type: 'AUTH_ERROR', 
            payload: "Authentication request was cancelled. Please try again." 
          });
          return;
        }
        
        console.error("Error setting session from URL:", error);
        
        let errorMessage = error instanceof Error ? error.message : "Authentication failed";
        if (errorMessage.includes("timed out")) {
          errorMessage = "Authentication request timed out. This could be due to network issues. Please try again.";
        }
        
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
        // If we timed out but eventually completed, show a resolved message
        if (isTimedOut) {
          toast({
            title: "Authentication completed",
            description: "Thank you for your patience.",
            variant: "default"
          });
        }
        dispatch({ type: 'URL_PROCESSED' });
      }
    };
    
    handleEmailConfirmation();
    
    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [navigate, location.hash, toast, refreshSession, dispatch]);
  
  // Set focus when processing state changes
  useEffect(() => {
    if (!state.processingAuth && state.urlProcessed) {
      // Set focus to main content area after processing completes
      setTimeout(() => {
        setFocusToElement('main-content', '.flex.items-center.justify-center');
      }, 100);
    }
  }, [state.processingAuth, state.urlProcessed]);
  
  return (
    <Layout>
      <div id="main-content" tabIndex={-1} className="flex items-center justify-center h-screen">
        <LoadingState message="Redirecting..." />
      </div>
    </Layout>
  );
}
