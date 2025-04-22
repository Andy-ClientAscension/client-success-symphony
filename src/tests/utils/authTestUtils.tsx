
import React, { ReactNode } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';

// Mock auth values
export const mockAuthValues = {
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User'
  },
  isAuthenticated: true,
  isLoading: false,
  error: null,
  login: vi.fn().mockResolvedValue(true),
  register: vi.fn().mockResolvedValue({ success: true, message: 'Success' }),
  logout: vi.fn(),
  validateInviteCode: vi.fn().mockResolvedValue(true)
};

// Mock unauthenticated values
export const mockUnauthValues = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  login: vi.fn().mockResolvedValue(false),
  register: vi.fn().mockResolvedValue({ success: false, message: 'Failed' }),
  logout: vi.fn(),
  validateInviteCode: vi.fn().mockResolvedValue(false)
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
