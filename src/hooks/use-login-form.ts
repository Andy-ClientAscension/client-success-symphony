
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useApiError } from "@/hooks/use-api-error";
import { resetPassword, diagnoseAuthIssue, checkNetworkConnectivity } from "@/integrations/supabase/client";
import { checkRateLimit, recordRateLimitAttempt, resetRateLimit, rateLimitConfigs } from "@/utils/rateLimiter";

export function useLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [networkStatus, setNetworkStatus] = useState<{online: boolean, latency?: number, status?: string}>({
    online: navigator.onLine
  });
  const [offlineMode, setOfflineMode] = useState(false);
  
  // Rate limiting states
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [rateLimitInfo, setRateLimitInfo] = useState<{ remainingMs?: number; attemptsLeft?: number }>({});
  const [requireCaptcha, setRequireCaptcha] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const { handleError, clearError, error: apiError } = useApiError();

  // Check rate limits on initial load
  useEffect(() => {
    const loginLimitCheck = checkRateLimit('login', rateLimitConfigs.login);
    setIsRateLimited(loginLimitCheck.isLimited);
    setRateLimitInfo(loginLimitCheck);
    
    // Require captcha after 2 failed attempts
    if (loginLimitCheck.attemptsLeft !== undefined && loginLimitCheck.attemptsLeft <= 3) {
      setRequireCaptcha(true);
    }
  }, []);

  // Monitor rate limit countdown timer
  useEffect(() => {
    let timer: number;
    
    if (isRateLimited && rateLimitInfo.remainingMs) {
      timer = window.setInterval(() => {
        const updated = checkRateLimit('login', rateLimitConfigs.login);
        setIsRateLimited(updated.isLimited);
        setRateLimitInfo(updated);
        
        if (!updated.isLimited) {
          clearInterval(timer);
        }
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRateLimited, rateLimitInfo.remainingMs]);

  // Monitor network status
  useEffect(() => {
    const checkNetwork = async () => {
      // First assume browser's online status
      setNetworkStatus(prev => ({...prev, online: navigator.onLine}));
      
      if (!navigator.onLine) {
        return;
      }
      
      try {
        // Then verify with actual request
        const status = await checkNetworkConnectivity();
        // Ensure status is always a string
        setNetworkStatus({
          online: status.online,
          latency: status.latency,
          status: status.status ? String(status.status) : undefined
        });
        
        if (!status.online && status.status === 'timeout') {
          console.log("Network check timed out, falling back to browser network status");
          setNetworkStatus(prev => ({...prev, online: navigator.onLine}));
        }
      } catch (error) {
        console.error("Error checking network connectivity:", error);
        // Fallback to browser's online status
        setNetworkStatus({online: navigator.onLine, status: 'error'});
      }
    };
    
    // Check initially
    checkNetwork();
    
    const handleOnline = () => {
      setNetworkStatus(prev => ({...prev, online: true, status: 'browser-detected'}));
      checkNetwork();
      toast({
        title: "Connected",
        description: "Your internet connection has been restored.",
      });
    };
    
    const handleOffline = () => {
      setNetworkStatus({online: false, status: 'browser-detected'});
      toast({
        title: "Disconnected",
        description: "You are currently offline. Some features may be limited.",
        variant: "destructive"
      });
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Set up periodic checks
    const intervalId = window.setInterval(checkNetwork, 30000);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, [toast]);

  // Function to manually check network status
  const checkNetworkStatus = async () => {
    try {
      const status = await checkNetworkConnectivity();
      // Ensure status is always a string
      setNetworkStatus({
        online: status.online,
        latency: status.latency,
        status: status.status ? String(status.status) : undefined
      });
      return status;
    } catch (error) {
      console.error("Error checking network:", error);
      setNetworkStatus({online: navigator.onLine, status: 'error'});
      return {online: navigator.onLine, status: 'error'};
    }
  };

  const handlePasswordReset = async () => {
    // Check rate limiting for password reset
    const resetLimitCheck = checkRateLimit('passwordReset', rateLimitConfigs.passwordReset);
    
    if (resetLimitCheck.isLimited) {
      const minutes = Math.ceil((resetLimitCheck.remainingMs || 0) / 60000);
      
      handleError({
        message: `Too many password reset attempts. Please try again in ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}.`,
        code: "rate_limited"
      });
      return;
    }
    
    if (!email) {
      handleError({
        message: "Please enter your email address to reset your password",
        code: "validation_error"
      });
      return;
    }
    
    if (!networkStatus.online) {
      handleError({
        message: "You appear to be offline. Please check your internet connection and try again.",
        code: "network_error",
        type: "network"
      });
      return;
    }
    
    // If CAPTCHA is required but not verified
    if (requireCaptcha && !captchaVerified) {
      handleError({
        message: "Please complete the security verification before resetting your password.",
        code: "captcha_required"
      });
      return;
    }
    
    setIsResettingPassword(true);
    
    try {
      // Record the attempt regardless of outcome
      recordRateLimitAttempt('passwordReset');
      
      const result = await resetPassword(email);
      
      if (result.success) {
        // Reset rate limit on success
        resetRateLimit('passwordReset');
        
        toast({
          title: "Password Reset Email Sent",
          description: "Check your inbox for instructions to reset your password.",
        });
      } else {
        handleError({
          message: result.message,
          code: "auth_error",
          type: "auth"
        });
      }
    } catch (error) {
      console.error("Password reset error:", error);
      handleError({
        message: "Failed to send password reset email. Please try again later.",
        code: "unknown_error",
        type: "auth"
      });
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    // Check rate limiting
    const loginLimitCheck = checkRateLimit('login', rateLimitConfigs.login);
    
    if (loginLimitCheck.isLimited) {
      const minutes = Math.ceil((loginLimitCheck.remainingMs || 0) / 60000);
      
      setIsRateLimited(true);
      setRateLimitInfo(loginLimitCheck);
      
      handleError({
        message: `Too many login attempts. Please try again in ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}.`,
        code: "rate_limited"
      });
      return;
    }
    
    // If CAPTCHA is required but not verified
    if (requireCaptcha && !captchaVerified) {
      handleError({
        message: "Please complete the security verification before logging in.",
        code: "captcha_required"
      });
      return;
    }
    
    if (!email || !password) {
      handleError({
        message: "Please enter both email and password",
        code: "validation_error"
      });
      return;
    }
    
    if (!networkStatus.online) {
      handleError({
        message: "You appear to be offline. Please check your internet connection and try again.",
        code: "network_error",
        type: "network"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log("Attempting to login with:", { email, redactedPassword: '********' });
      
      // Record the attempt regardless of outcome
      recordRateLimitAttempt('login');
      
      // Recheck connectivity before attempting login
      const networkDiag = await checkNetworkStatus();
      
      // If we're still offline but browser reports online, we might be having connectivity issues
      if (!networkDiag.online && navigator.onLine) {
        console.log("Browser reports online but network check failed. Using fallback.");
        // We'll try the login anyway since the browser reports we're online
      } else if (!networkDiag.online) {
        throw new Error(`Unable to reach authentication server. Please check your internet connection. Status: ${networkDiag.status || 'unreachable'}`);
      }
      
      const success = await login(email, password);
      
      if (success) {
        console.log("Login successful");
        
        // Reset rate limit counters on successful login
        resetRateLimit('login');
        
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        });
        
        // Navigate to the page they were trying to access or dashboard
        const from = location.state?.from?.pathname || "/dashboard";
        navigate(from, { replace: true });
      } else {
        console.log("Login failed - no success returned from auth provider");
        
        // After 2 failed attempts, require CAPTCHA
        const updatedLimitCheck = checkRateLimit('login', rateLimitConfigs.login);
        if (updatedLimitCheck.attemptsLeft !== undefined && updatedLimitCheck.attemptsLeft <= 3) {
          setRequireCaptcha(true);
        }
        
        handleError({
          message: "Invalid email or password. Please try again.",
          code: "auth_error"
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      
      // After 2 failed attempts, require CAPTCHA
      const updatedLimitCheck = checkRateLimit('login', rateLimitConfigs.login);
      if (updatedLimitCheck.attemptsLeft !== undefined && updatedLimitCheck.attemptsLeft <= 3) {
        setRequireCaptcha(true);
      }
      
      // Handle network-related errors specially
      if (!navigator.onLine || 
          (error instanceof Error && 
           (error.message.includes('Failed to fetch') || 
            error.message.includes('network') || 
            error.message.includes('offline')))) {
        
        handleError({
          message: "You appear to be offline. Please check your internet connection and try again.",
          code: "network_error",
          type: "network"
        });
        return;
      }
      
      // Enhanced error handling
      if (error instanceof Error) {
        if (error.message.includes('Email not confirmed')) {
          handleError({
            message: "Please verify your email address before logging in. Check your inbox for a confirmation email.",
            code: "email_verification",
            type: "auth"
          });
        } else if (error.message.includes('Invalid login credentials')) {
          handleError({
            message: "Invalid email or password. Please try again.",
            code: "auth_error",
            type: "auth"
          });
        } else if (error.message.includes('net::ERR_FAILED') || 
            error.message.includes('Failed to fetch') ||
            error.message.includes('NetworkError') ||
            error.message.includes('AbortError')) {
          handleError({
            message: "Unable to connect to the authentication service. This may be due to network issues. Please check your connection settings and try again.",
            code: "network_error",
            type: "network"
          });
        } else if (error.message.includes('CORS')) {
          handleError({
            message: "A network security policy is blocking the authentication request. This may be due to browser settings or extensions.",
            code: "cors_error",
            type: "cors"
          });
        } else if (error.message.toLowerCase().includes('too many requests')) {
          handleError({
            message: "Too many login attempts. Please try again later.",
            code: "rate_limit",
            type: "auth"
          });
        } else {
          // Pass the error through the error service for consistent handling
          handleError(error);
        }
      } else {
        handleError({
          message: "An unexpected error occurred during login. Please try again.",
          code: "unknown_error",
          type: "auth"
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCaptchaVerify = (verified: boolean) => {
    setCaptchaVerified(verified);
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    isSubmitting,
    isResettingPassword,
    networkStatus,
    offlineMode,
    handleSubmit,
    handlePasswordReset,
    checkNetworkStatus,
    apiError,
    // Rate limiting props
    isRateLimited,
    rateLimitInfo,
    requireCaptcha,
    captchaVerified,
    handleCaptchaVerify
  };
}
