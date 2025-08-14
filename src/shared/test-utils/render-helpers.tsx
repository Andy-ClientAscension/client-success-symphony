import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import { Toaster } from '@/components/ui/toaster';

// Enhanced render function with common providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: string[];
  queryClient?: QueryClient;
  withErrorBoundary?: boolean;
  errorBoundaryFallback?: React.ComponentType<any>;
}

function AllTheProviders({ 
  children, 
  queryClient,
  initialEntries = ['/'],
  withErrorBoundary = false,
  errorBoundaryFallback
}: {
  children: React.ReactNode;
  queryClient?: QueryClient;
  initialEntries?: string[];
  withErrorBoundary?: boolean;
  errorBoundaryFallback?: React.ComponentType<any>;
}) {
  const defaultQueryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
      },
      mutations: {
        retry: false,
      },
    },
  });

  const client = queryClient || defaultQueryClient;

  const content = (
    <BrowserRouter>
      <QueryClientProvider client={client}>
        {children}
        <Toaster />
      </QueryClientProvider>
    </BrowserRouter>
  );

  if (withErrorBoundary) {
    const FallbackComponent = errorBoundaryFallback || (() => <div>Error occurred</div>);
    return (
      <ErrorBoundary FallbackComponent={FallbackComponent}>
        {content}
      </ErrorBoundary>
    );
  }

  return content;
}

export function renderWithProviders(
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) {
  const {
    initialEntries,
    queryClient,
    withErrorBoundary,
    errorBoundaryFallback,
    ...renderOptions
  } = options;

  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders
        queryClient={queryClient}
        initialEntries={initialEntries}
        withErrorBoundary={withErrorBoundary}
        errorBoundaryFallback={errorBoundaryFallback}
      >
        {children}
      </AllTheProviders>
    ),
    ...renderOptions,
  });
}

// Re-export everything from testing-library
export * from '@testing-library/react';

// Override render with our enhanced version
export { renderWithProviders as render };