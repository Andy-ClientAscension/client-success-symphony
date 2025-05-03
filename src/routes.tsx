
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import SignUp from '@/pages/SignUp';
import Dashboard from '@/pages/Dashboard';
import AuthCallback from '@/pages/AuthCallback';
import NotFound from '@/pages/NotFound';
import ResetPassword from '@/pages/ResetPassword';
import AuthTestingPage from '@/pages/AuthTestingPage';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/auth-callback" element={<AuthCallback />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/auth-testing" element={<AuthTestingPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
