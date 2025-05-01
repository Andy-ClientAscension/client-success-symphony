
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from "@/components/ErrorBoundary";
import DiagnosticIndex from './pages/DiagnosticIndex';
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import Index from './pages/Index';

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
        path="/diagnostic"
        element={
          <RouteErrorBoundary>
            <DiagnosticIndex />
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
      
      {/* Root route - handles auth redirects */}
      <Route path="/" element={<Index />} />
      
      {/* 404 route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
