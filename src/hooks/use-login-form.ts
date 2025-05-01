
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useApiError } from "@/hooks/use-api-error";
import { resetPassword, diagnoseAuthIssue, checkNetworkConnectivity } from "@/integrations/supabase/client";

export function useLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [networkStatus, setNetworkStatus] = useState<{online: boolean, latency?: number, status?: string}>({
    online: navigator.onLine
  });
  const [offlineMode, setOfflineMode] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const { handleError, clearError, error: apiError } = useApiError();

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
        setNetworkStatus(status);
        
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
      setNetworkStatus(status);
      return status;
    } catch (error) {
      console.error("Error checking network:", error);
      setNetworkStatus({online: navigator.onLine, status: 'error'});
      return {online: navigator.onLine, status: 'error'};
    }
  };

  const handlePasswordReset = async () => {
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
    
    setIsResettingPassword(true);
    
    try {
      const result = await resetPassword(email);
      
      if (result.success) {
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
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        });
        
        // Navigate to the page they were trying to access or dashboard
        const from = location.state?.from?.pathname || "/dashboard";
        navigate(from, { replace: true });
      } else {
        console.log("Login failed - no success returned from auth provider");
        handleError({
          message: "Invalid email or password. Please try again.",
          code: "auth_error"
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      
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
    apiError
  };
}
