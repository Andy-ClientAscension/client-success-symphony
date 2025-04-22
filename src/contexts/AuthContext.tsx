
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

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
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata?.name
          });
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

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          // Set session expiry to 30 days
          expiresIn: 60 * 60 * 24 * 30 // 30 days in seconds
        }
      });

      if (error) throw error;

      if (data.user) {
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
      setError(error instanceof Error ? error : new Error("Login failed"));
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
      await supabase.auth.signOut();
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
