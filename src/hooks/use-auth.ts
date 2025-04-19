
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from "@/contexts/AuthContext";

// Valid invitation codes
const VALID_INVITE_CODES = ["SSC2024", "AGENT007", "WELCOME1"];

export interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  isLoading: boolean;
  error: Error | null;
}

// Main auth hook with context
export function useAuth() {
  console.log("Using auth hook");
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    console.error("useAuth must be used within an AuthProvider");
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  console.log("Auth context:", {
    isAuthenticated: context.isAuthenticated,
    isLoading: context.isLoading,
    userExists: !!context.user
  });
  
  return context;
}

// Direct auth hook without context
export function useDirectAuth() {
  console.log("useAuth hook called");
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    console.log("useAuth effect running");
    const checkAuth = async () => {
      try {
        const user = localStorage.getItem('user') 
          ? JSON.parse(localStorage.getItem('user') || '{}') 
          : null;
        
        setAuthState({
          isAuthenticated: !!user,
          user,
          isLoading: false,
          error: null
        });
      } catch (error) {
        console.error("Auth check error:", error);
        setAuthState({
          isAuthenticated: false,
          user: null,
          isLoading: false,
          error: error as Error
        });
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log("Login attempt with email:", email);
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const user = { email, id: '1', name: 'Demo User' };
      localStorage.setItem('user', JSON.stringify(user));
      
      setAuthState({
        isAuthenticated: true,
        user,
        isLoading: false,
        error: null
      });
      
      return true;
    } catch (error) {
      console.error("Login error:", error);
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: error as Error
      });
      return false;
    }
  };
  
  const logout = () => {
    console.log("Logout called");
    localStorage.removeItem('user');
    setAuthState({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      error: null
    });
  };

  const register = async (email: string, password: string, inviteCode: string): Promise<{ success: boolean; message: string }> => {
    console.log("Register attempt with email:", email);
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const isValidCode = await validateInviteCode(inviteCode);
      
      if (!isValidCode) {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return { 
          success: false, 
          message: "Invalid invitation code. Please check your code and try again." 
        };
      }
      
      if (password.length < 6) {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return { 
          success: false, 
          message: "Password must be at least 6 characters." 
        };
      }

      const user = { email, id: '1', name: 'Demo User' };
      localStorage.setItem('user', JSON.stringify(user));
      
      setAuthState({
        isAuthenticated: true,
        user,
        isLoading: false,
        error: null
      });
      
      return { 
        success: true, 
        message: "Registration successful!" 
      };
    } catch (error) {
      console.error("Registration error:", error);
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: error as Error
      });
      return { 
        success: false, 
        message: "An error occurred during registration. Please try again." 
      };
    }
  };

  const validateInviteCode = async (code: string): Promise<boolean> => {
    console.log("Validating invite code:", code);
    return VALID_INVITE_CODES.includes(code);
  };

  return {
    ...authState,
    login,
    logout,
    register,
    validateInviteCode
  };
}
