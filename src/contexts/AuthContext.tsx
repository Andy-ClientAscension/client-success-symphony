
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

  // Set up auth state listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      console.log("Auth state changed:", event, currentSession?.user?.email);
      
      if (currentSession) {
        setSession(currentSession);
        setUser({
          id: currentSession.user.id,
          email: currentSession.user.email!,
          name: currentSession.user.user_metadata?.name
        });
      } else {
        setSession(null);
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setSession, setUser]);

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
