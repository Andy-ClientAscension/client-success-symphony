
import { SentryRouteErrorBoundary } from "@/components/SentryErrorBoundary";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/ThemeProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { BrowserCompatibilityCheck } from "@/components/BrowserCompatibilityCheck";
import { OfflineDetector } from "@/components/OfflineDetector";
import { AuthProvider } from "@/contexts/auth";
import { logStartupPhase } from "@/utils/errorHandling";
import AppRoutes from "./routes";

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

export default App;
