
import { Layout } from "@/components/Layout/Layout";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { CriticalLoadingState } from "@/components/CriticalLoadingState";
import type { ReactNode } from "react";
import { useEffect, useState, useRef } from "react";
import { useAuthReducer } from "@/hooks/use-auth-reducer";
import { useToast } from "@/hooks/use-toast";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showLoading, setShowLoading] = useState(false);
  const initialCheckDoneRef = useRef(false);
  const [state, dispatch] = useAuthReducer();
  const navigationAttemptedRef = useRef(false);
  
  // Initial check with a shorter delay to prevent flash
  useEffect(() => {
    if (initialCheckDoneRef.current || navigationAttemptedRef.current) return;
    
    // Very short delay to prevent flash
    const initialCheckTimerId = setTimeout(() => {
      setShowLoading(isLoading && !state.timeoutLevel);
      initialCheckDoneRef.current = true;
    }, 50); // Extremely short delay
    
    return () => {
      clearTimeout(initialCheckTimerId);
    };
  }, [isLoading, state.timeoutLevel]);
  
  // Handle force continue for stuck loading states
  const handleForceContinue = () => {
    console.warn("Auth session loading timeout, forcing continue");
    setShowLoading(false);
    
    toast({
      title: "Loading timeout",
      description: "Loading took longer than expected. Continuing anyway.",
      duration: 3000,
    });
    
    // Mark as completed to avoid stuck states
    dispatch({ type: 'TIMEOUT', level: 3 });
    dispatch({ type: 'PROCESSING_COMPLETE' });
  };
  
  // Emergency navigation for stuck states
  useEffect(() => {
    // Skip if we've already navigated or there's no issue
    if (navigationAttemptedRef.current || (!isLoading && (isAuthenticated || state.timeoutLevel >= 2))) {
      return;
    }
    
    // Emergency navigation after 2.5s if we're still undecided
    const emergencyTimeoutId = setTimeout(() => {
      if (!navigationAttemptedRef.current && (!isAuthenticated || state.timeoutLevel >= 2)) {
        console.warn("DashboardLayout: Emergency redirect to login after timeout");
        navigationAttemptedRef.current = true;
        navigate('/login', { replace: true });
      }
    }, 2500);
    
    return () => {
      clearTimeout(emergencyTimeoutId);
    };
  }, [isAuthenticated, isLoading, state.timeoutLevel, navigate]);
  
  // If authenticated status is known and user is not authenticated, redirect immediately
  if (!isLoading && !isAuthenticated) {
    console.log("User not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }
  
  // Show loading state while checking authentication but only if needed
  if (showLoading && (isLoading || state.status === 'loading')) {
    return (
      <CriticalLoadingState 
        message="Checking authentication..." 
        fallbackAction={handleForceContinue}
        timeout={750}
        isBlocking={false}
      />
    );
  }
  
  // User is authenticated or we've forced continue - proceed to render content
  return <Layout>{children}</Layout>;
}
