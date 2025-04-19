import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { BrowserCompatibilityCheck } from "@/components/BrowserCompatibilityCheck";
import { OfflineDetector } from "@/components/OfflineDetector";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { dataSyncService } from "@/utils/dataSyncService";
import { RefreshCw } from "lucide-react";

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
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncReady, setSyncReady] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      dataSyncService.startAutoSync();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      dataSyncService.stopAutoSync();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (navigator.onLine) {
      dataSyncService.initializeDataSync();
      dataSyncService.setInterval(20000);
      dataSyncService.manualSync().then(() => {
        setSyncReady(true);
      });
    } else {
      setSyncReady(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      dataSyncService.stopAutoSync();
    };
  }, []);

  if (!syncReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-500" />
          <p className="mt-4 text-lg">Initializing dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary
      customMessage="The application encountered an unexpected error. Please refresh the page."
    >
      <Router>
        <ThemeProvider defaultTheme="system" storageKey="vite-react-theme">
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <BrowserCompatibilityCheck />
              <OfflineDetector />
              <Toaster />
              <Routes>
                <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
                <Route path="/clients/:id" element={<ProtectedRoute><ClientDetails /></ProtectedRoute>} />
                <Route path="/add-client" element={<ProtectedRoute><AddClient /></ProtectedRoute>} />
                <Route path="/renewals" element={<ProtectedRoute><Renewals /></ProtectedRoute>} />
                <Route path="/communications" element={<ProtectedRoute><Communications /></ProtectedRoute>} />
                <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><UnifiedDashboard /></ProtectedRoute>} />
                <Route path="/analytics" element={<Navigate to="/dashboard" replace />} />
                <Route path="/ai-dashboard" element={<Navigate to="/dashboard" replace />} />
                <Route path="/health-score" element={<ProtectedRoute><HealthScoreDashboard /></ProtectedRoute>} />
                <Route path="/automations" element={<ProtectedRoute><Automations /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="/help" element={<ProtectedRoute><Help /></ProtectedRoute>} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
