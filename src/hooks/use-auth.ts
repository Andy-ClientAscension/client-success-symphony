
import { useState, useEffect } from 'react';

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

  return {
    ...authState,
    login,
    logout
  };
}
