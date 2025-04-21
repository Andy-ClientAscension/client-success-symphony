
import { ReactNode, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { LoadingState } from "@/components/LoadingState";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  
  useEffect(() => {
    console.log("ProtectedRoute: Mount effect at path", location.pathname);
    return () => {
      console.log("ProtectedRoute: Unmount effect from path", location.pathname);
    };
  }, [location.pathname]);
  
  if (isLoading) {
    return <LoadingState message="Checking authentication..." />;
  }
  
  if (!isAuthenticated) {
    console.log("ProtectedRoute: Not authenticated, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
