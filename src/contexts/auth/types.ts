
// Instead of importing Auth, we'll use the original namespace
import type { User } from '@/types/auth';

export interface AuthProviderProps {
  children: React.ReactNode;
}

export interface UseSessionManagerOptions {
  sessionTimeoutMinutes: number;
  onExpired: () => void;
  onInactive: () => void;
}

export interface SessionManager {
  sessionExpiryTime: Date | null;
}

// Define Auth namespace without conflicting with imports
export namespace Auth {
  export interface AuthResult {
    success: boolean;
    error: Error | null;
    session: any | null;
    user: User | null;
  }
  
  // Instead of self-referencing, reference the imported type
  export type UserType = User;
  
  export interface AuthContextType {
    user: User | null;
    session: any | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: Error | null;
    login: (email: string, password: string) => Promise<boolean>;
    register: (email: string, password: string, inviteCode: string) => Promise<{ success: boolean; message: string }>;
    logout: () => Promise<void>;
    validateInviteCode: (code: string) => Promise<boolean>;
    refreshSession: () => Promise<void>;
    verifyMagicLink: (token: string) => Promise<{
      success: boolean;
      status: 'valid' | 'expired' | 'invalid';
      message: string;
    }>;
    tokenValidationState: 'valid' | 'expired' | 'invalid' | 'unknown';
    lastAuthEvent: string | null;
    sessionExpiryTime?: Date | null;
  }
}

// Export the User type
export type { User };
