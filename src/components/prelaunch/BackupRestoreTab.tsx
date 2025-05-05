
import React from "react";
import { VerificationCard } from "./VerificationCard";
import { VerificationTabProps } from "./types";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function BackupRestoreTab({ state, onActionClick }: VerificationTabProps) {
  return (
    <VerificationCard
      title="Backup & Restore"
      description="Verify that backup and restore procedures are working correctly"
      status={state.status}
      results={state.results}
      issues={state.issues}
      actionButton={
        <Button size="sm" onClick={onActionClick}>
          <Download className="h-4 w-4 mr-1" />
          Create Backup
        </Button>
      }
    />
  );
}
