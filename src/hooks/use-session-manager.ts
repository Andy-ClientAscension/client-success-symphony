
import { useState, useEffect } from 'react';
import { UseSessionManagerOptions, SessionManager } from '@/contexts/auth/types';

export function useSessionManager({
  sessionTimeoutMinutes,
  onExpired,
  onInactive
}: UseSessionManagerOptions): SessionManager {
  const [sessionExpiryTime, setSessionExpiryTime] = useState<Date | null>(null);
  
  useEffect(() => {
    // Set initial expiry time
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + sessionTimeoutMinutes);
    setSessionExpiryTime(expiry);
    
    // Session timeout check
    const sessionInterval = setInterval(() => {
      if (sessionExpiryTime && new Date() > sessionExpiryTime) {
        onExpired();
      }
    }, 60000); // Check every minute
    
    // Activity tracking
    let inactivityTimeout: ReturnType<typeof setTimeout>;
    
    const resetInactivityTimer = () => {
      clearTimeout(inactivityTimeout);
      inactivityTimeout = setTimeout(() => {
        onInactive();
      }, sessionTimeoutMinutes * 60000);
      
      // Also reset session expiry
      const newExpiry = new Date();
      newExpiry.setMinutes(newExpiry.getMinutes() + sessionTimeoutMinutes);
      setSessionExpiryTime(newExpiry);
    };
    
    // Set initial inactivity timer
    resetInactivityTimer();
    
    // User activity listeners
    const activityEvents = ['mousedown', 'keypress', 'scroll', 'touchstart'];
    activityEvents.forEach(event => {
      window.addEventListener(event, resetInactivityTimer);
    });
    
    // Cleanup
    return () => {
      clearInterval(sessionInterval);
      clearTimeout(inactivityTimeout);
      activityEvents.forEach(event => {
        window.removeEventListener(event, resetInactivityTimer);
      });
    };
  }, [sessionTimeoutMinutes, sessionExpiryTime, onExpired, onInactive]);
  
  return { sessionExpiryTime };
}
