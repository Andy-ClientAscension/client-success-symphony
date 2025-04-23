
import React from "react";
import { PerformanceAlert } from "@/components/Dashboard/PerformanceAlert";
import { AlertTriangle } from "lucide-react";

interface DashboardErrorAlertProps {
  error: Error | null;
}

export function DashboardErrorAlert({ error }: DashboardErrorAlertProps) {
  if (!error) return null;

  return (
    <PerformanceAlert
      title="AI Analysis Error"
      message={error.message}
      severity="error"
      icon={<AlertTriangle aria-hidden="true" />}
      dismissable={false}
      data-testid="error-alert"
    />
  );
}
