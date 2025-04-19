import React from 'react';
import { Navigate } from 'react-router-dom';
import DiagnosticIndex from './pages/DiagnosticIndex';
import Index from './pages/Index'; // Ensure correct import with capital I
import { ProtectedRoute } from "@/components/ProtectedRoute";

// This file provides alternative routes for diagnostic purposes
export const routes = [
  {
    path: '/',
    // Comment out the protected route temporarily for diagnostic purposes
    // element: <ProtectedRoute><Index /></ProtectedRoute>,
    element: <DiagnosticIndex />,
  },
  {
    path: '/dashboard',
    element: <ProtectedRoute><Index /></ProtectedRoute>,
  },
  {
    path: '/login',
    element: <Navigate to="/login" />,
  },
  // Other routes can be defined here
];
