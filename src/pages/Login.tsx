
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from "@/hooks/use-auth";
import { useNavigate, useLocation } from 'react-router-dom';
import { LoginForm } from "@/components/auth/LoginForm";
import { useToast } from "@/hooks/use-toast";
import { announceToScreenReader, setFocusToElement } from "@/lib/accessibility";
import { useLoginForm } from "@/hooks/use-login-form";

export default function Login() {
  console.log('[Login] Component rendering');
  
  const [error, setError] = useState<{ message: string; type?: string } | null>(null);
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  console.log('[Login] State:', {
    isAuthenticated,
    isLoading,
    hasError: !!error,
    locationState: location.state
  });
  
  // Use the enhanced login form hook
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
    checkNetworkStatus,
    apiError,
    isRateLimited,
    rateLimitInfo,
    requireCaptcha,
    captchaVerified,
    handleCaptchaVerify
  } = useLoginForm();
  
  // Check for auth error passed from Index page
  useEffect(() => {
    console.log('[Login] Checking for auth errors in location state');
    const state = location.state as { authError?: string } | undefined;
    if (state?.authError) {
      console.log('[Login] Found auth error in state:', state.authError);
      setError({ message: state.authError });
      announceToScreenReader(`Authentication error: ${state.authError}`, "assertive");
      
      // Clear the state so error doesn't persist on refresh
      window.history.replaceState({}, document.title);
      console.log('[Login] Cleared location state');
    }
  }, [location.state]);

  // Show API errors from the hook
  useEffect(() => {
    if (apiError) {
      console.log('[Login] API error detected:', apiError);
      setError({ 
        message: apiError.message, 
        type: apiError.code ? String(apiError.code) : undefined 
      });
    } else {
      setError(null);
    }
  }, [apiError]);

  // Memoize the redirect callback to prevent recreation on each render
  const redirectToDashboard = useCallback(() => {
    console.log('[Login] Redirecting to dashboard');
    announceToScreenReader("Already authenticated, redirecting to dashboard", "polite");
    navigate('/dashboard', { replace: true });
  }, [navigate]);

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    // Only redirect if explicitly authenticated and not loading
    if (isAuthenticated && !isLoading) {
      console.log('[Login] User already authenticated, scheduling redirect');
      // Use setTimeout to avoid potential render loops
      const redirectTimer = setTimeout(redirectToDashboard, 100);
      return () => clearTimeout(redirectTimer);
    }
  }, [isAuthenticated, isLoading, redirectToDashboard]);
  
  // Set focus and announce page loaded (separated from redirect logic)
  useEffect(() => {
    // Announce login page loaded
    console.log('[Login] Page loaded effect triggered');
    announceToScreenReader("Login page loaded", "polite");
    
    // Set focus to main content or email input when page loads
    const focusTimer = setTimeout(() => {
      const emailInput = document.getElementById('email');
      if (emailInput) {
        console.log('[Login] Setting focus to email input');
        emailInput.focus();
      } else {
        console.log('[Login] Setting focus to main content');
        setFocusToElement('main-content');
      }
    }, 100);
    
    return () => clearTimeout(focusTimer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <div className="flex items-center justify-center min-h-screen">
        <div id="main-content" tabIndex={-1} className="w-full max-w-md p-8 space-y-8 bg-card rounded-xl shadow-lg">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Login</h1>
            <p className="text-muted-foreground">Welcome back! Please sign in to your account.</p>
          </div>

          <LoginForm
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            isSubmitting={isSubmitting}
            isResettingPassword={isResettingPassword}
            onSubmit={handleSubmit}
            onPasswordReset={handlePasswordReset}
            error={error}
            networkStatus={networkStatus}
            onRetryConnection={checkNetworkStatus}
            isRateLimited={isRateLimited}
            rateLimitInfo={rateLimitInfo}
            requireCaptcha={requireCaptcha}
            captchaVerified={captchaVerified}
            onCaptchaVerify={handleCaptchaVerify}
          />
          
          <div aria-live="polite" className="sr-only">
            {isSubmitting ? "Logging in..." : error ? `Error: ${error.message}` : ""}
          </div>
        </div>
      </div>
    </div>
  );
}
