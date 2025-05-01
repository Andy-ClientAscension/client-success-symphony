
import React from 'react';
import { Navigate } from 'react-router-dom';
import { ErrorBoundary } from "@/components/ErrorBoundary";
import DiagnosticIndex from './pages/DiagnosticIndex';
import Index from './pages/Index';
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import { createBrowserRouter } from "react-router-dom";
import Dashboard from './pages/Dashboard';

// Wrapper component for route error handling
const RouteErrorBoundary = ({ children }: { children: React.ReactNode }) => (
  <ErrorBoundary
    customMessage="This page is currently unavailable. Please try again or navigate to another section."
  >
    {children}
  </ErrorBoundary>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <RouteErrorBoundary>
      <Index />
    </RouteErrorBoundary>
  },
  {
    path: "/diagnostic",
    element: <RouteErrorBoundary><DiagnosticIndex /></RouteErrorBoundary>,
  },
  {
    path: "/dashboard",
    element: <RouteErrorBoundary>
      <ProtectedRoute><Dashboard /></ProtectedRoute>
    </RouteErrorBoundary>
  },
  {
    path: "/login",
    element: <RouteErrorBoundary><Login /></RouteErrorBoundary>,
  },
  {
    path: "/signup",
    element: <RouteErrorBoundary><SignUp /></RouteErrorBoundary>,
  },
]);

export default router;
