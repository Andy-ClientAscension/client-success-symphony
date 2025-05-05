import { useState, useRef, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuthStateMachine } from './use-auth-state-machine';
import { getCachedSession, refreshCachedSessionTTL } from '@/utils/sessionCache';

export function useSessionCoordination() {
  const [sessionCheckInProgress, setSessionCheckInProgress] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const sessionCheckRef = useRef<AbortController | null>(null);
  const refreshAttemptedRef = useRef(false);
  const { state, dispatch, isAuthenticated } = useAuthStateMachine();
  const { toast } = useToast();
  
  // Cancel any in-flight session checks
  const cancelCurrentSessionCheck = useCallback(() => {
    if (sessionCheckRef.current) {
      sessionCheckRef.current.abort('New session check requested');
      sessionCheckRef.current = null;
    }
  }, []);
  
  // Check session with debouncing and cancellation
  const checkSession = useCallback(async (force = false) => {
    // Skip if already checking and not forced
    if (sessionCheckInProgress && !force) {
      console.log('[SessionCoordination] Session check already in progress, skipping');
      return { success: false, skipped: true };
    }
    
    // Skip if checked recently (within 2s) unless forced
    if (lastChecked && !force && (Date.now() - lastChecked.getTime() < 2000)) {
      console.log('[SessionCoordination] Session checked recently, skipping');
      return { success: false, skipped: true };
    }
    
    // Cancel any in-flight session checks
    cancelCurrentSessionCheck();
    
    // Create new abort controller
    const abortController = new AbortController();
    sessionCheckRef.current = abortController;
    
    try {
      setSessionCheckInProgress(true);
      dispatch({ type: 'SESSION_CHECK_START' });
      
      // Use cached session with fallback to API call
      console.log('[SessionCoordination] Checking session status');
      const cachedSession = getCachedSession();
      
      // If we have a valid cached session, use it
      if (cachedSession && !force) {
        console.log('[SessionCoordination] Using cached session');
        refreshCachedSessionTTL(); // Refresh TTL
        
        setLastChecked(new Date());
        dispatch({ type: 'SESSION_CHECK_SUCCESS' });
        return { success: true, cached: true };
      }
      
      // Otherwise, get fresh session from Supabase
      const { data: { session }, error } = await supabase.auth.getSession();
      
      // Check if operation was aborted
      if (abortController.signal.aborted) {
        console.log('[SessionCoordination] Session check aborted');
        return { success: false, aborted: true };
      }
      
      if (error) {
        console.error('[SessionCoordination] Session check error:', error);
        dispatch({ type: 'SESSION_CHECK_FAILURE' });
        return { success: false, error };
      }
      
      setLastChecked(new Date());
      
      if (session) {
        dispatch({ type: 'SESSION_CHECK_SUCCESS' });
        return { success: true, session };
      } else {
        dispatch({ type: 'SESSION_CHECK_FAILURE' });
        return { success: false, authenticated: false };
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        console.log('[SessionCoordination] Session check aborted');
        return { success: false, aborted: true };
      }
      
      console.error('[SessionCoordination] Session check error:', error);
      dispatch({ type: 'SESSION_CHECK_FAILURE' });
      return { success: false, error };
    } finally {
      if (sessionCheckRef.current === abortController) {
        sessionCheckRef.current = null;
      }
      setSessionCheckInProgress(false);
    }
  }, [sessionCheckInProgress, lastChecked, cancelCurrentSessionCheck, dispatch]);
  
  // Refresh session with debouncing
  const refreshSession = useCallback(async (force = false) => {
    // For normal refreshes (non-forced), check if we already attempted
    if (!force && refreshAttemptedRef.current) {
      console.log('[SessionCoordination] Session refresh already attempted, skipping');
      return { success: false, skipped: true };
    }
    
    refreshAttemptedRef.current = true;
    
    try {
      console.log('[SessionCoordination] Refreshing session');
      dispatch({ type: 'SESSION_CHECK_START' });
      
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('[SessionCoordination] Session refresh error:', error);
        dispatch({ type: 'SESSION_CHECK_FAILURE' });
        
        if (!force) {
          toast({
            title: 'Session Error',
            description: 'Failed to refresh your session. You may need to log in again.',
            variant: 'destructive'
          });
        }
        
        return { success: false, error };
      }
      
      if (data.session) {
        setLastChecked(new Date());
        dispatch({ type: 'SESSION_CHECK_SUCCESS' });
        
        if (!force) {
          toast({
            title: 'Session Refreshed',
            description: 'Your authentication has been refreshed successfully.'
          });
        }
        
        return { success: true, session: data.session };
      } else {
        dispatch({ type: 'SESSION_CHECK_FAILURE' });
        return { success: false, authenticated: false };
      }
    } catch (error) {
      console.error('[SessionCoordination] Session refresh error:', error);
      dispatch({ type: 'SESSION_CHECK_FAILURE' });
      return { success: false, error };
    }
  }, [dispatch, toast]);
  
  // Initialize session check once on mount
  useEffect(() => {
    // Only run this effect once
    const initTimer = setTimeout(() => {
      checkSession();
    }, 50);
    
    return () => {
      clearTimeout(initTimer);
      cancelCurrentSessionCheck();
    };
  }, [checkSession, cancelCurrentSessionCheck]);
  
  return {
    checkSession,
    refreshSession,
    sessionCheckInProgress,
    lastChecked,
    isAuthenticated,
    cancelCurrentSessionCheck
  };
}
