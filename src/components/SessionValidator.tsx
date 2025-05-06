
import React, { useEffect, useState } from 'react';
import useSessionValidator from '@/hooks/useSessionValidator';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'react-router-dom';

interface SessionValidatorProps {
  children: React.ReactNode;
  validateIntervalMinutes?: number;
  redirectPath?: string;
  showExpiredToast?: boolean;
}

/**
 * Component that wraps the application to provide session validation
 * It periodically checks if the user's session is still valid
 */
export function SessionValidator({
  children,
  validateIntervalMinutes = 5,
  redirectPath = '/login',
  showExpiredToast = true
}: SessionValidatorProps) {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const [initialized, setInitialized] = useState(false);
  const { validateSession } = useSessionValidator({
    validateIntervalMinutes,
    redirectPath,
    showExpiredToast
  });

  // Skip validation for auth paths to prevent loops
  const isAuthPath = 
    location.pathname === '/login' || 
    location.pathname === '/signup' || 
    location.pathname === '/auth-callback' || 
    location.pathname === '/reset-password' ||
    location.pathname === '/';

  // First-time initialization after a short delay
  useEffect(() => {
    if (!initialized) {
      const timer = setTimeout(() => {
        console.log('SessionValidator: Initialization complete');
        setInitialized(true);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [initialized]);

  // Focus and blur event listeners to validate session
  // This catches cases when the user's computer was asleep
  useEffect(() => {
    if (!isAuthenticated || isAuthPath || !initialized) return;
    
    console.log('SessionValidator: Setting up focus/blur listeners');
    
    const handleFocus = () => {
      console.log('Window focused, validating session');
      validateSession();
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [isAuthenticated, validateSession, isAuthPath, initialized]);

  // Only initialize periodic validation after component is fully mounted
  useEffect(() => {
    if (!isAuthenticated || isAuthPath || !initialized) return;
    
    console.log('SessionValidator: Initial session validation');
    validateSession();
    
    // Set up interval for periodic validation
    const intervalId = setInterval(() => {
      console.log('SessionValidator: Periodic validation check');
      validateSession();
    }, validateIntervalMinutes * 60 * 1000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [isAuthenticated, validateSession, validateIntervalMinutes, isAuthPath, initialized]);

  return <>{children}</>;
}

export default SessionValidator;
