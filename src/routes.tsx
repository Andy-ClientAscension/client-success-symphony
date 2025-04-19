import React from 'react';
import { Navigate } from 'react-router-dom';
import DiagnosticIndex from './pages/DiagnosticIndex';
import Index from './pages/Index';
import { ProtectedRoute } from "@/components/ProtectedRoute";

// This file provides alternative routes for diagnostic purposes
export const routes = [
  {
    path: '/',
    element: <ProtectedRoute><DiagnosticIndex /></ProtectedRoute>,
    // Uncomment the line below and comment out the line above to switch back to the normal Index
    // element: <ProtectedRoute><Index /></ProtectedRoute>,
  },
  // Other routes can be defined here
];
