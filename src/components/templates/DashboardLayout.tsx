
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
    }, 100); // Reduced from 200ms
    
    // Safety timeout to prevent infinite loading - reduced from 5s to 3s
    const timeoutTimer = setTimeout(() => {
      if (isLoading) {
        console.warn("Authentication check taking too long, showing timeout");
        setLoadingTimeout(true);
      }
    }, 3000);
    
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
  
  // Force navigation after a delay if still loading
  useEffect(() => {
    if (showLoading) {
      const forceTimeout = setTimeout(() => {
        console.warn("Forcing DashboardLayout loading to complete");
        setShowLoading(false);
      }, 4000); // Forced completion after 4 seconds
      
      return () => clearTimeout(forceTimeout);
    }
  }, [showLoading]);
  
  // Show loading state while checking authentication
  if (showLoading) {
    return (
      <CriticalLoadingState 
        message="Checking authentication..." 
        fallbackAction={loadingTimeout ? handleSessionTimeout : undefined}
        timeout={2500} // Reduced from 5000ms
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
