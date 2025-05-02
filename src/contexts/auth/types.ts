
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

// Re-export Auth type for convenience
export type { Auth };
