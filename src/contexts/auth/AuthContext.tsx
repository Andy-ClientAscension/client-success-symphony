import React, { createContext, useEffect, useState } from "react";
import type { Session } from '@supabase/supabase-js';
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useSessionManager } from "@/hooks/use-session-manager";
import { supabase, getCachedUserSession } from "@/integrations/supabase/client";
import { updateSentryUser } from "@/utils/sentry/config";
import { AuthProviderProps, Auth, User } from "./types";
import { validateInviteCode } from "./inviteCodeUtils";
import { refreshAuthState, login, register, logout, isSessionExpired } from "./authService";
import { clearCachedSession } from "@/utils/sessionCache";

export const AuthContext = createContext<Auth.AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastAuthEvent, setLastAuthEvent] = useState<string | null>(null);
  const [tokenValidationState, setTokenValidationState] = useState<'valid' | 'expired' | 'invalid' | 'unknown'>('unknown');
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Reduce auth notifications by using managed toast with proper categories
  const showAuthToast = (title: string, description: string, isError = false) => {
    // Only show critical auth notifications to reduce noise
    if (title.includes("expired") || title.includes("error") || isError) {
      toast({
        title,
        description,
        variant: isError ? "destructive" : "default"
      });
    }
  };
  
  // Enhanced session management with longer timeout
  const sessionManager = useSessionManager({
    sessionTimeoutMinutes: 240, // 4 hours instead of 1 hour
    onExpired: () => {
      // Only show session expired notification once, not repeatedly
      showAuthToast(
        "Session Expired",
        "Your session has expired. Please log in again.",
        true
      );
      handleLogout();
    },
    onInactive: () => {
      // Remove inactivity timeout - too aggressive
      console.log("User inactive but session still valid");
    }
  });

  // Handle session refresh
  const handleRefreshAuthState = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Use cached session if available
      const { data: { session: currentSession }, error: sessionError } = await getCachedUserSession();
      
      if (sessionError) {
        console.error("Error refreshing session:", sessionError);
        throw sessionError;
      }
      
      // Check session expiration
      const sessionExpired = isSessionExpired(currentSession);
      
      if (sessionExpired) {
        console.log("Session has expired, signing out user");
        setTokenValidationState('expired');
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
        updateSentryUser(null);
        
        // Reduce notification noise - only show if this is the first expiry in the session
        if (!sessionStorage.getItem('session_expired_shown')) {
          sessionStorage.setItem('session_expired_shown', 'true');
          showAuthToast(
            "Session Expired",
            "Your session has expired. Please log in again.",
            true
          );
        }
        
        navigate('/login', { replace: true });
        return Promise.resolve();
      }
      
      if (currentSession) {
        console.log("Session refresh successful");
        setTokenValidationState('valid');
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
        console.log("No active session found during refresh");
        setSession(null);
        setUser(null);
        
        // Update Sentry user context
        updateSentryUser(null);
      }
      
      return Promise.resolve();
    } catch (error) {
      console.error("Session refresh error:", error);
      setError(error instanceof Error ? error : new Error("Failed to refresh session"));
      return Promise.reject(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle login
  const handleLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await login(email, password);

      if (result.error) {
        setError(result.error);
        return false;
      }

      if (result.success && result.session && result.user) {
        setSession(result.session);
        setUser(result.user);
        setTokenValidationState('valid');
        
        // Update Sentry user context
        updateSentryUser({
          id: result.user.id,
          email: result.user.email
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

  // Handle magic link verification
  const verifyMagicLink = async (token: string): Promise<{
    success: boolean;
    status: 'valid' | 'expired' | 'invalid';
    message: string;
  }> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Check if token is malformed
      if (!token || token.length < 10 || !token.includes('.')) {
        setTokenValidationState('invalid');
        return {
          success: false,
          status: 'invalid',
          message: "Invalid authentication token format"
        };
      }
      
      // Simulate a network failure for testing if specified
      if (token === 'test_network_failure') {
        return {
          success: false,
          status: 'invalid',
          message: "Network error during authentication"
        };
      }
      
      // Simulate an expired token for testing if specified
      if (token === 'test_expired_token') {
        setTokenValidationState('expired');
        return {
          success: false,
          status: 'expired',
          message: "Your authentication link has expired. Please request a new one."
        };
      }

      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'magiclink'
      });

      if (error) {
        // Check if it's an expired token
        if (error.message.includes('expired') || error.message.toLowerCase().includes('invalid')) {
          setTokenValidationState('expired');
          return {
            success: false,
            status: 'expired',
            message: "Your authentication link has expired. Please request a new one."
          };
        }
        
        // Other validation errors
        setTokenValidationState('invalid');
        return {
          success: false,
          status: 'invalid',
          message: error.message
        };
      }

      if (data && data.user) {
        setSession(data.session);
        setUser({
          id: data.user.id,
          email: data.user.email!,
          name: data.user.user_metadata?.name
        });
        setTokenValidationState('valid');
        
        updateSentryUser({
          id: data.user.id,
          email: data.user.email
        });

        return {
          success: true,
          status: 'valid',
          message: "Authentication successful"
        };
      }
      
      // Fallback error
      setTokenValidationState('invalid');
      return {
        success: false,
        status: 'invalid',
        message: "Failed to validate authentication token"
      };
    } catch (error) {
      console.error("Magic link verification error:", error);
      setTokenValidationState('invalid');
      setError(error instanceof Error ? error : new Error("Failed to verify authentication link"));
      return {
        success: false,
        status: 'invalid',
        message: error instanceof Error ? error.message : "Failed to verify authentication link"
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Handle registration
  const handleRegister = async (
    email: string, 
    password: string, 
    inviteCode: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await register(email, password, inviteCode);

      if (!result.success) {
        return result;
      }

      if (result.user && result.session) {
        setSession(result.session);
        setUser(result.user);
        setTokenValidationState('valid');
        
        // Update Sentry user context
        updateSentryUser({
          id: result.user.id,
          email: result.user.email
        });
      }
      
      return result;
    } catch (error) {
      console.error("Registration error:", error);
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
  const handleLogout = async () => {
    try {
      console.log("Logging out user");
      setIsLoading(true);
      
      // Clear cached session
      clearCachedSession();
      
      const { error: signOutError } = await supabase.auth.signOut();
      
      if (signOutError) {
        console.error("Error during sign out:", signOutError);
        throw signOutError;
      }
      
      // Clear auth state
      setUser(null);
      setSession(null);
      setError(null);
      setTokenValidationState('unknown');
      
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
    let isProcessingExpiration = false; // Prevent multiple concurrent expiration processes
    
    // First set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      console.log("Auth state changed:", event);
      setLastAuthEvent(event);
      
      // Skip processing if already handling expiration to prevent loops
      if (isProcessingExpiration && (event === 'SIGNED_OUT' || !currentSession)) {
        return;
      }
      
      // Handle token refresh events specifically
      if (event === 'TOKEN_REFRESHED') {
        console.log("Token refreshed, updating session state");
        setSession(currentSession);
        if (currentSession?.user) {
          setUser({
            id: currentSession.user.id,
            email: currentSession.user.email!,
            name: currentSession.user.user_metadata?.name
          });
          setTokenValidationState('valid');
          updateSentryUser({
            id: currentSession.user.id,
            email: currentSession.user.email
          });
        }
        return;
      }
      
      // Simplified session handling - no complex expiration checking in the listener
      if (currentSession) {
        setSession(currentSession);
        setUser({
          id: currentSession.user.id,
          email: currentSession.user.email!,
          name: currentSession.user.user_metadata?.name
        });
        setTokenValidationState('valid');
        updateSentryUser({
          id: currentSession.user.id,
          email: currentSession.user.email
        });
      } else if (event === 'SIGNED_OUT') {
        // Only process sign out once
        if (!isProcessingExpiration) {
          isProcessingExpiration = true;
          setSession(null);
          setUser(null);
          setTokenValidationState('unknown');
          updateSentryUser(null);
          // Reset the flag after a short delay
          setTimeout(() => {
            isProcessingExpiration = false;
          }, 1000);
        }
      }
    });
    
    // Simplified session check to prevent loops
    const checkSession = async () => {
      try {
        setIsLoading(true);
        const { data: { session: currentSession } } = await getCachedUserSession();
        
        // Just set what we get - no complex expiration logic here
        if (currentSession) {
          console.log("Found existing session");
          setSession(currentSession);
          setUser({
            id: currentSession.user.id,
            email: currentSession.user.email!,
            name: currentSession.user.user_metadata?.name
          });
          setTokenValidationState('valid');
          updateSentryUser({
            id: currentSession.user.id,
            email: currentSession.user.email
          });
        } else {
          console.log("No existing session found");
          setSession(null);
          setUser(null);
          setTokenValidationState('unknown');
          updateSentryUser(null);
        }
      } catch (error) {
        console.error("Session check error:", error);
        setSession(null);
        setUser(null);
        setTokenValidationState('unknown');
        updateSentryUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [toast, navigate]); // Added toast and navigate to dependencies

  // Auth context value
  const authContextValue: Auth.AuthContextType = {
    user,
    session,
    isAuthenticated: !!user,
    isLoading,
    error,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    validateInviteCode,
    refreshSession: handleRefreshAuthState,
    verifyMagicLink,
    tokenValidationState,
    lastAuthEvent,
    sessionExpiryTime: sessionManager.sessionExpiryTime,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
}
