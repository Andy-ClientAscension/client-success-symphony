/**
 * Test Utilities
 * Custom render functions and testing helpers
 */

import { ReactElement, ReactNode } from 'react';
import { render, RenderOptions, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { AllProviders } from './mock-providers';

// Extended render options
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  authProps?: {
    authenticated?: boolean;
    loading?: boolean;
    error?: Error | null;
  };
  routerProps?: {
    initialEntries?: string[];
    initialIndex?: number;
  };
  wrapper?: React.ComponentType<{ children: ReactNode }>;
}

// Custom render function with providers
export function renderWithProviders(
  ui: ReactElement,
  options: CustomRenderOptions = {}
) {
  const { authProps, routerProps, wrapper, ...renderOptions } = options;

  const Wrapper = wrapper || (({ children }: { children: ReactNode }) => (
    <AllProviders authProps={authProps} routerProps={routerProps}>
      {children}
    </AllProviders>
  ));

  const user = userEvent.setup();

  return {
    user,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

// Render with authenticated user
export function renderWithAuth(ui: ReactElement, options: CustomRenderOptions = {}) {
  return renderWithProviders(ui, {
    ...options,
    authProps: { authenticated: true, ...options.authProps },
  });
}

// Render with unauthenticated user
export function renderWithoutAuth(ui: ReactElement, options: CustomRenderOptions = {}) {
  return renderWithProviders(ui, {
    ...options,
    authProps: { authenticated: false, ...options.authProps },
  });
}

// Render with loading state
export function renderWithLoading(ui: ReactElement, options: CustomRenderOptions = {}) {
  return renderWithProviders(ui, {
    ...options,
    authProps: { loading: true, ...options.authProps },
  });
}

// Wait for element helpers
export async function waitForElementToBeRemoved(selector: string) {
  await waitFor(() => {
    expect(screen.queryByTestId(selector)).not.toBeInTheDocument();
  });
}

export async function waitForElementToAppear(selector: string) {
  await waitFor(() => {
    expect(screen.getByTestId(selector)).toBeInTheDocument();
  });
}

// Form testing helpers
export async function fillForm(user: ReturnType<typeof userEvent.setup>, formData: Record<string, string>) {
  for (const [label, value] of Object.entries(formData)) {
    const input = screen.getByLabelText(new RegExp(label, 'i'));
    await user.clear(input);
    await user.type(input, value);
  }
}

export async function submitForm(user: ReturnType<typeof userEvent.setup>, buttonText = /submit/i) {
  const submitButton = screen.getByRole('button', { name: buttonText });
  await user.click(submitButton);
}

// Mock API responses
export function mockApiResponse<T>(data: T, delay = 0) {
  return vi.fn().mockImplementation(() =>
    new Promise((resolve) => {
      setTimeout(() => resolve({ data, status: 200, ok: true }), delay);
    })
  );
}

export function mockApiError(message = 'API Error', status = 500, delay = 0) {
  return vi.fn().mockImplementation(() =>
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(message)), delay);
    })
  );
}

// Local storage helpers
export function mockLocalStorage() {
  const storage: Record<string, string> = {};
  
  return {
    getItem: vi.fn((key: string) => storage[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      storage[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete storage[key];
    }),
    clear: vi.fn(() => {
      Object.keys(storage).forEach(key => delete storage[key]);
    }),
    get storage() {
      return { ...storage };
    },
  };
}

// Async testing helpers
export async function actAndWait(fn: () => Promise<void> | void) {
  await waitFor(async () => {
    await fn();
  });
}

// Error boundary testing
export function expectErrorBoundary(errorMessage?: string) {
  if (errorMessage) {
    expect(screen.getByText(new RegExp(errorMessage, 'i'))).toBeInTheDocument();
  } else {
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  }
}

// Accessibility testing helpers
export function expectAriaLabel(element: HTMLElement, label: string) {
  expect(element).toHaveAttribute('aria-label', label);
}

export function expectAriaDescribedBy(element: HTMLElement, describedBy: string) {
  expect(element).toHaveAttribute('aria-describedby', describedBy);
}

// Custom matchers
expect.extend({
  toBeDisabled(received) {
    const pass = received.disabled === true || received.hasAttribute('disabled');
    return {
      message: () => `expected element to ${pass ? 'not ' : ''}be disabled`,
      pass,
    };
  },
  toHaveLoadingState(received) {
    const hasSpinner = received.querySelector('[data-testid="loading-spinner"]');
    const hasLoadingText = received.textContent?.includes('Loading') || received.textContent?.includes('loading');
    const pass = hasSpinner || hasLoadingText;
    
    return {
      message: () => `expected element to ${pass ? 'not ' : ''}have loading state`,
      pass,
    };
  },
});

// Re-export testing library utilities
export * from '@testing-library/react';
export { userEvent };