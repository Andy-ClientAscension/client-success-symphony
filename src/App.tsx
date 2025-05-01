import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { withSentryErrorBoundary, SentryRouteErrorBoundary } from "@/components/SentryErrorBoundary";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { BrowserCompatibilityCheck } from "@/components/BrowserCompatibilityCheck";
import { OfflineDetector } from "@/components/OfflineDetector";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { logStartupPhase } from "@/utils/errorHandling";

// Import pages
import DiagnosticIndex from "@/pages/DiagnosticIndex";
import Login from "@/pages/Login";
import SignUp from "@/pages/SignUp";
import UnifiedDashboard from "@/pages/UnifiedDashboard";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import Clients from "@/pages/Clients";
import ClientDetails from "@/pages/ClientDetails";
import AddClient from "@/pages/AddClient";
import Renewals from "@/pages/Renewals";

// Lazy load less frequently accessed pages
const Communications = lazy(() => import("@/pages/Communications"));
const Payments = lazy(() => import("@/pages/Payments"));
const HealthScoreDashboard = lazy(() => import("@/pages/HealthScoreDashboard"));
const Automations = lazy(() => import("@/pages/Automations"));
const Settings = lazy(() => import("@/pages/Settings"));
const Help = lazy(() => import("@/pages/Help"));

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
      <Router>
        <ThemeProvider defaultTheme="system" storageKey="vite-react-theme">
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <BrowserCompatibilityCheck />
              <OfflineDetector />
              <Toaster />
              <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading application...</div>}>
                <Routes>
                  {/* Public diagnostic route */}
                  <Route path="/diagnostic" element={<DiagnosticIndex />} />
                  
                  {/* Authentication routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<SignUp />} />
                  
                  {/* Protected routes with Sentry error boundaries */}
                  <Route path="/clients" element={
                    <ProtectedRoute>
                      <SentryRouteErrorBoundary>
                        <Clients />
                      </SentryRouteErrorBoundary>
                    </ProtectedRoute>
                  } />
                  <Route path="/clients/:id" element={
                    <ProtectedRoute>
                      <SentryRouteErrorBoundary>
                        <ClientDetails />
                      </SentryRouteErrorBoundary>
                    </ProtectedRoute>
                  } />
                  <Route path="/add-client" element={
                    <ProtectedRoute>
                      <SentryRouteErrorBoundary>
                        <AddClient />
                      </SentryRouteErrorBoundary>
                    </ProtectedRoute>
                  } />
                  <Route path="/renewals" element={
                    <ProtectedRoute>
                      <SentryRouteErrorBoundary>
                        <Renewals />
                      </SentryRouteErrorBoundary>
                    </ProtectedRoute>
                  } />
                  <Route path="/communications" element={
                    <ProtectedRoute>
                      <SentryRouteErrorBoundary>
                        <Suspense fallback={<div className="p-4">Loading communications...</div>}>
                          <Communications />
                        </Suspense>
                      </SentryRouteErrorBoundary>
                    </ProtectedRoute>
                  } />
                  <Route path="/payments" element={
                    <ProtectedRoute>
                      <SentryRouteErrorBoundary>
                        <Suspense fallback={<div className="p-4">Loading payments...</div>}>
                          <Payments />
                        </Suspense>
                      </SentryRouteErrorBoundary>
                    </ProtectedRoute>
                  } />
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <SentryRouteErrorBoundary>
                        <Dashboard />
                      </SentryRouteErrorBoundary>
                    </ProtectedRoute>
                  } />
                  <Route path="/health-score" element={
                    <ProtectedRoute>
                      <SentryRouteErrorBoundary>
                        <Suspense fallback={<div className="p-4">Loading health score dashboard...</div>}>
                          <HealthScoreDashboard />
                        </Suspense>
                      </SentryRouteErrorBoundary>
                    </ProtectedRoute>
                  } />
                  <Route path="/automations" element={
                    <ProtectedRoute>
                      <SentryRouteErrorBoundary>
                        <Suspense fallback={<div className="p-4">Loading automations...</div>}>
                          <Automations />
                        </Suspense>
                      </SentryRouteErrorBoundary>
                    </ProtectedRoute>
                  } />
                  <Route path="/settings" element={
                    <ProtectedRoute>
                      <SentryRouteErrorBoundary>
                        <Suspense fallback={<div className="p-4">Loading settings...</div>}>
                          <Settings />
                        </Suspense>
                      </SentryRouteErrorBoundary>
                    </ProtectedRoute>
                  } />
                  <Route path="/help" element={
                    <ProtectedRoute>
                      <SentryRouteErrorBoundary>
                        <Suspense fallback={<div className="p-4">Loading help...</div>}>
                          <Help />
                        </Suspense>
                      </SentryRouteErrorBoundary>
                    </ProtectedRoute>
                  } />
                  
                  {/* Root route */}
                  <Route path="/" element={
                    <ProtectedRoute>
                      <SentryRouteErrorBoundary>
                        <Index />
                      </SentryRouteErrorBoundary>
                    </ProtectedRoute>
                  } />
                  
                  {/* Redirects */}
                  <Route path="/analytics" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/ai-dashboard" element={<Navigate to="/dashboard" replace />} />
                  
                  {/* 404 route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </AuthProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </Router>
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
