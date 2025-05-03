
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

interface SessionValidationConfig {
  validateIntervalMinutes?: number;
  redirectPath?: string;
  showExpiredToast?: boolean;
}

/**
 * Hook that periodically validates the user's session and handles refresh/redirect logic
 */
export function useSessionValidator({
  validateIntervalMinutes = 5,
  redirectPath = '/login',
  showExpiredToast = true
}: SessionValidationConfig = {}) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated, user, refreshSession } = useAuth();
  const [validating, setValidating] = useState(false);
  const [lastValidated, setLastValidated] = useState<Date | null>(null);
  const [validationError, setValidationError] = useState<Error | null>(null);

  // Convert minutes to milliseconds
  const validateIntervalMs = validateIntervalMinutes * 60 * 1000;

  // Session validation function
  const validateSession = async () => {
    if (!isAuthenticated) return;
    
    try {
      setValidating(true);
      setValidationError(null);
      
      console.log('Validating session...');
      
      // Check session with Supabase
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        throw error;
      }
      
      // If no session or session is expired
      if (!data.session) {
        console.log('Session not found during validation');
        
        try {
          // Try to refresh session first
          await refreshSession();
          console.log('Session refreshed successfully');
        } catch (refreshError) {
          console.error('Failed to refresh session:', refreshError);
          
          if (showExpiredToast) {
            toast({
              title: 'Session Expired',
              description: 'Your session has expired. Please log in again.',
              variant: 'destructive'
            });
          }
          
          // Redirect to login page
          navigate(redirectPath, { replace: true });
          return;
        }
      }
      
      // Session is valid
      setLastValidated(new Date());
    } catch (error) {
      console.error('Session validation error:', error);
      setValidationError(error instanceof Error ? error : new Error('Failed to validate session'));
      
      // On error, redirect to login as a fallback
      if (showExpiredToast) {
        toast({
          title: 'Authentication Error',
          description: 'Please log in again to continue.',
          variant: 'destructive'
        });
      }
      
      navigate(redirectPath, { replace: true });
    } finally {
      setValidating(false);
    }
  };

  // Initial validation on mount and when authentication status changes
  useEffect(() => {
    if (isAuthenticated && user) {
      validateSession();
    }
  }, [isAuthenticated, user]);

  // Set up interval for periodic validation
  useEffect(() => {
    if (!isAuthenticated) return;
    
    // Perform validation at the specified interval
    const intervalId = setInterval(() => {
      validateSession();
    }, validateIntervalMs);
    
    // Clean up interval on unmount
    return () => {
      clearInterval(intervalId);
    };
  }, [isAuthenticated, validateIntervalMs]);

  return {
    validating,
    lastValidated,
    validationError,
    validateSession,
  };
}

export default useSessionValidator;
