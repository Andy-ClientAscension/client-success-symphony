
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

// Pages
import Index from "@/pages/Index";
import Clients from "@/pages/Clients";
import ClientDetails from "@/pages/ClientDetails";
import AddClient from "@/pages/AddClient";
import Analytics from "@/pages/Analytics";
import Renewals from "@/pages/Renewals";
import Communications from "@/pages/Communications";
import Automations from "@/pages/Automations";
import Payments from "@/pages/Payments";
import Settings from "@/pages/Settings";
import HealthScoreDashboard from "@/pages/HealthScoreDashboard";
import Help from "@/pages/Help";
import Login from "@/pages/Login";
import SignUp from "@/pages/SignUp";
import NotFound from "@/pages/NotFound";
import AIDashboard from "@/pages/AIDashboard";
import UnifiedDashboard from "@/pages/UnifiedDashboard";

// Create a new query client instance with optimized settings for large datasets
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      // Update to use proper React Query v5 options
      gcTime: 10 * 60 * 1000, // 10 minutes instead of keepPreviousData
      refetchOnMount: "always",
    },
  },
});

function App() {
  // We'll keep this state for future use if needed, but won't pass it to OfflineDetector
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

    // Initialize data sync service
    if (navigator.onLine) {
      dataSyncService.initializeDataSync(); // Use initializeDataSync to prevent duplicate initializations
      
      // Set optimal sync interval (20 seconds) to balance real-time updates and performance
      dataSyncService.setInterval(20000);
      
      // Initial sync
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
  );
}

export default App;
