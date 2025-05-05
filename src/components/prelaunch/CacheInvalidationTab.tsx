
import React from "react";
import { VerificationCard } from "./VerificationCard";
import { VerificationTabProps } from "./types";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export function CacheInvalidationTab({ state, onActionClick }: VerificationTabProps) {
  return (
    <VerificationCard
      title="Cache Invalidation"
      description="Verify that cache invalidation strategies are properly configured"
      status={state.status}
      results={state.results}
      issues={state.issues}
      actionButton={
        <Button size="sm" onClick={onActionClick}>
          <RefreshCw className="h-4 w-4 mr-1" />
          Force Cache Refresh
        </Button>
      }
    />
  );
}
