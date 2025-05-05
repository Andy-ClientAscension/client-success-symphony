
import React, { useEffect, useState, useCallback } from 'react';
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
  
  // Emergency timeout to ensure navigation happens - reduced to be more responsive
  useEffect(() => {
    const emergencyTimeout = setTimeout(() => {
      if (!navigationAttempted) {
        console.warn("[Index] Emergency navigation triggered after timeout");
        setNavigationAttempted(true);
        
        // Force navigation regardless of auth state
        const targetPath = isAuthenticated ? '/dashboard' : '/login';
        console.log(`[Index] Emergency timeout: Forcing navigation to ${targetPath}`);
        navigate(targetPath, { replace: true });
        
        toast({
          title: "Navigation completed",
          description: "Redirected automatically after delay"
        });
      }
    }, 1500); // Reduced from 3000ms for faster feedback
    
    return () => clearTimeout(emergencyTimeout);
  }, [navigate, isAuthenticated, toast, navigationAttempted]);
  
  // Separate effect for token processing to prevent conflicts with navigation logic
  useEffect(() => {
    // Skip if already processed or processing
    if (processingToken || typeof window === 'undefined') return;
    
    // Check for auth token in URL
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    
    if (!accessToken) {
      return;
    }
    
    // Process the access token
    setProcessingToken(true);
    const refreshToken = hashParams.get('refresh_token') || '';
    
    const processToken = async () => {
      try {
        console.log("[Index] Processing access token from URL");
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
    };
    
    // Use a small delay to avoid potential race conditions
    const tokenTimer = setTimeout(processToken, 10);
    return () => clearTimeout(tokenTimer);
  }, [navigate, refreshSession, toast]);
  
  // Separate, simplified navigation logic in its own effect
  useEffect(() => {
    // Skip if we've already attempted navigation or are processing tokens
    if (navigationAttempted || processingToken || isLoading) return;
    
    const navigateBasedOnAuth = () => {
      console.log('[Index] Navigating based on auth state:', { isAuthenticated, isLoading });
      setNavigationAttempted(true);
      
      if (isAuthenticated) {
        console.log('[Index] User authenticated - navigating to dashboard');
        navigate('/dashboard', { replace: true });
      } else {
        console.log('[Index] User not authenticated - navigating to login');
        navigate('/login', { replace: true });
      }
    };
    
    // Small delay to ensure auth state is stable
    const navTimer = setTimeout(navigateBasedOnAuth, 100);
    return () => clearTimeout(navTimer);
  }, [isAuthenticated, isLoading, navigate, navigationAttempted, processingToken]);

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
