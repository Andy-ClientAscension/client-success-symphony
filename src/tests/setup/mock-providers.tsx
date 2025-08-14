/**
 * Mock Providers for Testing
 * Comprehensive mocks for Auth, Router, and other providers
 */

import React, { ReactNode } from 'react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/ThemeProvider';
import { vi } from 'vitest';

// Mock Auth Context Values
export const mockAuthenticatedUser = {
  id: 'test-user-1',
  email: 'test@example.com',
  name: 'Test User',
};

export const mockAuthValues = {
  user: mockAuthenticatedUser,
  session: {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_at: Date.now() + 3600000, // 1 hour
  },
  isAuthenticated: true,
  isLoading: false,
  error: null,
  login: vi.fn().mockResolvedValue(true),
  register: vi.fn().mockResolvedValue({ success: true, message: 'Success' }),
  logout: vi.fn().mockResolvedValue(undefined),
  validateInviteCode: vi.fn().mockResolvedValue(true),
  refreshSession: vi.fn().mockResolvedValue(undefined),
  sessionExpiryTime: new Date(Date.now() + 3600000),
};

export const mockUnauthenticatedValues = {
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  login: vi.fn().mockResolvedValue(false),
  register: vi.fn().mockResolvedValue({ success: false, message: 'Failed' }),
  logout: vi.fn().mockResolvedValue(undefined),
  validateInviteCode: vi.fn().mockResolvedValue(false),
  refreshSession: vi.fn().mockResolvedValue(undefined),
  sessionExpiryTime: null,
};

export const mockLoadingAuthValues = {
  ...mockUnauthenticatedValues,
  isLoading: true,
};

// Mock Auth Provider Component
interface MockAuthProviderProps {
  children: ReactNode;
  authenticated?: boolean;
  loading?: boolean;
  error?: Error | null;
  customValues?: Partial<typeof mockAuthValues>;
}

export function MockAuthProvider({
  children,
  authenticated = true,
  loading = false,
  error = null,
  customValues = {},
}: MockAuthProviderProps) {
  let authValues;

  if (loading) {
    authValues = { ...mockLoadingAuthValues, ...customValues };
  } else if (authenticated) {
    authValues = { ...mockAuthValues, error, ...customValues };
  } else {
    authValues = { ...mockUnauthenticatedValues, error, ...customValues };
  }

  // Create mock context
  const AuthContext = React.createContext(authValues);
  
  return (
    <AuthContext.Provider value={authValues}>
      {children}
    </AuthContext.Provider>
  );
}

// Mock Router Provider
interface MockRouterProviderProps {
  children: ReactNode;
  initialEntries?: string[];
  initialIndex?: number;
}

export function MockRouterProvider({
  children,
  initialEntries = ['/'],
  initialIndex = 0,
}: MockRouterProviderProps) {
  return (
    <MemoryRouter initialEntries={initialEntries} initialIndex={initialIndex}>
      {children}
    </MemoryRouter>
  );
}

// Mock Query Client
export function createMockQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

// Mock Query Provider
interface MockQueryProviderProps {
  children: ReactNode;
  client?: QueryClient;
}

export function MockQueryProvider({
  children,
  client = createMockQueryClient(),
}: MockQueryProviderProps) {
  return (
    <QueryClientProvider client={client}>
      {children}
    </QueryClientProvider>
  );
}

// All Providers Wrapper
interface AllProvidersProps {
  children: ReactNode;
  authProps?: Partial<MockAuthProviderProps>;
  routerProps?: Partial<MockRouterProviderProps>;
  queryClient?: QueryClient;
}

export function AllProviders({
  children,
  authProps = {},
  routerProps = {},
  queryClient = createMockQueryClient(),
}: AllProvidersProps) {
  return (
    <MockQueryProvider client={queryClient}>
      <MockRouterProvider {...routerProps}>
        <MockAuthProvider {...authProps}>
          <ThemeProvider defaultTheme="light" storageKey="test-theme">
            {children}
            <Toaster />
          </ThemeProvider>
        </MockAuthProvider>
      </MockRouterProvider>
    </MockQueryProvider>
  );
}