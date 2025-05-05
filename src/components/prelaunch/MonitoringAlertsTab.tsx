
import React from "react";
import { VerificationCard } from "./VerificationCard";
import { VerificationTabProps } from "./types";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export function MonitoringAlertsTab({ state, onActionClick }: VerificationTabProps) {
  return (
    <VerificationCard
      title="Monitoring & Alerts"
      description="Verify that monitoring and alert systems are properly configured"
      status={state.status}
      results={state.results}
      issues={state.issues}
      actionButton={
        <Button size="sm" onClick={onActionClick}>
          <AlertCircle className="h-4 w-4 mr-1" />
          Test Alerts
        </Button>
      }
    />
  );
}
