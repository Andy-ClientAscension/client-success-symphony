import { ReactNode, useEffect, useState, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { LoadingState } from "@/components/LoadingState";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthErrorBoundary } from "@/components/AuthErrorBoundary";
import { ValidationError } from "@/components/ValidationError";
import { useToast } from "@/hooks/use-toast";
import { announceToScreenReader, setFocusToElement } from "@/lib/accessibility";
import { useAuthError } from "@/hooks/use-auth-error";

interface ProtectedRouteProps {
  children: ReactNode;
}

function ProtectedRouteContent({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const { isAuthenticated, isLoading, user, refreshSession } = useAuth();
  const [error] = useAuthError();

  // Setup abort controller for cancelling in-flight requests
  useEffect(() => {
    abortControllerRef.current = new AbortController();
    
    // Short delay to ensure auth check is complete
    const timer = setTimeout(() => {
      setIsCheckingAuth(false);
    }, 500);
    
    // Announce authentication check to screen readers
    announceToScreenReader("Verifying authentication status", "polite");
    
    // Optionally refresh session with cancellation support
    const refreshAuthWithCancellation = async () => {
      if (!isAuthenticated && !isLoading) {
        try {
          // Call refreshSession without arguments as per its type definition
          await refreshSession();
        } catch (err) {
          if (!(err instanceof DOMException && err.name === 'AbortError')) {
            console.error("Error refreshing session:", err);
          }
        }
      }
    };
    
    refreshAuthWithCancellation();
    
    // Log auth status for debugging
    console.log("ProtectedRoute: Auth check at path", location.pathname, { 
      isAuthenticated, 
      isLoading, 
      userId: user?.id,
      userEmail: user?.email 
    });
    
    return () => {
      clearTimeout(timer);
      // Cancel any in-flight requests when component unmounts
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [location.pathname, refreshSession, isAuthenticated, isLoading, user]);
  
  // When auth status changes, announce to screen readers
  useEffect(() => {
    if (!isLoading && !isCheckingAuth) {
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
  }, [isAuthenticated, isLoading, isCheckingAuth]);
  
  // Show loading state while checking authentication
  if (isLoading || isCheckingAuth) {
    return (
      <>
        <LoadingState message="Checking authentication..." />
        <div aria-live="polite" className="sr-only">
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
        <div aria-live="assertive" className="sr-only">
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
        <div aria-live="assertive" className="sr-only">
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
          <div aria-live="assertive" className="sr-only">
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
