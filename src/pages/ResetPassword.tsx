
import React from "react";
import { useNavigate } from "react-router-dom";
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
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";
import { AuthErrorDisplay } from "@/components/auth/AuthErrorDisplay";
import { useResetPassword } from "@/hooks/use-reset-password";
import { Captcha } from "@/components/auth/Captcha";

export default function ResetPassword() {
  const navigate = useNavigate();
  const {
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    isSubmitting,
    isSuccess,
    hashParams,
    passwordStrength,
    setPasswordStrength,
    error,
    handleSubmit,
    isRateLimited,
    rateLimitInfo,
    requireCaptcha,
    captchaVerified,
    handleCaptchaVerify
  } = useResetPassword();

  // Calculate remaining time text
  const getRemainingTimeText = () => {
    if (isRateLimited && rateLimitInfo.remainingMs) {
      const minutes = Math.floor(rateLimitInfo.remainingMs / 60000);
      const seconds = Math.ceil((rateLimitInfo.remainingMs % 60000) / 1000);
      
      if (minutes > 0) {
        return `${minutes} minute${minutes !== 1 ? 's' : ''} ${seconds} second${seconds !== 1 ? 's' : ''}`;
      } else {
        return `${seconds} second${seconds !== 1 ? 's' : ''}`;
      }
    }
    return "";
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
              {error.message && (
                <AuthErrorDisplay 
                  error={{ 
                    message: error.message,
                    type: typeof error.code === 'string' && error.code.includes("validation") ? "validation" : "auth" 
                  }} 
                />
              )}

              {/* Rate limit alert */}
              {isRateLimited && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Too Many Attempts</AlertTitle>
                  <AlertDescription>
                    For security reasons, password reset has been temporarily locked. Please try again in {getRemainingTimeText()}.
                  </AlertDescription>
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
                        disabled={isSubmitting || isRateLimited}
                      />
                      <PasswordStrengthMeter 
                        password={password} 
                        onStrengthChange={setPasswordStrength} 
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
                        disabled={isSubmitting || isRateLimited}
                      />
                    </div>

                    {/* CAPTCHA when required */}
                    {requireCaptcha && (
                      <Captcha 
                        onVerify={handleCaptchaVerify} 
                        disabled={isSubmitting || isRateLimited}
                        required={true}
                      />
                    )}

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSubmitting || passwordStrength < 60 || isRateLimited || (requireCaptcha && !captchaVerified)}
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
