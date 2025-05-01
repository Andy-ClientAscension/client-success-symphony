
import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate, useLocation } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { useLoginForm } from "@/hooks/use-login-form";
import { LoginForm } from "@/components/auth/LoginForm";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Wifi, RefreshCw, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { checkNetworkConnectivity, diagnoseAuthIssue } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [diagnosing, setDiagnosing] = useState(false);
  const [diagnosticResults, setDiagnosticResults] = useState<any>(null);
  const { toast } = useToast();
  
  const {
    email,
    setEmail,
    password,
    setPassword,
    isSubmitting,
    isResettingPassword,
    networkStatus,
    handleSubmit,
    handlePasswordReset,
    apiError,
    checkNetworkStatus
  } = useLoginForm();

  console.log("Login page rendered, auth state:", { isAuthenticated, isLoading, userEmail: user?.email });

  // Check for email verification status in the URL
  const searchParams = new URLSearchParams(location.search);
  const verificationError = searchParams.get('error_description');
  const errorCode = searchParams.get('error');

  // Handle redirection after login
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      const from = location.state?.from?.pathname || "/dashboard";
      console.log("Already authenticated, redirecting to", from);
      toast({
        title: "Authentication Successful",
        description: `Welcome back${user?.email ? `, ${user.email}` : ''}!`,
      });
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, location.state, user, toast]);

  // Run connectivity diagnosis if there are errors
  const runDiagnostics = async () => {
    setDiagnosing(true);
    try {
      // First check network connectivity manually
      await checkNetworkStatus();
      
      // Check network connectivity first
      const connectivity = await checkNetworkConnectivity();
      
      // If network is available, check auth status
      let authDiag = null;
      if (connectivity.online) {
        try {
          authDiag = await diagnoseAuthIssue();
        } catch (e) {
          console.error("Error diagnosing auth:", e);
          authDiag = { error: "Failed to check auth service" };
        }
      }
      
      setDiagnosticResults({
        timestamp: new Date().toISOString(),
        network: connectivity,
        auth: authDiag,
        userAgent: navigator.userAgent,
        url: window.location.href,
        errorParams: {
          code: errorCode,
          description: verificationError
        },
        corsTest: {
          origin: window.location.origin,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
          }
        },
        browserNetworkStatus: navigator.onLine
      });
      
      toast({
        title: connectivity.online ? "Connected" : "Offline",
        description: connectivity.online 
          ? "Network connection established." 
          : "You appear to be offline. Local authentication mode enabled.",
      });
      
    } catch (error) {
      console.error("Error running diagnostics:", error);
      setDiagnosticResults({
        error: error instanceof Error ? error.message : "Unknown error during diagnostics",
        timestamp: new Date().toISOString(),
        browserNetworkStatus: navigator.onLine
      });
    } finally {
      setDiagnosing(false);
    }
  };

  // Don't render anything if redirecting
  if (isAuthenticated && !isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Redirecting...</div>;
  }

  return (
    <ErrorBoundary customMessage="There was a problem loading the login form. Please try refreshing the page.">
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Network status indicator */}
            {networkStatus && !networkStatus.online && (
              <Alert variant="destructive" className="mb-4 text-sm py-2 bg-amber-50 border-amber-300">
                <WifiOff className="h-4 w-4" />
                <AlertTitle>Network Connectivity Issue</AlertTitle>
                <AlertDescription className="flex justify-between items-center">
                  <span>You appear to be offline. Please check your internet connection to continue.</span>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={checkNetworkStatus}
                    className="ml-2"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Retry
                  </Button>
                </AlertDescription>
              </Alert>
            )}
            
            {/* Show verification error from URL if present */}
            {(verificationError || errorCode) && (
              <Alert variant="destructive" className="mb-4 text-sm py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {verificationError || "Authentication error occurred"}
                  {errorCode === "email_confirmation_required" && (
                    <div className="mt-2 text-xs">
                      Please check your email for a verification link. If you don't see it, check your spam folder.
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
            
            {/* CORS-specific error alert */}
            {apiError && apiError.type === 'cors' && (
              <Alert variant="destructive" className="mb-4 text-sm py-2 bg-red-50 border-red-300">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>CORS Security Policy Error</AlertTitle>
                <AlertDescription>
                  The application is experiencing issues communicating with the authentication server due to browser security policies.
                  This often happens with certain browser extensions or configurations. Try:
                  <ul className="list-disc pl-5 mt-2 text-xs">
                    <li>Disabling ad blockers or privacy extensions</li>
                    <li>Using a private/incognito window</li>
                    <li>Trying a different browser</li>
                  </ul>
                </AlertDescription>
              </Alert>
            )}
            
            {/* Diagnostic results if available */}
            {diagnosticResults && (
              <div className="mb-4 text-xs bg-gray-50 dark:bg-gray-800 p-3 rounded border">
                <div className="font-medium mb-1">Connection Diagnostics:</div>
                <div>
                  Browser Online: {navigator.onLine ? 
                    <span className="text-green-600">Yes</span> : 
                    <span className="text-red-600">No</span>}
                </div>
                <div>
                  Network Check: {diagnosticResults.network?.online ? 
                    <span className="text-green-600">Online</span> : 
                    <span className="text-red-600">Offline</span>}
                </div>
                {diagnosticResults.network?.latency && (
                  <div>Latency: {diagnosticResults.network.latency}ms</div>
                )}
                {diagnosticResults.network?.status && (
                  <div>Status: {diagnosticResults.network.status}</div>
                )}
                {diagnosticResults.auth?.issue && (
                  <div>Auth Issue: {diagnosticResults.auth.issue}</div>
                )}
                {diagnosticResults.corsTest && (
                  <div className="mt-1">
                    <div>Origin: {diagnosticResults.corsTest.origin}</div>
                    <div className="text-xs text-gray-500">CORS Headers: Present</div>
                  </div>
                )}
                <div className="mt-2 text-gray-500">
                  If you continue experiencing issues, please contact support with this diagnostic information.
                </div>
              </div>
            )}
            
            <LoginForm
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              isSubmitting={isSubmitting}
              isResettingPassword={isResettingPassword}
              onSubmit={handleSubmit}
              onPasswordReset={handlePasswordReset}
              error={apiError}
              networkStatus={networkStatus}
              onRetryConnection={checkNetworkStatus}
            />
          </CardContent>
          <CardFooter className="flex justify-center border-t pt-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs flex gap-1"
              onClick={runDiagnostics}
              disabled={diagnosing}
            >
              {diagnosing ? (
                <>
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  Running diagnostics...
                </>
              ) : (
                <>
                  <RefreshCw className="h-3 w-3" />
                  Run connection diagnostics
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </ErrorBoundary>
  );
}
