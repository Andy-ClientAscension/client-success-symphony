
import React, { Suspense, lazy, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoadingState } from '@/components/LoadingState';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AuthProvider } from '@/contexts/auth';

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
const SSCCapacityPage = lazy(() => import('@/pages/SSCCapacityPage').then(m => ({ default: m.SSCCapacityPage })));
const AdminPanel = lazy(() => import('@/pages/AdminPanel'));

// Optimized loading fallback for faster navigation
const PageLoader = () => (
  <div className="flex items-center justify-center h-screen">
    <LoadingState message="Loading..." />
  </div>
);

export default function AppRoutes() {
  return (
    <AuthProvider>
      <Suspense fallback={<PageLoader />}>
        <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/auth-callback" element={<AuthCallback />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/auth-testing" element={<AuthTestingPage />} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/UnifiedDashboard" element={<ProtectedRoute><UnifiedDashboard /></ProtectedRoute>} />
        <Route path="/ai-dashboard" element={<ProtectedRoute><AIDashboard /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
        <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
        <Route path="/renewals" element={<ProtectedRoute><Renewals /></ProtectedRoute>} />
        <Route path="/health-score-dashboard" element={<ProtectedRoute><HealthScoreDashboard /></ProtectedRoute>} />
        <Route path="/communications" element={<ProtectedRoute><Communications /></ProtectedRoute>} />
        <Route path="/payments" element={<ProtectedRoute><Payments /></ProtectedRoute>} />
        <Route path="/automations" element={<ProtectedRoute><Automations /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/ssc-capacity" element={<ProtectedRoute><SSCCapacityPage /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
        <Route path="/pre-launch" element={<ProtectedRoute><PreLaunchChecklist /></ProtectedRoute>} />
        <Route path="/system-audit" element={<ProtectedRoute><SystemAudit /></ProtectedRoute>} />
        
        {/* Legal Pages */}
        <Route path="/privacy" element={
          <Suspense fallback={<PageLoader />}>
            {React.createElement(lazy(() => import('@/pages/PrivacyPolicy')))}
          </Suspense>
        } />
        <Route path="/terms" element={
          <Suspense fallback={<PageLoader />}>
            {React.createElement(lazy(() => import('@/pages/TermsOfService')))}
          </Suspense>
        } />
        
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}

// Function to prefetch routes for use in navigation components
export function usePrefetchRoutes() {
  const prefetchInProgress = new Set<string>();
  
  const prefetchRoute = useCallback((route: string) => {
    // Prevent recursive prefetching
    if (prefetchInProgress.has(route)) {
      console.log(`🔍 [PrefetchRoutes] Skipping ${route} - already in progress`);
      return;
    }
    
    prefetchInProgress.add(route);
    
    // Create a link rel=prefetch for the JavaScript bundle
    const prefetchLink = document.createElement('link');
    prefetchLink.rel = 'prefetch';
    prefetchLink.as = 'script';
    
    switch (route) {
      case '/dashboard':
        prefetchLink.href = '/src/pages/Dashboard.tsx';
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
        prefetchInProgress.delete(route);
      }, 10000);
    } else {
      prefetchInProgress.delete(route);
    }
  }, []);

  return { prefetchRoute };
}
