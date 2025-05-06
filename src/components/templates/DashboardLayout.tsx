
import { Layout } from "@/components/Layout/Layout";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { CriticalLoadingState } from "@/components/CriticalLoadingState";
import type { ReactNode } from "react";
import { useEffect, useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuthStateMachineContext } from '@/contexts/auth-state-machine';
import { useSessionCoordination } from '@/hooks/use-session-coordination';
import { useNavigationTimeout } from '@/hooks/use-navigation-timeout';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { isAuthenticated: legacyIsAuthenticated, isLoading: legacyIsLoading } = useAuth();
  const { toast } = useToast();
  const [showLoading, setShowLoading] = useState(false);
  const initialCheckDoneRef = useRef(false);
  
  // Get data from our properly typed state machine
  const authContext = useAuthStateMachineContext();
  const { 
    state, 
    timeoutLevel, 
    processingAuth, 
    isAuthenticated: stateMachineAuthenticated 
  } = authContext;
  
  const { refreshSession } = useSessionCoordination();
  
  // Use our new navigation timeout hook for loading timeouts
  const { startTimeout, clearTimeout: clearNavTimeout } = useNavigationTimeout({
    delay: 10000, // 10 seconds for dashboard loading
    showToast: true,
    timeoutMessage: 'Loading took longer than expected - redirecting to home page'
  });
  
  // Merge authentication state between old and new systems for compatibility
  // Use OR logic to be more permissive during transition period
  const effectiveIsAuthenticated = legacyIsAuthenticated || stateMachineAuthenticated === true;
  // Use OR logic for loading to ensure we show loading state during transition
  const effectiveIsLoading = legacyIsLoading || processingAuth;
  
  // Initial check with a shorter delay to prevent flash
  useEffect(() => {
    if (initialCheckDoneRef.current) return;
    
    // Very short delay to prevent flash
    const initialCheckTimerId = setTimeout(() => {
      // Only show loading if we're still checking and haven't timed out
      setShowLoading(effectiveIsLoading && timeoutLevel === 0);
      initialCheckDoneRef.current = true;
      
      // If we're not authenticated, try a quick session refresh
      if (!effectiveIsAuthenticated && !effectiveIsLoading) {
        refreshSession().catch(err => 
          console.error("Error refreshing session in DashboardLayout:", err)
        );
      }
      
      // If we're still loading, start a navigation timeout as a fallback
      if (effectiveIsLoading) {
        startTimeout('/', { 
          delay: 7500,
          timeoutMessage: 'Dashboard loading timeout - redirecting to home page'
          // Note: The isCritical property was removed as it's not part of NavigationTimeoutOptions
        });
      }
    }, 50); // Extremely short delay
    
    return () => {
      clearTimeout(initialCheckTimerId);
      // Clear any navigation timeouts
      clearNavTimeout();
    };
  }, [effectiveIsLoading, effectiveIsAuthenticated, timeoutLevel, refreshSession, startTimeout, clearNavTimeout]);
  
  // Clear timeout when loading completes or auth state is determined
  useEffect(() => {
    if (!effectiveIsLoading || effectiveIsAuthenticated !== null) {
      clearNavTimeout();
    }
  }, [effectiveIsLoading, effectiveIsAuthenticated, clearNavTimeout]);
  
  // Handle force continue for stuck loading states
  const handleForceContinue = () => {
    console.warn("Auth session loading timeout, forcing continue");
    setShowLoading(false);
    clearNavTimeout(); // Clear any navigation timeouts
    
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
