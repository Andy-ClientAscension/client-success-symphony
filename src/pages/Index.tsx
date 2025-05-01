
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from "@/components/Layout/Layout";
import { useAuth } from "@/hooks/use-auth";
import { LoadingState } from "@/components/LoadingState";

export default function Index() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  
  useEffect(() => {
    // Only redirect after auth state is confirmed
    if (!isLoading) {
      if (isAuthenticated) {
        // Redirect authenticated users to dashboard
        navigate('/dashboard', { replace: true });
      } else {
        // Redirect unauthenticated users to login
        navigate('/login', { replace: true });
      }
    }
  }, [navigate, isAuthenticated, isLoading]);
  
  if (isLoading) {
    return (
      <Layout>
        <LoadingState message="Initializing application..." />
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="flex items-center justify-center h-screen">
        <p>Redirecting...</p>
      </div>
    </Layout>
  );
}
