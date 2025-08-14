
import { SentryRouteErrorBoundary } from "@/components/SentryErrorBoundary";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/ThemeProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserCompatibilityCheck } from "@/components/BrowserCompatibilityCheck";
import { OfflineDetector } from "@/components/OfflineDetector";
import { AuthProvider } from "@/contexts/auth";
import { AuthErrorBoundary } from "@/components/AuthErrorBoundary";
import { logStartupPhase } from "@/utils/errorHandling";
import { SessionValidator } from "@/components/SessionValidator";
import { OfflineBanner } from "@/components/OfflineBanner";
import { NavigationProgressBar } from "@/components/ui/progress-bar";
import { WebVitalsMonitor, PerformanceDebugger } from "@/components/Performance";
import { Suspense, useEffect, useState, useCallback } from "react";
import { CriticalLoadingState } from "@/components/CriticalLoadingState";
import AppRoutes from "./routes";
import { useToast } from "@/hooks/use-toast";
import { AuthStateMachineProvider } from "@/contexts/auth-state-machine";

logStartupPhase("App.tsx: Module loading started");

// Configure React Query with shorter stale time to ensure fresh data
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: true,
      staleTime: 10000,
      gcTime: 10 * 60 * 1000,
      refetchInterval: 30000,
    },
  },
});

// App initialization component to prevent render loops
function AppInitializer({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [initTimeout, setInitTimeout] = useState(false);
  const { toast } = useToast();
  
  // Force continue handler
  const handleForceContinue = useCallback(() => {
    console.warn("Forcing app initialization to continue");
    setIsInitialized(true);
    toast({
      title: "App initialized with warnings",
      description: "Some components may not be fully loaded. Refresh if you encounter issues.",
      variant: "default",
    });
  }, [toast]);
  
  useEffect(() => {
    // App initialization starting
    
    // Mark as initialized soon to avoid loading flicker for simple cases
    // Increased to 500ms to allow more time for auth state to stabilize
    const timer = setTimeout(() => {
      // Setting isInitialized to true
      setIsInitialized(true);
    }, 500);
    
    // Set a timeout flag after 3 seconds to avoid infinite loading
    const timeoutTimer = setTimeout(() => {
      if (!isInitialized) {
        console.warn("App initialization taking too long, showing timeout");
        setInitTimeout(true);
      }
    }, 3000);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(timeoutTimer);
    };
  }, [isInitialized]);
  
  // Force continue if initialization takes too long
  useEffect(() => {
    if (initTimeout && !isInitialized) {
      console.warn("App initialization taking too long, forcing continue");
      // Set a final timeout that will force continue after showing timeout for 2 seconds
      const forceTimer = setTimeout(() => {
        handleForceContinue();
      }, 2000);
      
      return () => clearTimeout(forceTimer);
    }
  }, [initTimeout, isInitialized, handleForceContinue]);
  
  if (!isInitialized) {
    return (
      <CriticalLoadingState 
        message="Starting application..."
        fallbackAction={initTimeout ? handleForceContinue : undefined}
        timeout={2000}
      />
    );
  }
  
  return <>{children}</>;
}

function App() {
  logStartupPhase("App component rendering");

  return (
    <SentryRouteErrorBoundary>
      <ThemeProvider defaultTheme="system" storageKey="vite-react-theme">
        <QueryClientProvider client={queryClient}>
          <AppInitializer>
            <Suspense fallback={<CriticalLoadingState message="Loading application..." timeout={3000} />}>
              <AuthErrorBoundary>
                <WebVitalsMonitor />
                <PerformanceDebugger visible={process.env.NODE_ENV === 'development'} />
                <NavigationProgressBar variant="brand" />
                <BrowserCompatibilityCheck />
                <OfflineDetector />
                <OfflineBanner position="bottom" />
                <Toaster />
                <AppRoutes />
              </AuthErrorBoundary>
            </Suspense>
          </AppInitializer>
        </QueryClientProvider>
      </ThemeProvider>
    </SentryRouteErrorBoundary>
  );
}

export default App;
