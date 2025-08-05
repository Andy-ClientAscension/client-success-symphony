import React from 'react';
import { AuthStateMachineProvider } from '@/contexts/auth-state-machine';

interface UnifiedAuthProviderProps {
  children: React.ReactNode;
}

/**
 * Unified authentication provider that consolidates all auth-related contexts
 * This replaces the need for multiple auth providers and reduces complexity
 */
export function UnifiedAuthProvider({ children }: UnifiedAuthProviderProps) {
  return (
    <AuthStateMachineProvider>
      {children}
    </AuthStateMachineProvider>
  );
}