
import type Auth from '@/types/auth';

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

// Add AuthResult interface to the Auth namespace
declare namespace Auth {
  interface AuthResult {
    success: boolean;
    error: Error | null;
    session: any | null;
    user: Auth.User | null;
  }
}

// Re-export Auth type for convenience
export type { Auth };
