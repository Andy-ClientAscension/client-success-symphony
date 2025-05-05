
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
  const [processingToken, setProcessingToken] = useState(false);
  
  // Log current state on every render for debugging
  console.log('[Index] Current state:', { 
    isAuthenticated, 
    isLoading,
    navigationAttempted,
    processingToken,
    location: location.pathname,
    hash: location.hash
  });
  
  // Emergency timeout - navigate after 3 seconds regardless of state
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
  
  // Navigation logic - separated from token processing
  useEffect(() => {
    // Skip if we've already attempted navigation or are processing tokens
    if (navigationAttempted || processingToken) return;
    
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
  }, [isAuthenticated, isLoading, navigate, navigationAttempted, processingToken]);

  // Token processor - completely separate effect
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
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        
        if (error) throw error;
        
        window.history.replaceState(null, '', window.location.pathname);
        
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
    
    processToken();
  }, [location.hash, navigate, toast, refreshSession]);
  
  return (
    <Layout>
      <div id="main-content" tabIndex={-1} className="flex items-center justify-center h-screen">
        <LoadingState message="Please wait while we redirect you..." />
      </div>
    </Layout>
  );
}
