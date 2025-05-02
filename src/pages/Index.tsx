
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout } from "@/components/Layout/Layout";
import { useAuth } from "@/hooks/use-auth";
import { LoadingState } from "@/components/LoadingState";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// This is the landing page that redirects based on auth state
export default function Index() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading, refreshSession } = useAuth();
  const [processingAuth, setProcessingAuth] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [urlProcessed, setUrlProcessed] = useState(false);
  const { toast } = useToast();
  
  // Handle access token in URL (for email confirmations)
  useEffect(() => {
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
        
        // Create a timeout to abort long-running requests
        const TIMEOUT_MS = 10000; // 10 seconds timeout
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => {
            reject(new Error("Authentication request timed out. Please try again."));
          }, TIMEOUT_MS);
        });
        
        try {
          console.log("Found access token in URL, setting session");
          
          // Race between the auth request and the timeout
          const sessionResult = await Promise.race([
            supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: hashParams.get('refresh_token') || '',
            }),
            timeoutPromise
          ]);
          
          // If we get here, the request completed before timeout
          const { data, error } = sessionResult as any;
          
          if (error) throw error;
          
          // Validate that the session was actually set correctly by fetching the user
          const userPromise = supabase.auth.getUser();
          const userResult = await Promise.race([
            userPromise,
            new Promise((_, reject) => {
              setTimeout(() => {
                reject(new Error("User validation timed out. Please try again."));
              }, TIMEOUT_MS);
            })
          ]);
          
          const { data: userData, error: userError } = userResult as any;
          
          if (userError || !userData?.user) {
            throw userError || new Error("Failed to fetch user after session set");
          }
          
          console.log("Session validated successfully");
          
          // Clear the URL hash, using navigation safety
          if (typeof window !== 'undefined') {
            window.history.replaceState(null, '', window.location.pathname);
          }
          
          // Refresh auth context to ensure it's in sync with Supabase
          await refreshSession();
          
          // Show success toast
          toast({
            title: "Authentication successful",
            description: "You have been successfully logged in."
          });
          
          // Navigate to dashboard
          navigate('/dashboard', { replace: true });
        } catch (error) {
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
  }, [navigate, location.hash, toast, refreshSession]); 
  
  // Standard redirection based on auth state
  useEffect(() => {
    // Only redirect after auth state is confirmed, we're not processing an access token,
    // and URL processing has completed (whether there was a token or not)
    if (!isLoading && !processingAuth && urlProcessed) {
      if (isAuthenticated) {
        // Redirect authenticated users to dashboard
        navigate('/dashboard', { replace: true });
      } else {
        // Redirect unauthenticated users to login
        navigate('/login', { replace: true });
      }
    }
  }, [navigate, isAuthenticated, isLoading, processingAuth, urlProcessed]);
  
  return (
    <Layout>
      {(isLoading || processingAuth) ? (
        <LoadingState message={processingAuth ? "Processing authentication..." : "Initializing application..."} />
      ) : (
        <div className="flex items-center justify-center h-screen">
          {authError ? (
            <div className="text-center space-y-2">
              <p className="text-destructive font-medium">Authentication Error</p>
              <p className="text-sm text-muted-foreground">{authError}</p>
              <p>Redirecting to login...</p>
            </div>
          ) : (
            <p>Redirecting...</p>
          )}
        </div>
      )}
    </Layout>
  );
}
