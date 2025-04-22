import { ReactNode, useEffect } from "react";
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
  const { isAuthenticated, isLoading, error } = useAuth();
  
  useEffect(() => {
    console.log("ProtectedRoute: Mount effect at path", location.pathname);
    return () => {
      console.log("ProtectedRoute: Unmount effect from path", location.pathname);
    };
  }, [location.pathname]);
  
  if (isLoading) {
    return <LoadingState message="Checking authentication..." />;
  }
  
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
  
  if (!isAuthenticated) {
    console.log("ProtectedRoute: Not authenticated, redirecting to login");
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
