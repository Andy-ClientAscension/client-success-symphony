
import React from "react";
import { VerificationCard } from "./VerificationCard";
import { VerificationTabProps } from "./types";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

export function RouteRefreshTab({ state, onActionClick }: VerificationTabProps) {
  return (
    <VerificationCard
      title="Route Refresh"
      description="Verify that forced refreshes work properly on each route"
      status={state.status}
      results={state.results}
      issues={state.issues}
      actionButton={
        state.issues.length > 0 ? (
          <Button size="sm" onClick={onActionClick}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Apply Fixes
          </Button>
        ) : null
      }
    />
  );
}
