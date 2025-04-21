
import React from 'react';
import { Navigate } from 'react-router-dom';
import { ErrorBoundary } from "@/components/ErrorBoundary";
import DiagnosticIndex from './pages/DiagnosticIndex';
import Index from './pages/Index';
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Login from './pages/Login';
import SignUp from './pages/SignUp';

// Wrapper component for route error handling
const RouteErrorBoundary = ({ children }: { children: React.ReactNode }) => (
  <ErrorBoundary
    customMessage="This page is currently unavailable. Please try again or navigate to another section."
  >
    {children}
  </ErrorBoundary>
);

export const routes = [
  {
    path: '/',
    element: (
      <RouteErrorBoundary>
        <ProtectedRoute><Index /></ProtectedRoute>
      </RouteErrorBoundary>
    ),
  },
  {
    path: '/diagnostic',
    element: <RouteErrorBoundary><DiagnosticIndex /></RouteErrorBoundary>,
  },
  {
    path: '/dashboard',
    element: (
      <RouteErrorBoundary>
        <ProtectedRoute><Index /></ProtectedRoute>
      </RouteErrorBoundary>
    ),
  },
  {
    path: '/login',
    element: <RouteErrorBoundary><Login /></RouteErrorBoundary>,
  },
  {
    path: '/signup',
    element: <RouteErrorBoundary><SignUp /></RouteErrorBoundary>,
  },
];
