import React from 'react';
import { Navigate } from 'react-router-dom';

// Direct redirect to dashboard - no auth needed for development
export default function Index() {
  return <Navigate to="/dashboard" replace />;
}