
import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { LoadingState } from "@/components/LoadingState";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ValidationError } from "@/components/ValidationError";
import { useToast } from "@/hooks/use-toast";

interface ProtectedRouteProps {
  children: ReactNode;
}

function ProtectedRouteContent({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const { toast } = useToast();
  
  const { isAuthenticated, isLoading, error, user } = useAuth();
  
  useEffect(() => {
    // Log auth status for debugging
    console.log("ProtectedRoute: Auth check at path", location.pathname, { 
      isAuthenticated, 
      isLoading, 
      userId: user?.id,
      userEmail: user?.email 
    });
    
    // Short delay to ensure auth check is complete
    const timer = setTimeout(() => {
      setIsCheckingAuth(false);
    }, 500);
    
    return () => {
      clearTimeout(timer);
    };
  }, [location.pathname, isAuthenticated, isLoading, user]);
  
  // Show loading state while checking authentication
  if (isLoading || isCheckingAuth) {
    return <LoadingState message="Checking authentication..." />;
  }
  
  // Show error if there's an authentication error
  if (error && error.message && !error.message.includes('offline') && !error.message.includes('network')) {
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
    // Use a flag to prevent multiple toast displays
    if (!sessionStorage.getItem('auth_redirect_notified')) {
      sessionStorage.setItem('auth_redirect_notified', 'true');
      toast({
        title: "Authentication Required",
        description: "Please log in to access this page.",
        variant: "destructive"
      });
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
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
        </div>
      }
    >
      <ProtectedRouteContent>{children}</ProtectedRouteContent>
    </ErrorBoundary>
  );
}
