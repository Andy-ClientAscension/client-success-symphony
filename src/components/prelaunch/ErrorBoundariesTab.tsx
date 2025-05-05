
import React from "react";
import { VerificationCard } from "./VerificationCard";
import { VerificationTabProps } from "./types";

export function ErrorBoundariesTab({ state }: VerificationTabProps) {
  return (
    <VerificationCard
      title="Error Boundaries"
      description="Verify that error boundaries are properly implemented throughout the application"
      status={state.status}
      results={state.results}
      issues={state.issues}
    />
  );
}
