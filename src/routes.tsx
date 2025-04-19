
import React from 'react';
import { Navigate } from 'react-router-dom';
import DiagnosticIndex from './pages/DiagnosticIndex';
import Index from './pages/Index';
import { ProtectedRoute } from "@/components/ProtectedRoute";

// This file provides alternative routes for diagnostic purposes
export const routes = [
  {
    path: '/',
    // Uncomment the line below and comment the line above it to switch back to diagnostic mode
    element: <ProtectedRoute><Index /></ProtectedRoute>,
    // element: <ProtectedRoute><DiagnosticIndex /></ProtectedRoute>,
  },
  // Other routes can be defined here
];
