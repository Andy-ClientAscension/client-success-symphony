
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useApiError } from "@/hooks/use-api-error";

export function useLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const { handleError, clearError, error: apiError } = useApiError();

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
    
    setIsSubmitting(true);
    
    try {
      console.log("Attempting to login with:", { email, redactedPassword: '********' });
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
      // Enhanced error handling
      if (error instanceof Error) {
        if (error.message.includes('net::ERR_FAILED') || 
            error.message.includes('Failed to fetch') ||
            error.message.includes('NetworkError') ||
            error.message.includes('AbortError') ||
            error.message.includes('CORS')) {
          handleError({
            message: "Unable to connect to the authentication service. Please check your internet connection and try again.",
            code: "network_error",
            type: "network"
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
        handleError(error);
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
    handleSubmit,
    apiError
  };
}
