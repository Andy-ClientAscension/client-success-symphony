
import { useContext, useEffect, useRef } from 'react';
import { AuthContext } from '@/contexts/auth/AuthContext';
import type { Auth } from '@/contexts/auth/types';

export function useAuth() {
  const context = useContext(AuthContext);
  const refreshAttemptedRef = useRef(false);
  
  if (context === undefined) {
    console.error('useAuth called outside of AuthProvider context');
    // Instead of throwing an error which might crash the app,
    // return a safe fallback that won't cause loops
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
      refreshSession: async () => Promise.resolve(),
      login: async () => false,
      logout: async () => Promise.resolve(),
      register: async () => ({ success: false, message: "Auth context not available" }),
      validateInviteCode: async () => false,
      sessionExpiryTime: null
    };
  }
  
  return context;
}
