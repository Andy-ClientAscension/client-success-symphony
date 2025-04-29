
import React, { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate, useLocation } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { useLoginForm } from "@/hooks/use-login-form";
import { LoginForm } from "@/components/auth/LoginForm";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function Login() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const {
    email,
    setEmail,
    password,
    setPassword,
    isSubmitting,
    isResettingPassword,
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
            {/* Show verification error from URL if present */}
            {(verificationError || errorCode) && (
              <Alert variant="destructive" className="mb-4 text-sm py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {verificationError || "Authentication error occurred"}
                  {errorCode === "email_confirmation_required" && (
                    <div className="mt-2 text-xs">
                      Please check your email for a verification link.
                    </div>
                  )}
                </AlertDescription>
              </Alert>
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
        </Card>
      </div>
    </ErrorBoundary>
  );
}
