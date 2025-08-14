
import React, { ReactNode } from 'react';
import { AuthContext } from '@/contexts/auth';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import type { Session } from '@supabase/supabase-js';

// Mock auth values
export const mockAuthValues = {
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User'
  },
  session: {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_at: Date.now() / 1000 + 3600, // 1 hour from now
    expires_in: 3600,
    token_type: 'bearer',
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      aud: 'authenticated',
      role: 'authenticated',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      app_metadata: {},
      user_metadata: { name: 'Test User' }
    }
  } as Session,
  isAuthenticated: true,
  isLoading: false,
  error: null,
  login: vi.fn().mockResolvedValue(true),
  register: vi.fn().mockResolvedValue({ success: true, message: 'Success' }),
  logout: vi.fn(),
  validateInviteCode: vi.fn().mockResolvedValue(true),
  refreshSession: vi.fn(() => Promise.resolve()),
  verifyMagicLink: vi.fn().mockResolvedValue({ success: true, status: 'valid', message: 'Valid link' }),
  tokenValidationState: 'valid' as const, // Use const assertion to fix the type
  lastAuthEvent: null,
  sessionExpiryTime: new Date(Date.now() + 3600000) // 1 hour from now
};

// Mock unauthenticated values
export const mockUnauthValues = {
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  login: vi.fn().mockResolvedValue(false),
  register: vi.fn().mockResolvedValue({ success: false, message: 'Failed' }),
  logout: vi.fn(),
  validateInviteCode: vi.fn().mockResolvedValue(false),
  refreshSession: vi.fn(() => Promise.resolve()),
  verifyMagicLink: vi.fn().mockResolvedValue({ success: false, status: 'invalid', message: 'Invalid link' }),
  tokenValidationState: 'unknown' as const, // Use const assertion to fix the type
  lastAuthEvent: null,
  sessionExpiryTime: null
};

// Auth Provider for testing
interface MockAuthProviderProps {
  children: ReactNode;
  authenticated?: boolean;
  loading?: boolean;
  error?: Error | null;
}

export function MockAuthProvider({
  children,
  authenticated = true,
  loading = false,
  error = null
}: MockAuthProviderProps) {
  const authValues = authenticated ? mockAuthValues : mockUnauthValues;
  
  return (
    <BrowserRouter>
      <AuthContext.Provider
        value={{
          ...authValues,
          isLoading: loading,
          error: error
        }}
      >
        {children}
      </AuthContext.Provider>
    </BrowserRouter>
  );
}
