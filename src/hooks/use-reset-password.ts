
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { checkRateLimit, recordRateLimitAttempt, resetRateLimit, rateLimitConfigs } from '@/utils/rateLimiter';

export function useResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hashParams, setHashParams] = useState<URLSearchParams | null>(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [error, setError] = useState<{ message: string; code?: string }>({ message: '' });
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Rate limiting states
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [rateLimitInfo, setRateLimitInfo] = useState<{ remainingMs?: number; attemptsLeft?: number }>({});
  const [requireCaptcha, setRequireCaptcha] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);

  // Check rate limits on initial load
  useEffect(() => {
    const resetLimitCheck = checkRateLimit('passwordUpdate', rateLimitConfigs.passwordReset);
    setIsRateLimited(resetLimitCheck.isLimited);
    setRateLimitInfo(resetLimitCheck);
    
    // Require captcha after 2 failed attempts
    if (resetLimitCheck.attemptsLeft !== undefined && resetLimitCheck.attemptsLeft <= 3) {
      setRequireCaptcha(true);
    }
  }, []);

  // Extract token from URL
  useEffect(() => {
    // Check for hash parameters (Supabase puts tokens in the hash part of URL)
    const hash = window.location.hash.substring(1);
    if (hash) {
      const params = new URLSearchParams(hash);
      setHashParams(params);
    }

    // Also check for query parameters (sometimes tokens come in query)
    const query = new URLSearchParams(window.location.search);
    if (query.has('token') || query.has('access_token')) {
      setHashParams(query);
    }
  }, []);
  
  // Monitor rate limit countdown timer
  useEffect(() => {
    let timer: number;
    
    if (isRateLimited && rateLimitInfo.remainingMs) {
      timer = window.setInterval(() => {
        const updated = checkRateLimit('passwordUpdate', rateLimitConfigs.passwordReset);
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

  const clearError = () => {
    setError({ message: '' });
  };

  const handleError = (message: string, code?: string) => {
    setError({ message, code });
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    // Check rate limiting
    const resetLimitCheck = checkRateLimit('passwordUpdate', rateLimitConfigs.passwordReset);
    
    if (resetLimitCheck.isLimited) {
      const minutes = Math.ceil((resetLimitCheck.remainingMs || 0) / 60000);
      
      setIsRateLimited(true);
      setRateLimitInfo(resetLimitCheck);
      
      return handleError(
        `Too many password reset attempts. Please try again in ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}.`,
        "rate_limited"
      );
    }

    // If CAPTCHA is required but not verified
    if (requireCaptcha && !captchaVerified) {
      return handleError(
        "Please complete the security verification before resetting your password.",
        "captcha_required"
      );
    }

    // Validate password strength
    if (passwordStrength < 60) {
      return handleError(
        "Please create a stronger password",
        "validation_error"
      );
    }

    // Validate password match
    if (password !== confirmPassword) {
      return handleError(
        "Passwords do not match",
        "validation_error"
      );
    }

    if (!hashParams) {
      return handleError(
        "Reset token is missing. Please use the link from your email.",
        "token_error"
      );
    }

    setIsSubmitting(true);

    try {
      // Record the attempt regardless of outcome
      recordRateLimitAttempt('passwordUpdate');
      
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
      
      // Reset rate limit on success
      resetRateLimit('passwordUpdate');

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
      
      return true;
    } catch (error) {
      console.error("Password reset error:", error);
      
      // After 2 failed attempts, require CAPTCHA
      const updatedLimitCheck = checkRateLimit('passwordUpdate', rateLimitConfigs.passwordReset);
      if (updatedLimitCheck.attemptsLeft !== undefined && updatedLimitCheck.attemptsLeft <= 3) {
        setRequireCaptcha(true);
      }
      
      return handleError(
        error instanceof Error ? error.message : "Password reset failed",
        "reset_error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCaptchaVerify = (verified: boolean) => {
    setCaptchaVerified(verified);
  };

  return {
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
    clearError,
    isRateLimited,
    rateLimitInfo,
    requireCaptcha,
    captchaVerified,
    handleCaptchaVerify
  };
}
