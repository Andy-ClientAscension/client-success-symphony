
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout } from "@/components/Layout/Layout";
import { useAuth } from "@/hooks/use-auth";
import { LoadingState } from "@/components/LoadingState";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { announceToScreenReader } from "@/lib/accessibility";

// This is the landing page that redirects based on auth state
export default function Index() {
  console.log('[Index] Component rendering');
  
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading, refreshSession } = useAuth();
  const { toast } = useToast();
  const [navigationAttempted, setNavigationAttempted] = useState(false);
  const [processingAuth, setProcessingAuth] = useState(false);
  
  // Log current state on every render for debugging
  console.log('[Index] Current state:', { 
    isAuthenticated, 
    isLoading,
    navigationAttempted,
    processingAuth,
    location: location.pathname,
    hash: location.hash
  });
  
  // Simple emergency timeout - navigate after 3 seconds regardless of state
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
    }, 3000);
    
    return () => clearTimeout(emergencyTimeout);
  }, [navigate, isAuthenticated, toast, navigationAttempted]);
  
  // Simplified navigation logic - navigate when auth state is known
  useEffect(() => {
    // Skip if we've already attempted navigation or are processing auth
    if (navigationAttempted || processingAuth) return;
    
    console.log('[Index] Navigation effect checking auth state:', {
      isAuthenticated,
      isLoading
    });
    
    // Only attempt navigation when auth state is determined (loading completed)
    if (!isLoading) {
      console.log('[Index] Auth loading complete, proceeding with navigation');
      setNavigationAttempted(true);
      
      if (isAuthenticated) {
        console.log('[Index] User authenticated - navigating to dashboard');
        navigate('/dashboard', { replace: true });
      } else {
        console.log('[Index] User not authenticated - navigating to login');
        navigate('/login', { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, navigate, navigationAttempted, processingAuth]);

  // Handle access token in URL (for email confirmations) - completely separate from main navigation
  useEffect(() => {
    // Skip if we're not in a browser or already processing
    if (typeof window === 'undefined' || processingAuth) return;
    
    console.log('[Index] Checking URL for auth tokens');
    
    // Check for auth token in URL
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    
    if (!accessToken) {
      console.log('[Index] No access token found in URL');
      return;
    }
    
    // Process the authentication token (completely separate flow)
    console.log('[Index] Found access token in URL, processing authentication');
    setProcessingAuth(true);
    const refreshToken = hashParams.get('refresh_token') || '';
    
    // Process auth async
    const processAuth = async () => {
      try {
        console.log('[Index] Setting session with tokens');
        
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '',
        });
        
        if (error) throw error;
        
        console.log("[Index] Session validated successfully");
        announceToScreenReader("Authentication successful", "polite");
        
        // Clear the URL hash
        window.history.replaceState(null, '', window.location.pathname);
        console.log('[Index] Cleared URL hash');
        
        // Refresh auth context
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
        setProcessingAuth(false);
      }
    };
    
    // Start processing but don't await (let it run in background)
    processAuth();
  }, [location.hash, navigate, toast, refreshSession, processingAuth]);
  
  return (
    <Layout>
      <div id="main-content" tabIndex={-1} className="flex items-center justify-center h-screen">
        <LoadingState message="Please wait while we redirect you..." />
      </div>
    </Layout>
  );
}
