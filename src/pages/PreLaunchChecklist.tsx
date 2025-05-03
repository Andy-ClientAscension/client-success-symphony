
import { PreLaunchVerification } from "@/components/PreLaunchVerification";
import { Layout } from "@/components/Layout";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function PreLaunchChecklist() {
  return (
    <Layout>
      <div className="container py-6">
        <h1 className="text-2xl font-semibold mb-6">Pre-Launch Verification</h1>
        
        <ErrorBoundary>
          <PreLaunchVerification />
        </ErrorBoundary>
      </div>
    </Layout>
  );
}
