
import { Layout } from "@/components/Layout/Layout";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { CriticalLoadingState } from "@/components/CriticalLoadingState";
import type { ReactNode } from "react";
import { useEffect, useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuthStateMachine } from "@/hooks/use-auth-state-machine";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showLoading, setShowLoading] = useState(false);
  const initialCheckDoneRef = useRef(false);
  const { state, timeoutLevel, processingAuth, isAuthenticated: stateMachineAuthenticated } = useAuthStateMachine();
  
  // Merge authentication state between old and new systems for compatibility
  // This allows for a gradual migration to the new state machine
  const effectiveIsAuthenticated = isAuthenticated || stateMachineAuthenticated === true;
  const effectiveIsLoading = isLoading || processingAuth;
  
  // Initial check with a shorter delay to prevent flash
  useEffect(() => {
    if (initialCheckDoneRef.current) return;
    
    // Very short delay to prevent flash
    const initialCheckTimerId = setTimeout(() => {
      setShowLoading(effectiveIsLoading && !timeoutLevel);
      initialCheckDoneRef.current = true;
    }, 50); // Extremely short delay
    
    return () => {
      clearTimeout(initialCheckTimerId);
    };
  }, [effectiveIsLoading, timeoutLevel]);
  
  // Handle force continue for stuck loading states
  const handleForceContinue = () => {
    console.warn("Auth session loading timeout, forcing continue");
    setShowLoading(false);
    
    toast({
      title: "Loading timeout",
      description: "Loading took longer than expected. Continuing anyway.",
      duration: 3000,
    });
  };
  
  // If authenticated status is known and user is not authenticated, redirect immediately
  if (!effectiveIsLoading && !effectiveIsAuthenticated) {
    console.log("User not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }
  
  // Show loading state while checking authentication but only if needed
  if (showLoading && (effectiveIsLoading || state === 'checking_session' || state === 'checking_token')) {
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
