
import React, { useState, useEffect } from "react";
import { PerformanceAlert } from "@/components/Dashboard/PerformanceAlert";
import { announceToScreenReader } from "@/lib/accessibility";

interface PerformanceAlertSystemProps {
  performanceMode: boolean;
}

export function PerformanceAlertSystem({ performanceMode }: PerformanceAlertSystemProps) {
  const [showPerformanceAlert, setShowPerformanceAlert] = useState<boolean>(() => {
    const alertDismissed = localStorage.getItem("hidePerformanceAlert") === "true";
    return !alertDismissed;
  });

  useEffect(() => {
    if (performanceMode) {
      const alertDismissed = localStorage.getItem("hidePerformanceAlert") === "true";
      setShowPerformanceAlert(!alertDismissed);
      
      if (!alertDismissed) {
        announceToScreenReader('Performance mode activated. Some heavy components have been moved to improve dashboard speed.', 'polite');
      }
    } else {
      setShowPerformanceAlert(false);
    }
  }, [performanceMode]);

  const handleDismissAlert = () => {
    setShowPerformanceAlert(false);
    localStorage.setItem("hidePerformanceAlert", "true");
    announceToScreenReader('Performance alert dismissed', 'polite');
  };

  if (!showPerformanceAlert || !performanceMode) {
    return null;
  }

  return (
    <PerformanceAlert
      severity="success"
      onDismiss={handleDismissAlert}
      dismissable={true}
      data-testid="performance-alert"
    />
  );
}
