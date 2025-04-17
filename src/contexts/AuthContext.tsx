import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface User {
  email: string;
  firstName?: string;
  lastName?: string;
  image?: string;
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

// Export the context so it can be imported by the hook
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      try {
        // Check if user is already logged in
        const savedUser = localStorage.getItem("user");
        
        if (savedUser) {
          // User is already logged in, set the user state
          setUser(JSON.parse(savedUser));
          setIsLoading(false);
          return;
        }
        
        // No saved user, check for saved credentials with remember me
        const savedCredentials = localStorage.getItem("savedCredentials");
        
        if (savedCredentials) {
          const credentials = JSON.parse(savedCredentials);
          
          // Check if credentials have expired
          if (credentials.expiry && new Date().getTime() > credentials.expiry) {
            // Expired, remove the saved credentials
            localStorage.removeItem("savedCredentials");
            setIsLoading(false);
          } else {
            // Auto-login if credentials are valid and not expired
            await login(credentials.email, credentials.password)
              .then(success => {
                if (!success) {
                  localStorage.removeItem("savedCredentials");
                }
              })
              .catch(() => {
                localStorage.removeItem("savedCredentials");
              })
              .finally(() => {
                setIsLoading(false);
              });
          }
        } else {
          // No saved credentials either
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        setIsLoading(false);
      }
    };
    
    initAuth();
  }, []);

  const validateInviteCode = async (code: string): Promise<boolean> => {
    // In a real app, this would verify the code against a database
    return VALID_INVITE_CODES.includes(code);
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, inviteCode: string): Promise<{ success: boolean; message: string }> => {
    try {
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    // Don't remove savedCredentials on logout if using remember me
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

// We'll keep the useAuth hook in the hooks directory, so we'll remove this export
