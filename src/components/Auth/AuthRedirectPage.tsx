import React, { useEffect, useRef } from 'react';
import { Layout } from "@/components/Layout/Layout";
import { PageLoader } from '@/components/PageTransition/PageLoader';
import { CriticalLoadingState } from '@/components/CriticalLoadingState';
import { useAuthRedirect } from '@/hooks/useAuthRedirect';

interface AuthRedirectPageProps {
  onAuthenticatedPath?: string;
  onUnauthenticatedPath?: string;
  timeoutMs?: number;
}

export function AuthRedirectPage({ 
  onAuthenticatedPath, 
  onUnauthenticatedPath, 
  timeoutMs 
}: AuthRedirectPageProps) {
  const processedUrlRef = useRef(false);
  
  const {
    authCheckComplete,
    checkingToken,
    navigatingTo,
    authState,
    isAuthenticated,
    processUrlToken,
    initializeAuth,
    handleNavigation,
    isProcessing,
    isInitializing,
    shouldShowRedirectMessage,
    redirectTarget
  } = useAuthRedirect({ onAuthenticatedPath, onUnauthenticatedPath, timeoutMs });

  // Process URL token only once
  useEffect(() => {
    if (!processedUrlRef.current) {
      processedUrlRef.current = true;
      processUrlToken();
    }
  }, [processUrlToken]);

  // Initialize auth state
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Handle navigation
  useEffect(() => {
    handleNavigation();
  }, [handleNavigation]);

  // Render appropriate UI state
  if (shouldShowRedirectMessage) {
    const targetName = redirectTarget?.replace('/', '') || 'destination';
    return (
      <Layout>
        <PageLoader message={`Redirecting to ${targetName}`} />
      </Layout>
    );
  }

  if (checkingToken) {
    return (
      <Layout>
        <PageLoader message="Verifying authentication token" />
      </Layout>
    );
  }

  if (isProcessing) {
    return (
      <Layout>
        <PageLoader message={`Checking authentication (${authState})`} />
      </Layout>
    );
  }

  if (isInitializing) {
    return (
      <Layout>
        <CriticalLoadingState 
          message="Initializing authentication" 
          timeout={3000}
          fallbackAction={() => {
            console.log("[AuthRedirectPage] Auth initialization timeout");
            // The useAuthRedirect hook will handle the fallback navigation
          }}
        />
      </Layout>
    );
  }

  // Default loading state
  return (
    <Layout>
      <PageLoader message="Checking authentication status and redirecting" />
    </Layout>
  );
}