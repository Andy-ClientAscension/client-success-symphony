
import React from "react";
import { ErrorBoundary } from "react-error-boundary";
import OptimizedCleanDashboard from "@/components/Dashboard/OptimizedCleanDashboard";

// Error fallback component
function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Dashboard Error</h2>
        <p className="text-muted-foreground">{error.message}</p>
        <button 
          onClick={resetErrorBoundary}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  );
}

export default function UnifiedDashboard(): JSX.Element {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.reload()}>
      <OptimizedCleanDashboard />
    </ErrorBoundary>
  );
}
