
import { useState, useCallback } from "react";
import { VerificationState } from "@/components/prelaunch/types";
import { toast } from "@/hooks/use-toast";

export interface VerificationHandler {
  verifyFn: () => Promise<any>;
  processResults: (results: any) => { 
    status: "completed" | "failed";
    results: any[];
    issues: string[];
  };
}

export function useVerification(
  initialState: VerificationState,
  handler: VerificationHandler
) {
  const [state, setState] = useState<VerificationState>(initialState);

  const runVerification = useCallback(async () => {
    setState(prev => ({ ...prev, status: "running", progress: 20 }));
    
    try {
      const results = await handler.verifyFn();
      const processed = handler.processResults(results);
      
      setState({
        status: processed.status,
        progress: 100,
        results: processed.results,
        issues: processed.issues
      });
      
      return processed;
    } catch (error) {
      setState({
        status: "failed",
        progress: 100,
        results: [],
        issues: [error instanceof Error ? error.message : "Unknown error"]
      });
      
      toast({
        title: "Verification Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred during verification",
        variant: "destructive"
      });
      
      return { status: "failed" as const, results: [], issues: [error instanceof Error ? error.message : "Unknown error"] };
    }
  }, [handler]);

  const resetVerification = useCallback(() => {
    setState({ status: "pending", progress: 0, results: [], issues: [] });
  }, []);

  return {
    state,
    runVerification,
    resetVerification
  };
}
