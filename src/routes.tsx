
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from "@/components/ErrorBoundary";
import DiagnosticIndex from './pages/DiagnosticIndex';
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import Index from './pages/Index';
import AuthCallback from './pages/AuthCallback';
import Clients from './pages/Clients';
import Renewals from './pages/Renewals';
import Communications from './pages/Communications';
import Payments from './pages/Payments';
import Automations from './pages/Automations';
import HealthScoreDashboard from './pages/HealthScoreDashboard';
import Settings from './pages/Settings';
import Help from './pages/Help';

// Wrapper component for route error handling
const RouteErrorBoundary = ({ children }: { children: React.ReactNode }) => (
  <ErrorBoundary
    customMessage="This page is currently unavailable. Please try again or navigate to another section."
  >
    {children}
  </ErrorBoundary>
);

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          <RouteErrorBoundary>
            <Login />
          </RouteErrorBoundary>
        }
      />
      <Route
        path="/signup"
        element={
          <RouteErrorBoundary>
            <SignUp />
          </RouteErrorBoundary>
        }
      />
      <Route
        path="/reset-password"
        element={
          <RouteErrorBoundary>
            <ResetPassword />
          </RouteErrorBoundary>
        }
      />
      <Route
        path="/diagnostic"
        element={
          <RouteErrorBoundary>
            <DiagnosticIndex />
          </RouteErrorBoundary>
        }
      />
      
      {/* Auth callback route for social login */}
      <Route
        path="/auth/callback"
        element={
          <RouteErrorBoundary>
            <AuthCallback />
          </RouteErrorBoundary>
        }
      />
      
      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <RouteErrorBoundary>
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          </RouteErrorBoundary>
        }
      />
      
      <Route
        path="/clients"
        element={
          <RouteErrorBoundary>
            <ProtectedRoute>
              <Clients />
            </ProtectedRoute>
          </RouteErrorBoundary>
        }
      />
      
      <Route
        path="/renewals"
        element={
          <RouteErrorBoundary>
            <ProtectedRoute>
              <Renewals />
            </ProtectedRoute>
          </RouteErrorBoundary>
        }
      />
      
      <Route
        path="/communications"
        element={
          <RouteErrorBoundary>
            <ProtectedRoute>
              <Communications />
            </ProtectedRoute>
          </RouteErrorBoundary>
        }
      />
      
      <Route
        path="/payments"
        element={
          <RouteErrorBoundary>
            <ProtectedRoute>
              <Payments />
            </ProtectedRoute>
          </RouteErrorBoundary>
        }
      />
      
      <Route
        path="/automations"
        element={
          <RouteErrorBoundary>
            <ProtectedRoute>
              <Automations />
            </ProtectedRoute>
          </RouteErrorBoundary>
        }
      />
      
      <Route
        path="/health-score"
        element={
          <RouteErrorBoundary>
            <ProtectedRoute>
              <HealthScoreDashboard />
            </ProtectedRoute>
          </RouteErrorBoundary>
        }
      />
      
      <Route
        path="/settings"
        element={
          <RouteErrorBoundary>
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          </RouteErrorBoundary>
        }
      />
      
      <Route
        path="/help"
        element={
          <RouteErrorBoundary>
            <ProtectedRoute>
              <Help />
            </ProtectedRoute>
          </RouteErrorBoundary>
        }
      />
      
      {/* Root route - handles auth redirects */}
      <Route path="/" element={<Index />} />
      
      {/* 404 route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
