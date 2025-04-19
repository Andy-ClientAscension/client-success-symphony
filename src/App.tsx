
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

// Import all the page components
import Index from "@/pages/Index";
import Clients from "@/pages/Clients";
import ClientDetails from "@/pages/ClientDetails";
import AddClient from "@/pages/AddClient";
import Renewals from "@/pages/Renewals";
import Communications from "@/pages/Communications";
import Payments from "@/pages/Payments";
import UnifiedDashboard from "@/pages/UnifiedDashboard";
import HealthScoreDashboard from "@/pages/HealthScoreDashboard";
import Automations from "@/pages/Automations";
import Settings from "@/pages/Settings";
import Help from "@/pages/Help";
import Login from "@/pages/Login";
import SignUp from "@/pages/SignUp";
import NotFound from "@/pages/NotFound";

console.log("App.tsx: Module loading started");

console.log("App.tsx: Creating QueryClient");
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
  console.log("App component rendering");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncReady, setSyncReady] = useState(false);
  
  console.log("App component initial state:", { isOnline, syncReady });

  useEffect(() => {
    console.log("App useEffect running - initializing network and sync");
    const handleOnline = () => {
      console.log("Network is online");
      setIsOnline(true);
      dataSyncService.startAutoSync();
    };
    
    const handleOffline = () => {
      console.log("Network is offline");
      setIsOnline(false);
      dataSyncService.stopAutoSync();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (navigator.onLine) {
      console.log("Initializing data sync");
      dataSyncService.initializeDataSync();
      dataSyncService.setInterval(20000);
      dataSyncService.manualSync().then(() => {
        console.log("Initial sync complete");
        setSyncReady(true);
      }).catch(err => {
        console.error("Error during initial sync:", err);
        // Set syncReady to true anyway to avoid hanging
        setSyncReady(true);
      });
    } else {
      console.log("Offline mode - skipping sync");
      setSyncReady(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      dataSyncService.stopAutoSync();
    };
  }, []);

  console.log("App syncReady state:", syncReady);
  
  if (!syncReady) {
    console.log("Rendering loading screen");
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-500" />
          <p className="mt-4 text-lg">Initializing dashboard data...</p>
        </div>
      </div>
    );
  }

  console.log("Rendering full application with router");
  
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

console.log("App.tsx: Module fully loaded");

export default App;
