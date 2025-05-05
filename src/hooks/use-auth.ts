
import { useContext, useEffect } from 'react';
import { AuthContext } from '@/contexts/auth/AuthContext';

export function useAuth() {
  const context = useContext(AuthContext);
  
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
      tokenValidationState: 'unknown',
      lastAuthEvent: null,
      verifyMagicLink: async () => ({ 
        success: false, 
        status: 'invalid' as const, 
        message: "Auth context not available" 
      }),
      refreshSession: async () => {},
      login: async () => false,
      logout: async () => {},
      register: async () => ({ success: false, message: "Auth context not available" }),
      validateInviteCode: async () => false,
      sessionExpiryTime: null
    };
  }
  
  return context;
}
