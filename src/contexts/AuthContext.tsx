
import React, { createContext, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthService } from "@/hooks/useAuthService";
import type Auth from '@/types/auth';

export const AuthContext = createContext<Auth.AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const {
    user,
    session,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    validateInviteCode,
    setUser,
    setSession,
    setIsLoading,
    setError
  } = useAuthService();

  // Context value
  const authContextValue: Auth.AuthContextType = {
    user,
    session,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    validateInviteCode
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
}
