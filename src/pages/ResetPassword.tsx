
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Check, ArrowLeft } from "lucide-react";
import { Layout } from "@/components/Layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useApiError } from "@/hooks/use-api-error";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hashParams, setHashParams] = useState<URLSearchParams | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { handleError, clearError, error } = useApiError();

  // Extract token from URL
  useEffect(() => {
    // Check for hash parameters (Supabase puts tokens in the hash part of URL)
    const hash = window.location.hash.substring(1);
    if (hash) {
      const params = new URLSearchParams(hash);
      setHashParams(params);
    }

    // Also check for query parameters (sometimes tokens come in query)
    const query = new URLSearchParams(location.search);
    if (query.has('token') || query.has('access_token')) {
      setHashParams(query);
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    // Validate password
    if (password.length < 6) {
      handleError({
        message: "Password must be at least 6 characters long",
        code: "validation_error"
      });
      return;
    }

    if (password !== confirmPassword) {
      handleError({
        message: "Passwords do not match",
        code: "validation_error"
      });
      return;
    }

    if (!hashParams) {
      handleError({
        message: "Reset token is missing. Please use the link from your email.",
        code: "token_error"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Extract token from hash params
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      const type = hashParams.get('type');

      if (!accessToken) {
        throw new Error("Reset token is invalid or expired");
      }

      // If we have both tokens, we need to set the session first
      if (accessToken && refreshToken) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });

        if (sessionError) {
          throw sessionError;
        }
      }

      // Now update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) {
        throw updateError;
      }

      // Show success message
      setIsSuccess(true);
      toast({
        title: "Password Reset Successful",
        description: "Your password has been reset successfully.",
      });

      // Clear password fields
      setPassword("");
      setConfirmPassword("");

      // Redirect after 3 seconds
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 3000);
    } catch (error) {
      console.error("Password reset error:", error);
      handleError({
        message: error instanceof Error ? error.message : "Password reset failed",
        code: "reset_error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <ErrorBoundary customMessage="There was a problem loading the password reset form. Please try again.">
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-2xl">Reset Password</CardTitle>
              <CardDescription>
                {!isSuccess 
                  ? "Enter a new password for your account" 
                  : "Your password has been successfully reset"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error.message}</AlertDescription>
                </Alert>
              )}

              {!hashParams && !isSuccess && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Invalid Link</AlertTitle>
                  <AlertDescription>
                    This password reset link is invalid or has expired. Please request a new password reset.
                  </AlertDescription>
                </Alert>
              )}

              {isSuccess ? (
                <Alert className="mb-4 bg-green-50 border-green-200 text-green-800">
                  <Check className="h-4 w-4 text-green-600" />
                  <AlertTitle>Success!</AlertTitle>
                  <AlertDescription>
                    Your password has been reset successfully. You will be redirected to the login page.
                  </AlertDescription>
                </Alert>
              ) : (
                hashParams && (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">New Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter new password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        disabled={isSubmitting}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Resetting Password..." : "Reset Password"}
                    </Button>
                  </form>
                )
              )}
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button
                variant="outline"
                onClick={() => navigate("/login")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </Button>
            </CardFooter>
          </Card>
        </div>
      </ErrorBoundary>
    </Layout>
  );
}
