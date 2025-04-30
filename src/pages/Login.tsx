
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
import { AlertCircle, Wifi, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { checkNetworkConnectivity, diagnoseAuthIssue } from "@/integrations/supabase/client";

export default function Login() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [diagnosing, setDiagnosing] = useState(false);
  const [diagnosticResults, setDiagnosticResults] = useState<any>(null);
  
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
    apiError
  } = useLoginForm();

  // Check for email verification status in the URL
  const searchParams = new URLSearchParams(location.search);
  const verificationError = searchParams.get('error_description');
  const errorCode = searchParams.get('error');

  // Handle redirection after login
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      const from = location.state?.from?.pathname || "/dashboard";
      console.log("Already authenticated, redirecting to", from);
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, location.state]);

  // Run connectivity diagnosis if there are errors
  const runDiagnostics = async () => {
    setDiagnosing(true);
    try {
      // Check network connectivity first
      const connectivity = await checkNetworkConnectivity();
      
      // If network is available, check auth status
      let authDiag = null;
      if (connectivity.online) {
        authDiag = await diagnoseAuthIssue();
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
        }
      });
      
    } catch (error) {
      console.error("Error running diagnostics:", error);
      setDiagnosticResults({
        error: error instanceof Error ? error.message : "Unknown error during diagnostics",
        timestamp: new Date().toISOString()
      });
    } finally {
      setDiagnosing(false);
    }
  };

  // Don't render anything if redirecting
  if (isAuthenticated) {
    return null;
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
            {!networkStatus.online && (
              <Alert variant="destructive" className="mb-4 text-sm py-2 bg-amber-50 border-amber-300">
                <WifiOff className="h-4 w-4" />
                <AlertTitle>Network Connectivity Issue</AlertTitle>
                <AlertDescription>
                  You appear to be offline. Please check your internet connection to continue.
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
            
            {/* Diagnostic results if available */}
            {diagnosticResults && (
              <div className="mb-4 text-xs bg-gray-50 dark:bg-gray-800 p-3 rounded border">
                <div className="font-medium mb-1">Connection Diagnostics:</div>
                <div>
                  Network: {diagnosticResults.network?.online ? 
                    <span className="text-green-600">Online</span> : 
                    <span className="text-red-600">Offline</span>}
                </div>
                {diagnosticResults.network?.latency && (
                  <div>Latency: {diagnosticResults.network.latency}ms</div>
                )}
                {diagnosticResults.auth?.issue && (
                  <div>Auth Issue: {diagnosticResults.auth.issue}</div>
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
