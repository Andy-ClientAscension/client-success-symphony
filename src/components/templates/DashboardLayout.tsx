
import { Layout } from "@/components/Layout/Layout";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { CriticalLoadingState } from "@/components/CriticalLoadingState";
import type { ReactNode } from "react";
import { useEffect, useState, useCallback } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const [showLoading, setShowLoading] = useState(true);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  
  // Only show loading state for a maximum time to prevent infinite loading
  useEffect(() => {
    // Short delay to prevent flash
    const initialTimer = setTimeout(() => {
      setShowLoading(isLoading);
    }, 200);
    
    // Safety timeout to prevent infinite loading - reduced from 8s to 5s
    const timeoutTimer = setTimeout(() => {
      if (isLoading) {
        console.warn("Authentication check taking too long, showing timeout");
        setLoadingTimeout(true);
      }
    }, 5000);
    
    return () => {
      clearTimeout(initialTimer);
      clearTimeout(timeoutTimer);
    };
  }, [isLoading]);
  
  // Handle auth session loading timeouts by continuing anyway
  const handleSessionTimeout = useCallback(() => {
    console.warn("Auth session loading timeout, forcing continue");
    setShowLoading(false);
  }, []);
  
  // Show loading state while checking authentication
  if (showLoading) {
    return (
      <CriticalLoadingState 
        message="Checking authentication..." 
        fallbackAction={loadingTimeout ? handleSessionTimeout : undefined}
        timeout={5000}
        isBlocking={false}
      />
    );
  }
  
  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <Layout>{children}</Layout>;
}
