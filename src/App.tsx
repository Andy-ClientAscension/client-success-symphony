
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ThemeProvider } from "@/components/ThemeProvider";
import { OfflineDetector } from "@/components/OfflineDetector";
import { BrowserCompatibilityCheck } from "@/components/BrowserCompatibilityCheck";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useEffect } from "react";
import { applyPolyfills } from "@/utils/browserCompatibility";
import Index from "./pages/Index";
import AddClient from "./pages/AddClient";
import Analytics from "./pages/Analytics";
import Communications from "./pages/Communications";
import Help from "./pages/Help";
import Renewals from "./pages/Renewals";
import Payments from "./pages/Payments";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";

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
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <ErrorBoundary>
            <Toaster />
            <Sonner />
            <OfflineDetector />
            <BrowserCompatibilityCheck />
            <BrowserRouter>
              <AuthProvider>
                <Routes>
                  {/* Public route */}
                  <Route path="/login" element={<Login />} />
                
                  {/* Protected routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/" element={<Index />} />
                    <Route path="/add-client" element={<AddClient />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/communications" element={<Communications />} />
                    <Route path="/renewals" element={<Renewals />} />
                    <Route path="/payments" element={<Payments />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/help" element={<Help />} />
                  </Route>
                
                  {/* Catch-all route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </AuthProvider>
            </BrowserRouter>
          </ErrorBoundary>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
