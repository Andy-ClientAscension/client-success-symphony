import { useContext, useEffect } from "react";
import { AuthContext } from "@/contexts/auth/AuthContext";
import type { Auth } from '@/contexts/auth/types';
import { getCachedSession, refreshCachedSessionTTL } from "@/utils/sessionCache";

// Main auth hook to be used across the application
export function useAuth(): Auth.AuthContextType {
  const context = useContext(AuthContext);
  
  useEffect(() => {
    // Refresh the TTL of cached session when hook is used
    // This keeps frequently used sessions in cache longer
    const cachedSession = getCachedSession();
    if (cachedSession && context?.isAuthenticated) {
      refreshCachedSessionTTL();
    }
  }, [context?.isAuthenticated]);
  
  if (context === undefined) {
    const error = new Error("useAuth must be used within an AuthProvider");
    console.error(error);
    // Instead of throwing, return a safe fallback
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
