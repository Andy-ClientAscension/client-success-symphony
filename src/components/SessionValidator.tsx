
import React, { useEffect } from 'react';
import useSessionValidator from '@/hooks/useSessionValidator';
import { useAuth } from '@/hooks/use-auth';

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
  const { isAuthenticated } = useAuth();
  const { validateSession } = useSessionValidator({
    validateIntervalMinutes,
    redirectPath,
    showExpiredToast
  });

  // Focus and blur event listeners to validate session
  // This catches cases when the user's computer was asleep
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const handleFocus = () => {
      console.log('Window focused, validating session');
      validateSession();
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [isAuthenticated, validateSession]);

  return <>{children}</>;
}

export default SessionValidator;
