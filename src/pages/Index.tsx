
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from "@/components/Layout/Layout";

export default function Index() {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to the dashboard
    navigate('/dashboard');
  }, [navigate]);
  
  return (
    <Layout>
      <div className="flex items-center justify-center h-screen">
        <p>Redirecting to dashboard...</p>
      </div>
    </Layout>
  );
}
