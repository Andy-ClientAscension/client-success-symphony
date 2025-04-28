
import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { LoadingState } from "@/components/LoadingState";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ValidationError } from "@/components/ValidationError";

interface ProtectedRouteProps {
  children: ReactNode;
}

function ProtectedRouteContent({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const [authError, setAuthError] = useState<Error | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  // Try to use the auth context with error handling
  let auth;
  try {
    auth = useAuth();
  } catch (e) {
    console.error("Failed to initialize auth in ProtectedRoute:", e);
    setAuthError(e instanceof Error ? e : new Error("Authentication system unavailable"));
    return (
      <ValidationError
        type="error"
        title="Authentication System Error"
        message={(e instanceof Error ? e.message : "Failed to initialize authentication system") || "Authentication system unavailable"}
        showIcon
      />
    );
  }
  
  const { isAuthenticated, isLoading, error } = auth;
  
  useEffect(() => {
    console.log("ProtectedRoute: Auth check at path", location.pathname, { isAuthenticated, isLoading });
    
    // Short timeout to ensure auth check is complete
    const timer = setTimeout(() => {
      setIsCheckingAuth(false);
    }, 300);
    
    return () => {
      clearTimeout(timer);
      console.log("ProtectedRoute: Unmount effect from path", location.pathname);
    };
  }, [location.pathname, isAuthenticated, isLoading]);
  
  // Show loading state while checking authentication
  if (isLoading || isCheckingAuth) {
    return <LoadingState message="Checking authentication..." />;
  }
  
  // Show error if there's an authentication error
  if (error) {
    return (
      <ValidationError
        type="error"
        title="Authentication Error"
        message={error.message || "Failed to verify authentication status"}
        showIcon
      />
    );
  }
  
  // Redirect if not authenticated
  if (!isAuthenticated) {
    console.log("ProtectedRoute: Not authenticated, redirecting to login");
    // Store the location they were trying to access so we can redirect after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

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
        </div>
      }
    >
      <ProtectedRouteContent>{children}</ProtectedRouteContent>
    </ErrorBoundary>
  );
}
