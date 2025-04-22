
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
}

export = Auth;
