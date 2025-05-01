
import { Suspense, lazy } from "react";
import { withSentryErrorBoundary, SentryRouteErrorBoundary } from "@/components/SentryErrorBoundary";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/ThemeProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { BrowserCompatibilityCheck } from "@/components/BrowserCompatibilityCheck";
import { OfflineDetector } from "@/components/OfflineDetector";
import { AuthProvider } from "@/contexts/AuthContext";
import { logStartupPhase } from "@/utils/errorHandling";
import { AppRoutes } from "./routes";

logStartupPhase("App.tsx: Module loading started");

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: true,
      staleTime: 15000,
      gcTime: 10 * 60 * 1000,
      refetchInterval: 30000,
    },
  },
});

function App() {
  logStartupPhase("App component rendering");

  return (
    <SentryRouteErrorBoundary>
      <ThemeProvider defaultTheme="system" storageKey="vite-react-theme">
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AuthProvider>
              <BrowserCompatibilityCheck />
              <OfflineDetector />
              <Toaster />
              <AppRoutes />
            </AuthProvider>
          </BrowserRouter>
        </QueryClientProvider>
      </ThemeProvider>
    </SentryRouteErrorBoundary>
  );
}

// Wrap the App component with Sentry monitoring
export default withSentryErrorBoundary(App, {
  name: 'AppRoot',
  fallback: function SentryFallbackComponent({ error, resetError }) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="max-w-md space-y-4 rounded-lg border bg-card p-6 shadow-lg">
          <h1 className="text-xl font-semibold">Application Error</h1>
          <p className="text-muted-foreground">
            We're sorry, but something went wrong. Our team has been notified and we're working to fix it.
          </p>
          <p className="text-sm text-destructive">
            {error?.message || "An unexpected error occurred"}
          </p>
          <div className="flex space-x-3">
            <button
              onClick={resetError}
              className="rounded bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="rounded border border-input bg-background px-4 py-2 hover:bg-accent"
            >
              Reload Application
            </button>
          </div>
        </div>
      </div>
    );
  }
});
