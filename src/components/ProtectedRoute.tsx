
import { ReactNode, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { LoadingState } from "@/components/LoadingState";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthErrorBoundary } from "@/components/AuthErrorBoundary";
import { ValidationError } from "@/components/ValidationError";
import { useToast } from "@/hooks/use-toast";
import { announceToScreenReader, setFocusToElement } from "@/lib/accessibility";
import { useAuthError } from "@/hooks/use-auth-error";
import { preloadPageResources, prefetchRoute } from "@/utils/resourceHints";
import { useAuthStateMachineContext } from '@/contexts/auth-state-machine';
import { useSessionCoordination } from '@/hooks/use-session-coordination';

interface ProtectedRouteProps {
  children: ReactNode;
}

function ProtectedRouteContent({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const { toast } = useToast();
  
  // Get auth state from both legacy and new systems
  const { isAuthenticated: legacyIsAuthenticated, isLoading: legacyIsLoading } = useAuth();
  const { state: authState, processingAuth, isAuthenticated: newIsAuthenticated } = useAuthStateMachineContext();
  const { checkSession, shouldRefreshSession } = useSessionCoordination();
  const [error] = useAuthError();
  
  // Merge authentication state for compatibility during migration
  // Use OR logic to be more permissive during transition
  const isAuthenticated = legacyIsAuthenticated || newIsAuthenticated === true;
  // Use OR logic for loading to be more cautious during transition
  const isLoading = legacyIsLoading || processingAuth || authState === 'initializing';
  
  // Setup preloading resources
  useEffect(() => {
    // Announce authentication check to screen readers
    announceToScreenReader("Verifying authentication status", "polite");
    
    // Preload resources based on current route
    const currentPath = location.pathname.split('/')[1] || 'dashboard';
    preloadPageResources(currentPath);
    
    // Prefetch likely next routes based on current route
    if (currentPath === 'dashboard') {
      prefetchRoute('/clients');
      prefetchRoute('/analytics');
    } else if (currentPath === 'clients') {
      prefetchRoute('/dashboard');
    }
  }, [location.pathname]);
  
  // Single-attempt session check (if needed)
  useEffect(() => {
    // Skip if already authenticated or loading
    if (isAuthenticated || isLoading) return;

    // Skip if we shouldn't refresh
    if (!shouldRefreshSession()) return;
    
    // Wait a tiny bit to avoid race conditions with other auth checks
    const timer = setTimeout(() => {
      if (!isAuthenticated && !isLoading) {
        console.log("[ProtectedRoute] Initiating session check");
        checkSession().catch(err => 
          console.error("[ProtectedRoute] Session check error:", err)
        );
      }
    }, 50);
    
    return () => clearTimeout(timer);
  }, [isAuthenticated, isLoading, checkSession, shouldRefreshSession]);
  
  // When auth status changes, announce to screen readers
  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        announceToScreenReader("Authentication verified, loading content", "polite");
        
        // Set focus to main content area after auth verification
        setTimeout(() => {
          setFocusToElement('main-content', 'main h1');
        }, 100);
      } else {
        announceToScreenReader("Authentication required, redirecting to login", "assertive");
      }
    }
  }, [isAuthenticated, isLoading]);
  
  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <>
        <LoadingState message="Checking authentication..." />
        <div role="status" aria-live="polite" className="sr-only">
          Checking authentication status, please wait
        </div>
      </>
    );
  }
  
  // Show error if there's an authentication error
  if (error && !error.message.includes('offline') && !error.message.includes('network')) {
    const errorMessage = error.message || "Failed to verify authentication status";
    announceToScreenReader(`Authentication error: ${errorMessage}`, "assertive");
    
    return (
      <>
        <ValidationError
          type="error"
          title="Authentication Error"
          message={errorMessage}
          showIcon
        />
        <div role="alert" aria-live="assertive" className="sr-only">
          Authentication error: {errorMessage}
        </div>
      </>
    );
  }
  
  // Redirect if not authenticated
  if (!isAuthenticated) {
    console.log("ProtectedRoute: Not authenticated, redirecting to login");
    // Use a flag to prevent multiple toast displays
    if (!sessionStorage.getItem('auth_redirect_notified')) {
      sessionStorage.setItem('auth_redirect_notified', 'true');
      toast({
        title: "Authentication Required",
        description: "Please log in to access this page.",
        variant: "destructive"
      });
    }
    return (
      <>
        <Navigate to="/login" state={{ from: location }} replace />
        <div role="alert" aria-live="assertive" className="sr-only">
          Authentication required. Redirecting to login page.
        </div>
      </>
    );
  }

  // Clear the notification flag when successfully authenticated
  sessionStorage.removeItem('auth_redirect_notified');
  
  return <>{children}</>;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  return (
    <ErrorBoundary
      fallback={
        <div className="p-4">
          <ValidationError
            type="error"
            title="Authentication Error"
            message="Unable to verify authentication status. Please try refreshing the page."
            showIcon
          />
          <div role="alert" aria-live="assertive" className="sr-only">
            Authentication error. Unable to verify authentication status. Please try refreshing the page.
          </div>
        </div>
      }
    >
      <AuthErrorBoundary>
        <ProtectedRouteContent>{children}</ProtectedRouteContent>
      </AuthErrorBoundary>
    </ErrorBoundary>
  );
}
