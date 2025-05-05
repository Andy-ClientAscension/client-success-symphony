import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { preloadPageResources } from '@/utils/resourceHints';

export default function AuthCallback() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLongRequest, setIsLongRequest] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Preload critical dashboard resources as soon as the auth callback page loads
    preloadPageResources('dashboard');
    
    // Handle the OAuth callback
    const handleAuthCallback = async () => {
      let timeoutId: number | undefined;
      let graceTimeoutId: number | undefined;
      
      try {
        // Setup staggered timeout handling
        const INITIAL_TIMEOUT_MS = 5000; // Reduced initial timeout
        const GRACE_PERIOD_MS = 2000; // Additional grace period
        
        // Set a timeout to show a "taking longer than expected" message
        timeoutId = window.setTimeout(() => {
          setIsLongRequest(true);
          toast({
            title: "Authentication is taking longer than expected",
            description: "Please wait a bit longer while we complete the process...",
            variant: "default"
          });
        }, INITIAL_TIMEOUT_MS);
        
        // Main authentication flow
        // OPTIMIZATION: Fetch session with minimal delay
        const { data, error } = await supabase.auth.getSession();
        
        // Clear the initial timeout since we got a response
        if (timeoutId) clearTimeout(timeoutId);
        
        if (error) {
          throw error;
        }

        // Check if we have a session
        if (data.session) {
          setSuccess(true);
          toast({
            title: 'Login Successful',
            description: 'You have successfully logged in.',
          });
          
          // Preload dashboard components while showing success message
          try {
            await Promise.all([
              import(/* webpackChunkName: "dashboard-core" */ '@/components/Dashboard/DashboardComponents'),
              import(/* webpackChunkName: "metrics" */ '@/components/Dashboard/Metrics/MetricsOverview')
            ]);
            console.log('Dashboard components preloaded successfully');
          } catch (e) {
            // Non-critical error, don't block navigation
            console.warn('Failed to preload some components:', e);
          }
          
          // Redirect after a short delay to show success message
          setTimeout(() => {
            navigate('/dashboard');
          }, 1500);
          return;
        }

        // If no session, check URL for error parameters
        const url = new URL(window.location.href);
        const errorDescription = url.searchParams.get('error_description');
        
        if (errorDescription) {
          throw new Error(errorDescription);
        } else {
          // If no error but also no session, something went wrong
          throw new Error('Authentication failed for unknown reason. Please try again.');
        }
      } catch (err) {
        // Clear any pending timeouts
        if (timeoutId) clearTimeout(timeoutId);
        if (graceTimeoutId) clearTimeout(graceTimeoutId);
        
        console.error('Auth callback error:', err);
        setError(err instanceof Error ? err.message : 'Authentication failed');
        
        // Redirect back to login after showing error
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } finally {
        // If we showed the "taking longer" message but eventually completed,
        // show a resolved message
        if (isLongRequest) {
          toast({
            title: "Authentication completed",
            description: "Thank you for your patience.",
            variant: "default"
          });
        }
        setIsLoading(false);
      }
    };

    handleAuthCallback();
  }, [navigate, toast]);
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            {isLoading && (
              <>
                <Spinner size="lg" />
                <p className="text-lg font-medium">Completing authentication...</p>
                {isLongRequest ? (
                  <Alert className="bg-yellow-50 border-yellow-200">
                    <Clock className="h-5 w-5 text-yellow-600" />
                    <AlertDescription className="text-yellow-800 mt-2">
                      <p className="font-medium">Authentication is taking longer than usual</p>
                      <p className="text-sm mt-1">Please wait while we complete the process.</p>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <p className="text-sm text-gray-500">Please wait while we finish the login process.</p>
                )}
              </>
            )}
            
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-5 w-5" />
                <AlertDescription className="mt-2">
                  <p className="font-medium">Authentication Failed</p>
                  <p className="text-sm mt-1">{error}</p>
                  <p className="text-sm mt-4">Redirecting back to login page...</p>
                </AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <AlertDescription className="text-green-800 mt-2">
                  <p className="font-medium">Authentication Successful</p>
                  <p className="text-sm mt-1">You have successfully signed in.</p>
                  <p className="text-sm mt-4">Redirecting to dashboard...</p>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
