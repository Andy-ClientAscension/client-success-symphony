
import { PreLaunchVerification } from "@/components/PreLaunchVerification";
import { Layout } from "@/components/Layout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";

export default function PreLaunchChecklist() {
  return (
    <Layout>
      <div className="container py-6">
        <h1 className="text-2xl font-semibold mb-6">Pre-Launch Verification</h1>
        
        <ErrorBoundary>
          <Suspense fallback={
            <div className="flex items-center justify-center p-12">
              <Spinner size="lg" />
              <span className="ml-2">Loading verification tools...</span>
            </div>
          }>
            <PreLaunchVerification />
          </Suspense>
        </ErrorBoundary>
      </div>
    </Layout>
  );
}
