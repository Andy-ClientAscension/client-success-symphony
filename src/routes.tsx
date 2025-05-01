
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from "@/components/ErrorBoundary";
import DiagnosticIndex from './pages/DiagnosticIndex';
import Index from './pages/Index';
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';

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
      <Route
        path="/"
        element={
          <RouteErrorBoundary>
            <Index />
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
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
