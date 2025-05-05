
import { Layout } from "@/components/Layout/Layout";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { CriticalLoadingState } from "@/components/CriticalLoadingState";
import type { ReactNode } from "react";
import { useEffect, useState, useCallback, useRef } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const [showLoading, setShowLoading] = useState(true);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const initialCheckDoneRef = useRef(false);
  
  // Initial check with a short delay to prevent flash
  useEffect(() => {
    if (initialCheckDoneRef.current) return;
    
    // Very short delay to prevent flash
    const initialTimer = setTimeout(() => {
      setShowLoading(isLoading);
      initialCheckDoneRef.current = true;
    }, 50);
    
    // Safety timeout to prevent infinite loading - reduced to 2s
    const timeoutTimer = setTimeout(() => {
      if (isLoading) {
        console.warn("Authentication check taking too long, showing timeout");
        setLoadingTimeout(true);
      }
    }, 2000);
    
    return () => {
      clearTimeout(initialTimer);
      clearTimeout(timeoutTimer);
    };
  }, [isLoading]);
  
  // Handle session loading timeouts by continuing anyway
  const handleSessionTimeout = useCallback(() => {
    console.warn("Auth session loading timeout, forcing continue");
    setShowLoading(false);
  }, []);
  
  // Force navigation after a short delay if still loading
  useEffect(() => {
    if (showLoading) {
      const forceTimeout = setTimeout(() => {
        console.warn("Forcing DashboardLayout loading to complete");
        setShowLoading(false);
      }, 2000); // Forced completion after 2 seconds
      
      return () => clearTimeout(forceTimeout);
    }
  }, [showLoading]);
  
  // Show loading state while checking authentication
  if (showLoading && isLoading) {
    return (
      <CriticalLoadingState 
        message="Checking authentication..." 
        fallbackAction={loadingTimeout ? handleSessionTimeout : undefined}
        timeout={2000} // Reduced from 5000ms
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
