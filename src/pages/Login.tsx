
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AlertCircle, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { errorService } from "@/utils/errorService";
import { useApiError } from "@/hooks/use-api-error";

export default function Login() {
  // Only log in development mode
  if (process.env.NODE_ENV === "development") {
    console.log("Login component rendering");
  }
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { error: apiError, handleError, clearError, isNetworkError, isAuthError } = useApiError();
  
  // Add error handling for auth context
  let login, isAuthenticated, isLoading;
  try {
    const auth = useAuth();
    login = auth.login;
    isAuthenticated = auth.isAuthenticated;
    isLoading = auth.isLoading;
  } catch (error) {
    console.error("Failed to initialize auth:", error);
    errorService.captureError("Authentication is unavailable. Please refresh the page or try again later.", {
      severity: "high",
      context: { component: "Login", error }
    });
    throw new Error("Authentication is unavailable. Please refresh the page or try again later.");
  }
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // Only log in development mode
  if (process.env.NODE_ENV === "development") {
    console.log("Login state:", { isAuthenticated, isLoading, email: email ? "set" : "empty" });
  }
  
  // Debugging: Check authenticated status
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("Login - Auth state changed:", { isAuthenticated, isLoading });
    }
    
    if (isAuthenticated) {
      if (process.env.NODE_ENV === "development") {
        console.log("Login - User is authenticated, redirecting to dashboard");
      }
      navigate("/dashboard");
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear any previous errors
    clearError();
    
    if (!email || !password) {
      handleError({
        message: "Please enter both email and password",
        code: "validation_error"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const success = await login(email, password);
      
      if (success) {
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        });
        navigate("/dashboard");
      } else {
        handleError({
          message: "Invalid email or password. Please try again.",
          code: "auth_error"
        });
      }
    } catch (error) {
      // Use our enhanced error handling
      handleError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthenticated) {
    return <div></div>;
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
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {apiError && (
                <Alert variant="destructive" className="text-sm py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{apiError.message}</AlertDescription>
                  {isNetworkError && (
                    <div className="mt-2 text-xs">
                      If this problem persists, please contact support or try using a different browser.
                    </div>
                  )}
                  {isAuthError && (
                    <div className="mt-2 text-xs">
                      Make sure you're using the correct credentials and try again.
                    </div>
                  )}
                </Alert>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="youremail@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  aria-invalid={!!apiError}
                  disabled={isSubmitting}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <a 
                    href="#" 
                    className="text-sm text-blue-500 hover:text-blue-700"
                    onClick={(e) => {
                      e.preventDefault();
                      toast({
                        title: "Password Reset",
                        description: "Password reset functionality is not implemented in this demo.",
                      });
                    }}
                  >
                    Forgot password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  aria-invalid={!!apiError}
                  disabled={isSubmitting}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting || isLoading}
              >
                {isSubmitting ? "Logging in..." : "Login"}
              </Button>
              <p className="text-center text-sm">
                Don't have an account?{" "}
                <a 
                  href="/signup" 
                  className="text-blue-500 hover:text-blue-700"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/signup");
                  }}
                >
                  Sign up
                </a>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </ErrorBoundary>
  );
}
