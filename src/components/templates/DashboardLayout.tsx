
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
  const [showLoading, setShowLoading] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const initialCheckDoneRef = useRef(false);
  
  // Initial check with a shorter delay to prevent flash
  useEffect(() => {
    if (initialCheckDoneRef.current) return;
    
    // Very short delay to prevent flash
    const initialTimer = setTimeout(() => {
      setShowLoading(isLoading);
      initialCheckDoneRef.current = true;
    }, 25); // Reduced from 50ms
    
    // Safety timeout to prevent infinite loading
    const timeoutTimer = setTimeout(() => {
      if (isLoading) {
        console.warn("Authentication check taking too long, showing timeout");
        setLoadingTimeout(true);
      }
    }, 1000); // Reduced from 2000ms for faster feedback
    
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
      }, 1500); // Reduced from 2000ms for faster response
      
      return () => clearTimeout(forceTimeout);
    }
  }, [showLoading]);
  
  // If authenticated status is known and user is not authenticated, redirect immediately
  if (!isLoading && !isAuthenticated) {
    console.log("User not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }
  
  // Show loading state while checking authentication but only if needed
  if (showLoading && isLoading) {
    return (
      <CriticalLoadingState 
        message="Checking authentication..." 
        fallbackAction={loadingTimeout ? handleSessionTimeout : undefined}
        timeout={1000} // Reduced from 2000ms
        isBlocking={false}
      />
    );
  }
  
  // User is authenticated or we've forced continue - proceed to render content
  return <Layout>{children}</Layout>;
}
