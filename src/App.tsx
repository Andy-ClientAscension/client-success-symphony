
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ThemeProvider } from "@/components/ThemeProvider";
import { OfflineDetector } from "@/components/OfflineDetector";
import { BrowserCompatibilityCheck } from "@/components/BrowserCompatibilityCheck";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useEffect } from "react";
import { applyPolyfills } from "@/utils/browserCompatibility";

// Import page components
import Login from "@/pages/Login";
import SignUp from "@/pages/SignUp";
import Index from "@/pages/Index";
import AddClient from "@/pages/AddClient";
import ClientDetailsPage from "@/pages/ClientDetails";
import Clients from "@/pages/Clients";
import Analytics from "@/pages/Analytics";
import Communications from "@/pages/Communications";
import Renewals from "@/pages/Renewals";
import Payments from "@/pages/Payments";
import Settings from "@/pages/Settings";
import Help from "@/pages/Help";
import NotFound from "@/pages/NotFound";
import HealthScoreDashboard from "./pages/HealthScoreDashboard";

// Apply polyfills immediately for older browsers
if (typeof window !== 'undefined') {
  applyPolyfills();
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => {
  useEffect(() => {
    // Add support for passive event listeners to improve performance on mobile
    try {
      const opts = Object.defineProperty({}, 'passive', {
        get: function() {
          // This proves the browser supports passive events
          return true;
        }
      });
      window.addEventListener('testPassive', null as any, opts);
      window.removeEventListener('testPassive', null as any, opts);
      console.log("Passive event listeners are supported");
    } catch (e) {
      console.log("Passive event listeners are not supported");
    }
    
    // Log initial route for debugging
    console.log("Initial route:", window.location.pathname);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <ErrorBoundary>
            <Toaster />
            {/* Move Sonner inside ThemeProvider to fix the context error */}
            <Sonner />
            <OfflineDetector />
            <BrowserCompatibilityCheck />
            <BrowserRouter>
              <AuthProvider>
                <div className="min-h-screen overflow-auto">
                  <Routes>
                    {/* Public routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<SignUp />} />
                  
                    {/* Protected routes */}
                    <Route element={<ProtectedRoute />}>
                      <Route path="/" element={<Index />} />
                      <Route path="/add-client" element={<AddClient />} />
                      <Route path="/clients" element={<Clients />} />
                      <Route path="/client/:clientId" element={<ClientDetailsPage />} />
                      <Route path="/analytics" element={<Analytics />} />
                      <Route path="/communications" element={<Communications />} />
                      <Route path="/renewals" element={<Renewals />} />
                      <Route path="/payments" element={<Payments />} />
                      <Route path="/health-scores" element={<HealthScoreDashboard />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/help" element={<Help />} />
                    </Route>
                  
                    {/* Catch-all route */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
              </AuthProvider>
            </BrowserRouter>
          </ErrorBoundary>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
