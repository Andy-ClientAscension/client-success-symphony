
import { useState, useEffect, useRef } from 'react';
import { useAuth } from './use-auth';

export function useAuthError() {
  const { error: authError, isLoading } = useAuth();
  const [error, setError] = useState<Error | null>(null);
  const timerRef = useRef<number | null>(null);
  
  useEffect(() => {
    // Clear any pending timers when dependencies change
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    
    if (authError && !isLoading) {
      // Process the error to provide more context
      // Using a small delay to debounce multiple error events
      timerRef.current = window.setTimeout(() => {
        const processedError = processAuthError(authError);
        setError(processedError);
        timerRef.current = null;
      }, 50);
    } else {
      setError(null);
    }
    
    // Cleanup on unmount
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [authError, isLoading]);
  
  // Enhanced error handler
  const processAuthError = (error: Error): Error => {
    const message = error.message || '';
    
    if (message.includes('Email not confirmed')) {
      return new Error('Please confirm your email before logging in. Check your inbox for a verification link.');
    }
    
    if (message.includes('Invalid login credentials') || message.includes('Invalid email or password')) {
      return new Error('Incorrect email or password. Please try again or reset your password.');
    }
    
    if (message.includes('rate limit')) {
      return new Error('Too many login attempts. Please wait a moment before trying again.');
    }
    
    if (message.includes('network') || message.includes('offline') || message.includes('failed to fetch')) {
      return new Error('Network connection issue. Please check your internet connection and try again.');
    }
    
    return error;
  };
  
  return [error, setError] as const;
}
