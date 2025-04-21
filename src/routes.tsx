
import React from 'react';
import { Navigate } from 'react-router-dom';
import DiagnosticIndex from './pages/DiagnosticIndex';
import Index from './pages/Index';
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Login from './pages/Login';
import SignUp from './pages/SignUp';

export const routes = [
  {
    path: '/',
    element: <ProtectedRoute><Index /></ProtectedRoute>,
  },
  {
    path: '/diagnostic',
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
];
