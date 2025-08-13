
import React, { Suspense, lazy, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoadingState } from '@/components/LoadingState';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// Lazy load page components
const Index = lazy(() => import('@/pages/Index'));
const Login = lazy(() => import('@/pages/Login'));
const SignUp = lazy(() => import('@/pages/SignUp'));
const UnifiedDashboard = lazy(() => import('@/pages/UnifiedDashboard'));
const AIDashboard = lazy(() => import('@/pages/AIDashboard'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Analytics = lazy(() => import('@/pages/Analytics'));
const Clients = lazy(() => import('@/pages/Clients'));
const Renewals = lazy(() => import('@/pages/Renewals'));
const HealthScoreDashboard = lazy(() => import('@/pages/HealthScoreDashboard'));
const Communications = lazy(() => import('@/pages/Communications'));
const Payments = lazy(() => import('@/pages/Payments'));
const Automations = lazy(() => import('@/pages/Automations'));
const Settings = lazy(() => import('@/pages/Settings'));
const AuthCallback = lazy(() => import('@/pages/AuthCallback'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));
const AuthTestingPage = lazy(() => import('@/pages/AuthTestingPage'));
const PreLaunchChecklist = lazy(() => import('@/pages/PreLaunchChecklist'));
const SystemAudit = lazy(() => import('@/pages/SystemAudit'));

// Loading fallback for Suspense
const PageLoader = () => (
  <div className="flex items-center justify-center h-screen">
    <LoadingState message="Loading page..." showProgress />
  </div>
);

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/UnifiedDashboard" element={<UnifiedDashboard />} />
        <Route path="/ai-dashboard" element={<AIDashboard />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/renewals" element={<Renewals />} />
        <Route path="/health-score-dashboard" element={<HealthScoreDashboard />} />
        <Route path="/communications" element={<Communications />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/automations" element={<Automations />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/pre-launch" element={<PreLaunchChecklist />} />
        <Route path="/system-audit" element={<SystemAudit />} />
        <Route path="/auth-callback" element={<AuthCallback />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/auth-testing" element={<AuthTestingPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

// Function to prefetch routes for use in navigation components
export function usePrefetchRoutes() {
  const prefetchRoute = useCallback((route: string) => {
    // Create a link rel=prefetch for the JavaScript bundle
    const prefetchLink = document.createElement('link');
    prefetchLink.rel = 'prefetch';
    prefetchLink.as = 'script';
    
    switch (route) {
      case '/dashboard':
        prefetchLink.href = '/src/pages/Dashboard.tsx';
        prefetchRoute('/clients'); // Also prefetch clients as it's likely to be visited next
        break;
      case '/analytics':
        prefetchLink.href = '/src/pages/Analytics.tsx';
        break;
      case '/clients':
        prefetchLink.href = '/src/pages/Clients.tsx';
        break;
      case '/renewals':
        prefetchLink.href = '/src/pages/Renewals.tsx';
        break;
      case '/login':
        prefetchLink.href = '/src/pages/Login.tsx';
        break;
      case '/signup':
        prefetchLink.href = '/src/pages/SignUp.tsx';
        break;
      default:
        // Don't create a prefetch link for unknown routes
        return;
    }
    
    // Add the prefetch link if it's not already in the document
    const existingLink = document.querySelector(`link[rel="prefetch"][href="${prefetchLink.href}"]`);
    if (!existingLink) {
      document.head.appendChild(prefetchLink);
      
      // Remove after 10 seconds to keep the DOM clean
      setTimeout(() => {
        if (prefetchLink.parentNode) {
          prefetchLink.parentNode.removeChild(prefetchLink);
        }
      }, 10000);
    }
  }, []);

  return { prefetchRoute };
}
