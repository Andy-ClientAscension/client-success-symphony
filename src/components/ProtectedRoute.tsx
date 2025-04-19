
import { ReactNode, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { LoadingState } from "@/components/LoadingState";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  console.log(`ProtectedRoute: Rendering at path "${location.pathname}"`);
  console.log("ProtectedRoute: Checking authentication...");
  
  const { isAuthenticated, isLoading, user } = useAuth();
  
  console.log("ProtectedRoute: Auth state =", { 
    isAuthenticated, 
    isLoading, 
    user: user ? `User ID: ${user.email}` : 'No user' 
  });
  
  useEffect(() => {
    console.log("ProtectedRoute: Mount effect at path", location.pathname);
    return () => {
      console.log("ProtectedRoute: Unmount effect from path", location.pathname);
    };
  }, [location.pathname]);
  
  if (isLoading) {
    console.log("ProtectedRoute: Auth is loading, showing loading state");
    return <LoadingState message="Checking authentication..." />;
  }
  
  if (!isAuthenticated) {
    console.log("ProtectedRoute: Not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  console.log("ProtectedRoute: Authentication verified, rendering protected content");
  return <>{children}</>;
}
