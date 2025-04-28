
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { errorService } from "@/utils/error";
import { enhancedStorage } from "@/utils/storageUtils";
import type Auth from '@/types/auth';

// Valid invitation codes (in a real app, these would be stored in a database)
const VALID_INVITE_CODES = ["SSC2024", "AGENT007", "WELCOME1"];

export function useAuthService() {
  const [user, setUser] = useState<Auth.User | null>(null);
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const navigate = useNavigate();

  const validateInviteCode = async (code: string): Promise<boolean> => {
    // In a real app, this would verify against a database
    return VALID_INVITE_CODES.includes(code);
  };

  // Initialize auth state and set up listeners
  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log("Initializing auth, checking for session...");
        setIsLoading(true);
        
        // Get current session
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Error getting session:", sessionError);
          throw sessionError;
        }
        
        if (currentSession) {
          console.log("Found existing session");
          setSession(currentSession);
          setUser({
            id: currentSession.user.id,
            email: currentSession.user.email!,
            name: currentSession.user.user_metadata?.name
          });
        } else {
          console.log("No active session found");
          setSession(null);
          setUser(null);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        setError(error instanceof Error ? error : new Error("Auth initialization failed"));
      } finally {
        setIsLoading(false);
      }
    };

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      console.log("Auth state changed:", event);
      
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
      
      setIsLoading(false);
    });

    // Initialize
    initAuth();

    // Cleanup subscription
    return () => {
      console.log("Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, []);

  // Handle session refresh for token expiration
  useEffect(() => {
    let refreshTimer: number | undefined;
    
    if (session) {
      const expiresAt = session.expires_at;
      if (expiresAt) {
        const expiryTime = new Date(expiresAt * 1000);
        const timeUntilExpiry = expiryTime.getTime() - Date.now();
        
        // Refresh 5 minutes before expiration
        const refreshTime = Math.max(timeUntilExpiry - 5 * 60 * 1000, 0);
        
        console.log(`Session expires in ${Math.round(timeUntilExpiry / 60000)} minutes, will refresh in ${Math.round(refreshTime / 60000)} minutes`);
        
        if (refreshTime < 60 * 60 * 1000) { // Only set timer if expiry is less than an hour away
          refreshTimer = window.setTimeout(async () => {
            console.log("Refreshing session token");
            try {
              const { data, error } = await supabase.auth.refreshSession();
              if (error) throw error;
              
              if (data.session) {
                setSession(data.session);
                console.log("Session refreshed successfully");
              }
            } catch (error) {
              console.error("Failed to refresh session:", error);
              // If refresh fails, logout the user
              logout();
            }
          }, refreshTime);
        }
      }
    }
    
    return () => {
      if (refreshTimer) clearTimeout(refreshTimer);
    };
  }, [session]);

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
        return true;
      }

      return false;
    } catch (error) {
      console.error("Login error:", error);
      // Use errorService to get user-friendly error
      const errorMessage = errorService.getUserFriendlyMessage(error, "Login failed");
      setError(new Error(errorMessage));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    email: string, 
    password: string, 
    inviteCode: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      setIsLoading(true);
      setError(null);

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
        password
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
          
          return {
            success: true,
            message: "Registration successful! You are now logged in."
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
      
      // Navigate to login page
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      setError(error instanceof Error ? error : new Error("Logout failed"));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    session,
    isAuthenticated: !!user,
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
  };
}
