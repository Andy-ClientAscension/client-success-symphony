
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingState } from "@/components/LoadingState";

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingState message="Checking authentication..." />;
  }
  
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
