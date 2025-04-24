
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
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Login() {
  console.log("Login component rendering");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  
  // Add error handling for auth context
  let login, isAuthenticated, isLoading;
  try {
    const auth = useAuth();
    login = auth.login;
    isAuthenticated = auth.isAuthenticated;
    isLoading = auth.isLoading;
  } catch (error) {
    console.error("Failed to initialize auth:", error);
    throw new Error("Authentication is unavailable. Please refresh the page or try again later.");
  }
  
  const navigate = useNavigate();
  const { toast } = useToast();

  console.log("Login state:", { isAuthenticated, isLoading, email: email ? "set" : "empty" });

  // Debugging: Check render cycle
  React.useEffect(() => {
    console.log("Login component mounted");
    return () => console.log("Login component unmounted");
  }, []);

  // Debugging: Check authenticated status
  React.useEffect(() => {
    console.log("Login - Auth state changed:", { isAuthenticated, isLoading });
    if (isAuthenticated) {
      console.log("Login - User is authenticated, redirecting to dashboard");
      navigate("/dashboard");
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login form submitted");
    
    // Clear any previous errors
    setLoginError(null);
    
    if (!email || !password) {
      console.log("Login validation failed - missing fields");
      setLoginError("Please enter both email and password");
      return;
    }
    
    setIsSubmitting(true);
    console.log("Attempting login for email:", email);
    
    try {
      const success = await login(email, password);
      console.log("Login attempt result:", success);
      
      if (success) {
        console.log("Login successful, will navigate to dashboard");
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        });
        navigate("/dashboard");
      } else {
        console.log("Login failed");
        setLoginError("Invalid email or password. Please try again.");
        toast({
          title: "Login Failed",
          description: "Invalid email or password. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      setLoginError(error instanceof Error ? error.message : "An unexpected error occurred during login. Please try again.");
      toast({
        title: "Login Error",
        description: "An error occurred during login. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthenticated) {
    console.log("Login - Already authenticated, returning empty div");
    return <div></div>;
  }

  console.log("Login - Rendering login form");
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
              {loginError && (
                <Alert variant="destructive" className="text-sm py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{loginError}</AlertDescription>
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
                  aria-invalid={!!loginError}
                  disabled={isSubmitting}
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
                  aria-invalid={!!loginError}
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
