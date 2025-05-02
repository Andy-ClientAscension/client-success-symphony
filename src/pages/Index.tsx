
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout } from "@/components/Layout/Layout";
import { useAuth } from "@/hooks/use-auth";
import { LoadingState } from "@/components/LoadingState";
import { supabase } from "@/integrations/supabase/client";

// This is the landing page that redirects based on auth state
export default function Index() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  const [processingAuth, setProcessingAuth] = useState(false);
  
  // Handle access token in URL (for email confirmations)
  useEffect(() => {
    // Check if we have an access_token in the URL
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    
    const handleEmailConfirmation = async () => {
      if (accessToken) {
        setProcessingAuth(true);
        try {
          console.log("Found access token in URL, setting session");
          // Set the session with the access token from the URL
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: hashParams.get('refresh_token') || '',
          });
          
          if (error) throw error;
          
          // Clear the URL hash
          window.history.replaceState(null, '', window.location.pathname);
          
          // Navigate to dashboard
          navigate('/dashboard', { replace: true });
        } catch (error) {
          console.error("Error setting session from URL:", error);
          navigate('/login', { replace: true });
        } finally {
          setProcessingAuth(false);
        }
      }
    };
    
    handleEmailConfirmation();
  }, [navigate, location.hash]); // Added location.hash to the dependency array
  
  // Standard redirection based on auth state
  useEffect(() => {
    // Only redirect after auth state is confirmed and we're not processing an access token
    if (!isLoading && !processingAuth) {
      if (isAuthenticated) {
        // Redirect authenticated users to dashboard
        navigate('/dashboard', { replace: true });
      } else {
        // Redirect unauthenticated users to login
        navigate('/login', { replace: true });
      }
    }
  }, [navigate, isAuthenticated, isLoading, processingAuth]);
  
  return (
    <Layout>
      {(isLoading || processingAuth) ? (
        <LoadingState message={processingAuth ? "Processing authentication..." : "Initializing application..."} />
      ) : (
        <div className="flex items-center justify-center h-screen">
          <p>Redirecting...</p>
        </div>
      )}
    </Layout>
  );
}
