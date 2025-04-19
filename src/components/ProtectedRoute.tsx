
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { LoadingState } from "@/components/LoadingState";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  console.log("ProtectedRoute: Checking authentication...");
  const { isAuthenticated, isLoading } = useAuth();
  
  console.log("ProtectedRoute: isAuthenticated =", isAuthenticated, "isLoading =", isLoading);
  
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
