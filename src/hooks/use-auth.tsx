
import { useContext, useEffect, useRef, useCallback } from "react";
import { AuthContext } from "@/contexts/auth/AuthContext";
import type { Auth } from '@/contexts/auth/types';
import { getCachedSession, refreshCachedSessionTTL } from "@/utils/sessionCache";

// Main auth hook to be used across the application
export function useAuth(): Auth.AuthContextType {
  const context = useContext(AuthContext);
  const refreshedRef = useRef(false);
  const initializedRef = useRef(false);
  const lastRefreshTimeRef = useRef<number | null>(null);
  
  // Memoize the refresh session function to avoid unnecessary reloads
  const optimizedRefreshSession = useCallback(async () => {
    const now = Date.now();
    // Prevent multiple refresh attempts within 5 seconds
    if (lastRefreshTimeRef.current && (now - lastRefreshTimeRef.current < 5000)) {
      console.log('[useAuth] Skipping refresh, last refresh too recent');
      return Promise.resolve();
    }
    
    console.log('[useAuth] Running session refresh');
    lastRefreshTimeRef.current = now;
    
    if (context?.refreshSession) {
      return context.refreshSession();
    }
    return Promise.resolve();
  }, [context]);
  
  useEffect(() => {
    // Skip if we've already initialized this hook instance
    if (initializedRef.current) return;
    initializedRef.current = true;
    
    // Only run TTL refresh if we have an authenticated session
    // And only do it once per component mount
    if (context?.isAuthenticated && context?.session && !refreshedRef.current) {
      console.log('[useAuth] Refreshing cached session TTL');
      const cachedSession = getCachedSession();
      if (cachedSession) {
        refreshCachedSessionTTL();
        refreshedRef.current = true; // Mark as refreshed to prevent infinite loops
      }
    }
  }, [context?.isAuthenticated, context?.session]);
  
  if (context === undefined) {
    console.error('[useAuth] Context error: useAuth must be used within an AuthProvider');
    // Return a safe fallback that won't cause loops
    return {
      isAuthenticated: false,
      isLoading: false,
      user: null,
      session: null,
      error: null,
      tokenValidationState: 'unknown' as const,
      lastAuthEvent: null,
      verifyMagicLink: async () => ({ 
        success: false, 
        status: 'invalid' as const, 
        message: "Auth context not available" 
      }),
      refreshSession: async () => {
        console.log('[useAuth] Fallback refreshSession called');
        return Promise.resolve();
      },
      login: async () => false,
      logout: async () => {
        console.log('[useAuth] Fallback logout called');
        return Promise.resolve();
      },
      register: async () => ({ success: false, message: "Auth context not available" }),
      validateInviteCode: async () => false,
      sessionExpiryTime: null
    };
  }
  
  // Override the refreshSession method with our optimized version
  return {
    ...context,
    refreshSession: optimizedRefreshSession
  };
}

// Export types for backwards compatibility
export type User = Auth.UserType;
export type AuthContextType = Auth.AuthContextType;

// Utility function to check if a user is authenticated
export function useIsAuthenticated(): boolean {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
}

// Utility function to get the current user
export function useCurrentUser(): Auth.UserType | null {
  const { user } = useAuth();
  return user;
}

// Utility function to get the login/logout functions
export function useAuthActions() {
  const { login, logout, register, refreshSession } = useAuth();
  return { login, logout, register, refreshSession };
}
