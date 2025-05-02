import React, { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useSessionManager } from "@/hooks/use-session-manager";
import { supabase } from "@/integrations/supabase/client";
import { updateSentryUser } from "@/utils/sentry/config";
import { AuthProviderProps, Auth, User } from "./types";
import { validateInviteCode } from "./inviteCodeUtils";
import { refreshAuthState, login, register, logout, isSessionExpired } from "./authService";

export const AuthContext = createContext<Auth.AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastAuthEvent, setLastAuthEvent] = useState<string | null>(null);
  const [tokenValidationState, setTokenValidationState] = useState<'valid' | 'expired' | 'invalid' | 'unknown'>('unknown');
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
      handleLogout();
    },
    onInactive: () => {
      toast({
        title: "Inactivity Timeout",
        description: "You've been logged out due to inactivity."
      });
      handleLogout();
    }
  });

  // Handle session refresh
  const handleRefreshAuthState = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
      
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
        
        toast({
          title: "Session Expired",
          description: "Your session has expired. Please log in again.",
          variant: "destructive"
        });
        
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
    const broadcastChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('auth_channel') : null;
    
    // Listen for auth events from other tabs
    if (broadcastChannel) {
      broadcastChannel.onmessage = (event) => {
        const { type, data } = event.data;
        console.log(`Received auth event from another tab: ${type}`);
        
        if (type === 'SIGNIN_SUCCESS') {
          // Refresh auth state
          handleRefreshAuthState();
          setLastAuthEvent('signin_from_other_tab');
        } else if (type === 'SIGNOUT') {
          // Force logout on this tab too
          setUser(null);
          setSession(null);
          setLastAuthEvent('signout_from_other_tab');
          navigate('/login', { replace: true });
        }
      };
    }
    
    // First set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      console.log("Auth state changed:", event);
      setLastAuthEvent(event);
      
      // Handle token refresh events specifically
      if (event === 'TOKEN_REFRESHED') {
        console.log("Token refreshed, updating session state");
        // Use setTimeout to prevent deadlocks in the supabase client
        setTimeout(async () => {
          try {
            await handleRefreshAuthState();
            toast({
              title: "Session Refreshed",
              description: "Your authentication has been updated successfully."
            });
          } catch (error) {
            console.error("Failed to refresh authentication state:", error);
            toast({
              title: "Authentication Error",
              description: "Failed to refresh your session. You may need to login again.",
              variant: "destructive"
            });
          }
        }, 0);
        return; // Early return after handling token refresh
      }
      
      // Broadcast auth events to other tabs
      if (broadcastChannel) {
        if (event === 'SIGNED_IN') {
          broadcastChannel.postMessage({ type: 'SIGNIN_SUCCESS', data: { timestamp: Date.now() } });
        } else if (event === 'SIGNED_OUT') {
          broadcastChannel.postMessage({ type: 'SIGNOUT', data: { timestamp: Date.now() } });
        }
      }
      
      // Check session expiration
      const sessionExpired = isSessionExpired(currentSession);
      
      // Use setTimeout to prevent deadlocks in the supabase client
      setTimeout(() => {
        if (currentSession && !sessionExpired) {
          setSession(currentSession);
          setUser({
            id: currentSession.user.id,
            email: currentSession.user.email!,
            name: currentSession.user.user_metadata?.name
          });
          setTokenValidationState('valid');
          
          // Update Sentry user context
          updateSentryUser({
            id: currentSession.user.id,
            email: currentSession.user.email
          });
        } else if (sessionExpired) {
          console.log("Session expired, signing out user");
          setTokenValidationState('expired');
          // Will handle signout in the next tick to avoid potential deadlocks
          setTimeout(async () => {
            await supabase.auth.signOut();
            setSession(null);
            setUser(null);
            updateSentryUser(null);
            
            toast({
              title: "Session Expired",
              description: "Your session has expired. Please log in again.",
              variant: "destructive"
            });
            
            navigate('/login', { replace: true });
          }, 0);
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
        
        // Check session expiration
        const sessionExpired = isSessionExpired(currentSession);
        
        if (currentSession && !sessionExpired) {
          console.log("Found existing session");
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
        } else if (sessionExpired) {
          console.log("Found expired session, signing out user");
          setTokenValidationState('expired');
          await supabase.auth.signOut();
          setSession(null);
          setUser(null);
          updateSentryUser(null);
          
          toast({
            title: "Session Expired",
            description: "Your session has expired. Please log in again.",
            variant: "destructive"
          });
          
          navigate('/login', { replace: true });
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
    
    // Cleanup subscription and broadcast channel when component unmounts
    return () => {
      console.log("Cleaning up auth subscription");
      subscription.unsubscribe();
      if (broadcastChannel) {
        broadcastChannel.close();
      }
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
