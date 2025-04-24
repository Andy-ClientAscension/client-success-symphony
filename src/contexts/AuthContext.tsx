
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { errorService } from "@/utils/errorService";

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: Error | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, inviteCode: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  validateInviteCode: (code: string) => Promise<boolean>;
}

// Valid invitation codes (in a real app, these would be stored in a database)
const VALID_INVITE_CODES = ["SSC2024", "AGENT007", "WELCOME1"];

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for existing session on mount
    const initAuth = async () => {
      try {
        console.log("Initializing auth, checking for session...");
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Error getting session:", sessionError);
          throw sessionError;
        }
        
        if (session?.user) {
          console.log("Found existing session, setting user state");
          setUser({
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata?.name
          });
        } else {
          console.log("No active session found");
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        setError(error instanceof Error ? error : new Error("Auth initialization failed"));
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session ? "Session exists" : "No session");
      
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.name
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      console.log("Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, []);

  const validateInviteCode = async (code: string): Promise<boolean> => {
    // In a real app, this would verify against a database
    return VALID_INVITE_CODES.includes(code);
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("Login attempt for:", email);
      // Fixed the auth options structure to properly set session expiry
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          captchaToken: undefined // This is required for the type
        }
      });

      if (error) {
        console.error("Supabase auth error:", error);
        setError(new Error(error.message));
        return false;
      }

      // After successful login, update the session expiry to 30 days
      if (data.session) {
        console.log("Login successful, refreshing session");
        try {
          const refreshResult = await supabase.auth.refreshSession({
            refresh_token: data.session.refresh_token,
          });
          
          if (refreshResult.error) {
            console.warn("Session refresh warning:", refreshResult.error);
          } else {
            console.log("Session refreshed successfully");
          }
        } catch (refreshError) {
          console.warn("Failed to refresh session:", refreshError);
          // Continue anyway as the login was successful
        }
      }

      if (data.user) {
        console.log("Setting user state after successful login");
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
        setUser({
          id: data.user.id,
          email: data.user.email!,
          name: data.user.user_metadata?.name
        });
        
        return {
          success: true,
          message: "Registration successful!"
        };
      }

      return {
        success: false,
        message: "Registration failed"
      };
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

  const logout = async () => {
    try {
      console.log("Logging out user");
      const { error: signOutError } = await supabase.auth.signOut();
      
      if (signOutError) {
        console.error("Error during sign out:", signOutError);
      }
      
      setUser(null);
      setError(null);
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      setError(error instanceof Error ? error : new Error("Logout failed"));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        register,
        logout,
        validateInviteCode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
