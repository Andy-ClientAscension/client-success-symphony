
/**
 * Authentication Type Definitions
 */

declare namespace Auth {
  interface User {
    id: string;
    email: string;
    name?: string;
  }
  
  interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    session: any | null;
    isLoading: boolean;
    error: Error | null;
  }
  
  interface LoginCredentials {
    email: string;
    password: string;
  }
  
  interface RegistrationData {
    email: string;
    password: string;
    inviteCode: string;
  }
  
  interface AuthResponse {
    success: boolean;
    message: string;
    user?: User;
  }

  interface AuthContextType {
    user: User | null;
    session: any | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: Error | null;
    login: (email: string, password: string) => Promise<boolean>;
    register: (email: string, password: string, inviteCode: string) => Promise<{ success: boolean; message: string }>;
    logout: () => void;
    validateInviteCode: (code: string) => Promise<boolean>;
  }
}

export = Auth;
