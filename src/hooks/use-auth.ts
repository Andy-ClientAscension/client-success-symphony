
import { useState, useEffect } from 'react';

// Valid invitation codes (in a real app, these would be stored in a database)
const VALID_INVITE_CODES = ["SSC2024", "AGENT007", "WELCOME1"];

export interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  isLoading: boolean;
  error: Error | null;
}

export function useAuth() {
  console.log("useAuth hook called");
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true,
    error: null
  });

  useEffect(() => {
    console.log("useAuth effect running");
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        // This is a placeholder - replace with your actual auth logic
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

  // Add login/logout functionality
  const login = async (email: string, password: string): Promise<boolean> => {
    console.log("Login attempt with email:", email);
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // This is a placeholder - replace with actual authentication logic
      // For demo purposes, accept any credentials
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

  // Add register functionality
  const register = async (email: string, password: string, inviteCode: string): Promise<{ success: boolean; message: string }> => {
    console.log("Register attempt with email:", email);
    setAuthState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Validate invite code first
      const isValidCode = await validateInviteCode(inviteCode);
      
      if (!isValidCode) {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return { 
          success: false, 
          message: "Invalid invitation code. Please check your code and try again." 
        };
      }
      
      // Password validation
      if (password.length < 6) {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return { 
          success: false, 
          message: "Password must be at least 6 characters." 
        };
      }

      // In a real implementation, we would register the user with a backend
      // For this mock implementation, we'll just create the user
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

  // Add validate invite code functionality
  const validateInviteCode = async (code: string): Promise<boolean> => {
    console.log("Validating invite code:", code);
    // In a real app, this would verify the code against a database
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
