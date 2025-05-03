import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout } from "@/components/Layout/Layout";
import { useAuth } from "@/hooks/use-auth";
import { LoadingState } from "@/components/LoadingState";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { announceToScreenReader, setFocusToElement } from "@/lib/accessibility";

// This is the landing page that redirects based on auth state
export default function Index() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading, refreshSession } = useAuth();
  const [processingAuth, setProcessingAuth] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [urlProcessed, setUrlProcessed] = useState(false);
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Handle access token in URL (for email confirmations)
  useEffect(() => {
    // Create a new abort controller for this effect
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    
    // Skip URL processing if we're in a non-browser environment
    if (typeof window === 'undefined') {
      setUrlProcessed(true);
      return;
    }
    
    // Check if we have an access_token in the URL
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    
    const handleEmailConfirmation = async () => {
      if (accessToken) {
        setProcessingAuth(true);
        announceToScreenReader("Processing authentication", "polite");
        
        // Create a timeout to abort long-running requests
        const TIMEOUT_MS = 10000; // 10 seconds timeout
        const timeoutId = setTimeout(() => {
          if (abortControllerRef.current) {
            abortControllerRef.current.abort('Timeout exceeded');
          }
        }, TIMEOUT_MS);
        
        try {
          console.log("Found access token in URL, setting session");
          
          // Fix: Fix the setSession call by passing the correct parameters
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: hashParams.get('refresh_token') || '',
          });
          
          clearTimeout(timeoutId);
          
          if (error) throw error;
          
          // Validate that the session was actually set correctly by fetching the user
          // Fix: Remove the signal from getUser call
          const { data: userData, error: userError } = await supabase.auth.getUser();
          
          if (userError || !userData?.user) {
            throw userError || new Error("Failed to fetch user after session set");
          }
          
          console.log("Session validated successfully");
          announceToScreenReader("Authentication successful", "polite");
          
          // Clear the URL hash, using navigation safety
          if (typeof window !== 'undefined') {
            window.history.replaceState(null, '', window.location.pathname);
          }
          
          // Refresh auth context to ensure it's in sync with Supabase
          // Fix: Call refreshSession without passing an object with signal
          await refreshSession();
          
          // Show success toast
          toast({
            title: "Authentication successful",
            description: "You have been successfully logged in."
          });
          
          // Navigate to dashboard
          navigate('/dashboard', { replace: true });
        } catch (error) {
          clearTimeout(timeoutId);
          
          // Don't process abort errors as real errors
          if (error instanceof DOMException && error.name === 'AbortError') {
            console.log("Authentication request was cancelled");
            setAuthError("Authentication request was cancelled. Please try again.");
            return;
          }
          
          console.error("Error setting session from URL:", error);
          
          // Handle timeout errors specifically
          let errorMessage;
          if (error instanceof Error) {
            errorMessage = error.message;
            if (errorMessage.includes("timed out")) {
              errorMessage = "Authentication request timed out. This could be due to network issues. Please try again.";
            }
          } else {
            errorMessage = "Authentication failed";
          }
          
          setAuthError(errorMessage);
          announceToScreenReader(`Authentication error: ${errorMessage}`, "assertive");
          
          // Show error toast
          toast({
            title: "Authentication Error",
            description: errorMessage,
            variant: "destructive",
          });
          
          // Pass error message to login page via state
          navigate('/login', { 
            replace: true,
            state: { authError: errorMessage }
          });
        } finally {
          setProcessingAuth(false);
          setUrlProcessed(true); // Mark URL token processing as complete
        }
      } else {
        setUrlProcessed(true); // No token in URL, mark as processed
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
  }, [navigate, location.hash, toast, refreshSession]); 
  
  // Standard redirection based on auth state
  useEffect(() => {
    // Only redirect after auth state is confirmed, we're not processing an access token,
    // and URL processing has completed (whether there was a token or not)
    if (!isLoading && !processingAuth && urlProcessed) {
      if (isAuthenticated) {
        // Announce redirection for screen readers
        announceToScreenReader("Authentication verified, redirecting to dashboard", "polite");
        // Redirect authenticated users to dashboard
        navigate('/dashboard', { replace: true });
      } else {
        // Announce redirection for screen readers
        announceToScreenReader("Authentication required, redirecting to login", "polite");
        // Redirect unauthenticated users to login
        navigate('/login', { replace: true });
      }
    }
  }, [navigate, isAuthenticated, isLoading, processingAuth, urlProcessed]);
  
  // Set focus when processing state changes
  useEffect(() => {
    if (!processingAuth && urlProcessed) {
      // Set focus to main content area after processing completes
      setTimeout(() => {
        setFocusToElement('main-content', '.flex.items-center.justify-center');
      }, 100);
    }
  }, [processingAuth, urlProcessed]);
  
  return (
    <Layout>
      {(isLoading || processingAuth) ? (
        <div className="flex items-center justify-center h-screen">
          <LoadingState message={processingAuth ? "Processing authentication..." : "Initializing application..."} />
          <div aria-live="polite" className="sr-only">
            {processingAuth ? "Processing authentication" : "Initializing application"}
          </div>
        </div>
      ) : (
        <div id="main-content" tabIndex={-1} className="flex items-center justify-center h-screen">
          {authError ? (
            <div className="text-center space-y-2">
              <p className="text-destructive font-medium">Authentication Error</p>
              <p className="text-sm text-muted-foreground">{authError}</p>
              <p>Redirecting to login...</p>
              <div aria-live="assertive" className="sr-only">
                Authentication error: {authError}. Redirecting to login page.
              </div>
            </div>
          ) : (
            <div>
              <p>Redirecting...</p>
              <div aria-live="polite" className="sr-only">
                Redirecting to appropriate page based on your authentication status.
              </div>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}
