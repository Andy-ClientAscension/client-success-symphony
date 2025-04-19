
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState, Suspense } from "react";
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
import { logStartupPhase, logDetailedError } from "@/utils/errorHandling";
import DiagnosticIndex from "./pages/DiagnosticIndex";
import { enhancedStorage } from "@/utils/storageUtils";

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

logStartupPhase("App.tsx: Module loading started");

logStartupPhase("App.tsx: Creating QueryClient");
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
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncReady, setSyncReady] = useState(false);
  const [useDiagnosticMode, setUseDiagnosticMode] = useState(true);
  const [storageIssue, setStorageIssue] = useState(false);
  
  logStartupPhase("App component initial state", { isOnline, syncReady, useDiagnosticMode, storageIssue });

  useEffect(() => {
    logStartupPhase("App useEffect running - initializing network and sync");
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
      logStartupPhase("Initializing data sync");
      try {
        // Test localStorage access
        try {
          enhancedStorage.setItem('storageTest', 'test');
          const testValue = enhancedStorage.getItem('storageTest');
          if (testValue !== 'test') {
            console.warn("localStorage test failed - falling back to memory storage");
            setStorageIssue(true);
          }
          enhancedStorage.removeItem('storageTest');
        } catch (error) {
          console.warn("localStorage test failed with error:", error);
          setStorageIssue(true);
        }
        
        dataSyncService.initializeDataSync();
        dataSyncService.setInterval(20000);
        dataSyncService.manualSync().then(() => {
          logStartupPhase("Initial sync complete");
          setSyncReady(true);
        }).catch(err => {
          logDetailedError(err, "Error during initial sync");
          // Set syncReady to true anyway to avoid hanging
          setSyncReady(true);
        });
      } catch (error) {
        logDetailedError(error, "Fatal error during data sync initialization");
        setSyncReady(true); // Proceed anyway to avoid a blank screen
      }
    } else {
      logStartupPhase("Offline mode - skipping sync");
      setSyncReady(true);
    }

    // Check URL params for diagnostic mode toggle
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('diagnostic')) {
      setUseDiagnosticMode(urlParams.get('diagnostic') !== 'false');
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      dataSyncService.stopAutoSync();
    };
  }, []);

  useEffect(() => {
    // Log diagnostic mode status
    console.log(`Diagnostic mode is ${useDiagnosticMode ? 'ENABLED' : 'DISABLED'}`);
    console.log('To toggle diagnostic mode, use URL parameter: ?diagnostic=true or ?diagnostic=false');
  }, [useDiagnosticMode]);

  logStartupPhase("App syncReady state", syncReady);
  
  if (!syncReady) {
    logStartupPhase("Rendering loading screen");
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-500" />
          <p className="mt-4 text-lg">Initializing dashboard data...</p>
        </div>
      </div>
    );
  }

  logStartupPhase("Rendering full application with router");
  
  return (
    <ErrorBoundary
      customMessage="The application encountered an unexpected error. Please refresh the page or try again later."
    >
      <Router>
        <ThemeProvider defaultTheme="system" storageKey="vite-react-theme">
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <BrowserCompatibilityCheck />
              <OfflineDetector />
              {storageIssue && (
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 fixed top-0 right-0 left-0 z-50">
                  <p className="font-bold">Storage Warning</p>
                  <p>
                    Browser storage quota exceeded. Some data may not persist between sessions.
                    Try clearing your browser storage or using a different browser.
                  </p>
                </div>
              )}
              <Toaster />
              <Suspense fallback={<div>Loading...</div>}>
                <Routes>
                  {/* Diagnostic route first, it can be toggled with ?diagnostic=false in URL */}
                  <Route path="/" element={useDiagnosticMode ? 
                    <ProtectedRoute><DiagnosticIndex /></ProtectedRoute> : 
                    <ProtectedRoute><Index /></ProtectedRoute>} 
                  />
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
              </Suspense>
            </AuthProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </Router>
    </ErrorBoundary>
  );
}

logStartupPhase("App.tsx: Module fully loaded");

export default App;
