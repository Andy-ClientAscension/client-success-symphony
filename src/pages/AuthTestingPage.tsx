
import React from 'react';
import { Layout } from "@/components/Layout/Layout";
import { AuthTestingScenarios } from '@/components/auth/AuthTestingScenarios';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function AuthTestingPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <div className="container py-8">
          <h1 className="text-3xl font-bold mb-8">Auth Testing Dashboard</h1>
          <p className="mb-6 text-muted-foreground">
            This dashboard allows you to test various authentication scenarios, including valid and 
            expired magic links, malformed tokens, network failures, and concurrent authentication sessions.
          </p>
          
          <AuthTestingScenarios />
        </div>
      </Layout>
    </ProtectedRoute>
  );
}
