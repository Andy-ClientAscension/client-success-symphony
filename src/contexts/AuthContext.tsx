
import React, { createContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { updateSentryUser } from "@/utils/sentry/config";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useSessionManager } from "@/hooks/use-session-manager";
import type Auth from '@/types/auth';

export const AuthContext = createContext<Auth.AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Auth.User | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Enhanced session management
  const sessionManager = useSessionManager({
    sessionTimeoutMinutes: 60, // 1 hour
    onExpired: () => {
      toast({
        title: "Session Expired",
        description: "Your session has expired. Please log in again."
      });
      logout();
    },
    onInactive: () => {
      toast({
        title: "Inactivity Timeout",
        description: "You've been logged out due to inactivity."
      });
      logout();
    }
  });

  // Valid invitation codes (in a real app, these would be stored in a database)
  const VALID_INVITE_CODES = ["SSC2024", "AGENT007", "WELCOME1"];

  // Function to validate invite codes
  const validateInviteCode = async (code: string): Promise<boolean> => {
    // In a real app, this would verify against a database
    return VALID_INVITE_CODES.includes(code);
  };

  // Handle login
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("Login attempt for:", email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error("Supabase auth error:", error);
        setError(new Error(error.message));
        return false;
      }

      if (data.session) {
        console.log("Login successful, session established");
        setSession(data.session);
        setUser({
          id: data.user.id,
          email: data.user.email!,
          name: data.user.user_metadata?.name
        });
        
        // Update Sentry user context
        updateSentryUser({
          id: data.user.id,
          email: data.user.email
        });
        
        return true;
      }

      return false;
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage = error instanceof Error ? error.message : "Login failed";
      setError(new Error(errorMessage));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Handle registration
  const register = async (
    email: string, 
    password: string, 
    inviteCode: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("Registration attempt for:", email);

      // Validate invite code first
      const isValidCode = await validateInviteCode(inviteCode);
      if (!isValidCode) {
        return {
          success: false,
          message: "Invalid invitation code"
        };
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin
        }
      });

      if (error) throw error;

      if (data.user) {
        if (data.session) {
          setSession(data.session);
          setUser({
            id: data.user.id,
            email: data.user.email!,
            name: data.user.user_metadata?.name
          });
          
          // Update Sentry user context
          updateSentryUser({
            id: data.user.id,
            email: data.user.email
          });
          
          return {
            success: true,
            message: "Registration successful! You are now logged in."
          };
        } else if (data.user.identities?.length === 0) {
          // User already exists
          return {
            success: false,
            message: "This email is already registered. Please login instead."
          };
        } else {
          // Email confirmation is required
          return {
            success: true,
            message: "Registration successful! Please check your email to confirm your account."
          };
        }
      }

      return {
        success: false,
        message: "Registration failed for unknown reason"
      };
    } catch (error) {
      console.error("Registration error:", error);
      
      // Handle specific error cases
      if (error instanceof Error) {
        if (error.message.includes("already registered")) {
          return {
            success: false,
            message: "This email is already registered. Please login instead."
          };
        }
      }
      
      setError(error instanceof Error ? error : new Error("Registration failed"));
      return {
        success: false,
        message: error instanceof Error ? error.message : "Registration failed"
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Handle logout
  const logout = async () => {
    try {
      console.log("Logging out user");
      setIsLoading(true);
      
      const { error: signOutError } = await supabase.auth.signOut();
      
      if (signOutError) {
        console.error("Error during sign out:", signOutError);
        throw signOutError;
      }
      
      // Clear auth state
      setUser(null);
      setSession(null);
      setError(null);
      
      // Update Sentry user context
      updateSentryUser(null);
      
      // Show toast notification
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
      
      // Navigate to login page
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      setError(error instanceof Error ? error : new Error("Logout failed"));
    } finally {
      setIsLoading(false);
    }
  };

  // Set up auth state listener for session management
  useEffect(() => {
    console.log("Setting up auth state listener");
    
    // First set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      console.log("Auth state changed:", event);
      
      // Use setTimeout to prevent deadlocks in the supabase client
      setTimeout(() => {
        if (currentSession) {
          setSession(currentSession);
          setUser({
            id: currentSession.user.id,
            email: currentSession.user.email!,
            name: currentSession.user.user_metadata?.name
          });
          
          // Update Sentry user context
          updateSentryUser({
            id: currentSession.user.id,
            email: currentSession.user.email
          });
        } else {
          setSession(null);
          setUser(null);
          
          // Update Sentry user context
          updateSentryUser(null);
        }
      }, 0);
    });
    
    // Then check for existing session
    const checkSession = async () => {
      try {
        setIsLoading(true);
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
          throw error;
        }
        
        if (currentSession) {
          console.log("Found existing session");
          setSession(currentSession);
          setUser({
            id: currentSession.user.id,
            email: currentSession.user.email!,
            name: currentSession.user.user_metadata?.name
          });
          
          // Update Sentry user context
          updateSentryUser({
            id: currentSession.user.id,
            email: currentSession.user.email
          });
        } else {
          console.log("No active session found");
          setSession(null);
          setUser(null);
        }
      } catch (error) {
        console.error("Session check error:", error);
        setError(error instanceof Error ? error : new Error("Failed to retrieve session"));
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();
    
    // Cleanup subscription when component unmounts
    return () => {
      console.log("Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, []);

  // Auth context value
  const authContextValue: Auth.AuthContextType = {
    user,
    session,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    register,
    logout,
    validateInviteCode,
    // Add session management helpers
    refreshSession: sessionManager.refreshSession,
    sessionExpiryTime: sessionManager.sessionExpiryTime,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
}
