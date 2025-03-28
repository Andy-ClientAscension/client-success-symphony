
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface User {
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, inviteCode: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  validateInviteCode: (code: string) => Promise<boolean>;
}

// Valid invitation codes (in a real app, these would be stored in a database)
const VALID_INVITE_CODES = ["SSC2024", "AGENT007", "WELCOME1"];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const validateInviteCode = async (code: string): Promise<boolean> => {
    // In a real app, this would verify the code against a database
    return VALID_INVITE_CODES.includes(code);
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // This is a simple mock authentication
      // In a real app, you would validate credentials against a backend
      if (password.length < 6) {
        return false;
      }

      const user = { email };
      setUser(user);
      localStorage.setItem("user", JSON.stringify(user));
      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const register = async (email: string, password: string, inviteCode: string): Promise<{ success: boolean; message: string }> => {
    try {
      // Validate invite code first
      const isValidCode = await validateInviteCode(inviteCode);
      
      if (!isValidCode) {
        return { 
          success: false, 
          message: "Invalid invitation code. Please check your code and try again." 
        };
      }
      
      // Password validation
      if (password.length < 6) {
        return { 
          success: false, 
          message: "Password must be at least 6 characters." 
        };
      }

      // In a real implementation, we would register the user with a backend
      // For this mock implementation, we'll just create the user
      const user = { email };
      setUser(user);
      localStorage.setItem("user", JSON.stringify(user));
      
      return { 
        success: true, 
        message: "Registration successful!" 
      };
    } catch (error) {
      console.error("Registration error:", error);
      return { 
        success: false, 
        message: "An error occurred during registration. Please try again." 
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
