import React from 'react';
import { AuthRedirectPage } from '@/components/Auth/AuthRedirectPage';

// This is the landing page that redirects based on auth state
export default function Index() {
  return (
    <AuthRedirectPage 
      onAuthenticatedPath="/dashboard"
      onUnauthenticatedPath="/login"
      timeoutMs={5000}
    />
  );
}