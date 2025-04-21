import React from 'react';
import { Navigate } from 'react-router-dom';
import DiagnosticIndex from './pages/DiagnosticIndex';
import Index from './pages/Index';
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Login from './pages/Login';
import SignUp from './pages/SignUp';

// This file provides alternative routes for diagnostic purposes
export const routes = [
  {
    path: '/',
    // Change back to the main dashboard
    element: <ProtectedRoute><Index /></ProtectedRoute>,
  },
  {
    path: '/diagnostic',
    // Keep diagnostic index available at a separate route
    element: <DiagnosticIndex />,
  },
  {
    path: '/dashboard',
    element: <ProtectedRoute><Index /></ProtectedRoute>,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/signup',
    element: <SignUp />,
  },
  // Other routes can be defined here
];
