
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
  
  // Re-export types from the original Auth namespace
  export type User = User;
  
  export interface AuthContextType {
    user: User | null;
    session: any | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: Error | null;
    login: (email: string, password: string) => Promise<boolean>;
    register: (email: string, password: string, inviteCode: string) => Promise<{ success: boolean; message: string }>;
    logout: () => void;
    validateInviteCode: (code: string) => Promise<boolean>;
    refreshSession: () => Promise<void>;
    sessionExpiryTime?: Date | null;
  }
}

// Export the Auth namespace
export type { User };
