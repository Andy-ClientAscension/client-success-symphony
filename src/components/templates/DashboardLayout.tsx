
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
  const forceTimeoutRef = useRef<number | null>(null);
  const initialCheckTimerRef = useRef<number | null>(null);
  const loadingTimerRef = useRef<number | null>(null);
  
  // Initial check with a shorter delay to prevent flash
  useEffect(() => {
    if (initialCheckDoneRef.current) return;
    
    // Very short delay to prevent flash
    initialCheckTimerRef.current = window.setTimeout(() => {
      setShowLoading(isLoading);
      initialCheckDoneRef.current = true;
    }, 25); // Very short delay
    
    // Safety timeout to prevent infinite loading
    loadingTimerRef.current = window.setTimeout(() => {
      if (isLoading) {
        console.warn("Authentication check taking too long, showing timeout");
        setLoadingTimeout(true);
      }
    }, 750); // Reduced timeout
    
    // Always force continue after 2 seconds max
    forceTimeoutRef.current = window.setTimeout(() => {
      console.warn("Force continuing after max timeout");
      setShowLoading(false);
      initialCheckDoneRef.current = true;
    }, 2000);
    
    return () => {
      if (initialCheckTimerRef.current) {
        clearTimeout(initialCheckTimerRef.current);
        initialCheckTimerRef.current = null;
      }
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
        loadingTimerRef.current = null;
      }
      if (forceTimeoutRef.current) {
        clearTimeout(forceTimeoutRef.current);
        forceTimeoutRef.current = null;
      }
    };
  }, []);
  
  // Handle session loading timeouts by continuing anyway
  const handleSessionTimeout = useCallback(() => {
    console.warn("Auth session loading timeout, forcing continue");
    setShowLoading(false);
  }, []);
  
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
        timeout={750} // Reduced timeout
        isBlocking={false}
      />
    );
  }
  
  // User is authenticated or we've forced continue - proceed to render content
  return <Layout>{children}</Layout>;
}
