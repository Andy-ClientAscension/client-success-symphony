
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { BrowserCompatibilityCheck } from "@/components/BrowserCompatibilityCheck";
import { OfflineDetector } from "@/components/OfflineDetector";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Pages
import Index from "@/pages/Index";
import Clients from "@/pages/Clients";
import ClientDetails from "@/pages/ClientDetails";
import AddClient from "@/pages/AddClient";
import Analytics from "@/pages/Analytics";
import AIDashboard from "@/pages/AIDashboard";
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

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <Router>
      <ThemeProvider defaultTheme="system" storageKey="vite-react-theme">
        <AuthProvider>
          <BrowserCompatibilityCheck />
          <OfflineDetector isOnline={isOnline} />
          <Toaster />
          <Routes>
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
            <Route path="/clients/:id" element={<ProtectedRoute><ClientDetails /></ProtectedRoute>} />
            <Route path="/add-client" element={<ProtectedRoute><AddClient /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/ai-dashboard" element={<ProtectedRoute><AIDashboard /></ProtectedRoute>} />
            <Route path="/renewals" element={<ProtectedRoute><Renewals /></ProtectedRoute>} />
            <Route path="/communications" element={<ProtectedRoute><Communications /></ProtectedRoute>} />
            <Route path="/automations" element={<ProtectedRoute><Automations /></ProtectedRoute>} />
            <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/health-score" element={<ProtectedRoute><HealthScoreDashboard /></ProtectedRoute>} />
            <Route path="/help" element={<ProtectedRoute><Help /></ProtectedRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/sign-up" element={<SignUp />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
