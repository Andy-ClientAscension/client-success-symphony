
import { SentryRouteErrorBoundary } from "@/components/SentryErrorBoundary";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/ThemeProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { BrowserCompatibilityCheck } from "@/components/BrowserCompatibilityCheck";
import { OfflineDetector } from "@/components/OfflineDetector";
import { AuthProvider } from "@/contexts/auth";
import { AuthErrorBoundary } from "@/components/AuthErrorBoundary";
import { logStartupPhase } from "@/utils/errorHandling";
import { SessionValidator } from "@/components/SessionValidator";
import { OfflineBanner } from "@/components/OfflineBanner";
import { NavigationProgressBar } from "@/components/ui/progress-bar";
import { WebVitalsMonitor, PerformanceDebugger } from "@/components/performance";
import { Suspense } from "react";
import { CriticalLoadingState } from "@/components/CriticalLoadingState";
import AppRoutes from "./routes";

logStartupPhase("App.tsx: Module loading started");

// Configure React Query with shorter stale time to ensure fresh data
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: true,
      staleTime: 10000, // Reduced to 10 seconds to make data refresh faster
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
            <Suspense fallback={<CriticalLoadingState message="Loading application..." />}>
              <AuthProvider>
                <AuthErrorBoundary>
                  <SessionValidator>
                    <WebVitalsMonitor />
                    <PerformanceDebugger visible={process.env.NODE_ENV === 'development'} />
                    <NavigationProgressBar variant="brand" />
                    <BrowserCompatibilityCheck />
                    <OfflineDetector />
                    <OfflineBanner position="bottom" />
                    <Toaster />
                    <AppRoutes />
                  </SessionValidator>
                </AuthErrorBoundary>
              </AuthProvider>
            </Suspense>
          </BrowserRouter>
        </QueryClientProvider>
      </ThemeProvider>
    </SentryRouteErrorBoundary>
  );
}

export default App;
