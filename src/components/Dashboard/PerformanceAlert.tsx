
// PerformanceAlert: Accessible, severity-aware, dynamic ARIA, and clean dismissal flow

import React from "react";
import { Cpu, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cva } from "class-variance-authority";

const alertVariants = cva(
  "transition-all duration-200 animate-in fade-in-50 slide-in-from-top-5",
  {
    variants: {
      severity: {
        info: "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-900/30",
        success: "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900/30",
        warning: "bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-900/30",
        error: "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-900/30",
      },
      iconColor: {
        info: "text-blue-600 dark:text-blue-400",
        success: "text-green-600 dark:text-green-400",
        warning: "text-amber-600 dark:text-amber-400",
        error: "text-red-600 dark:text-red-400",
      },
      titleColor: {
        info: "text-blue-800 dark:text-blue-300",
        success: "text-green-800 dark:text-green-300",
        warning: "text-amber-800 dark:text-amber-300",
        error: "text-red-800 dark:text-red-300",
      },
      textColor: {
        info: "text-blue-700 dark:text-blue-400",
        success: "text-green-700 dark:text-green-400",
        warning: "text-amber-700 dark:text-amber-400",
        error: "text-red-700 dark:text-red-400",
      },
    },
    defaultVariants: {
      severity: "success",
      iconColor: "success",
      titleColor: "success",
      textColor: "success",
    },
  }
);

interface PerformanceAlertProps {
  title?: string;
  message?: string;
  severity?: "info" | "success" | "warning" | "error";
  icon?: React.ReactNode;
  onDismiss?: () => void;
  dismissable?: boolean;
  "data-testid"?: string;
}

export function PerformanceAlert({
  title = "Performance Mode Active",
  message = "Heavy components like the Client List and Kanban Board have been moved to the Clients page to improve dashboard performance.",
  severity = "success",
  icon = <Cpu />,
  onDismiss,
  dismissable = true,
  "data-testid": dataTestId,
}: PerformanceAlertProps) {
  // ARIA
  const ariaSeverity =
    severity === "error"
      ? { role: "alert", "aria-live": "assertive" }
      : { role: "status", "aria-live": "polite" };

  return (
    <Alert
      className={alertVariants({ severity })}
      {...ariaSeverity}
      data-testid={dataTestId}
      tabIndex={0}
    >
      <div className="flex items-start w-full">
        <div className={`shrink-0 h-5 w-5 mt-0.5 mr-2 ${alertVariants({ iconColor: severity })}`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          {title && (
            <AlertTitle className={`font-medium ${alertVariants({ titleColor: severity })}`}>
              {title}
            </AlertTitle>
          )}
          {message && (
            <AlertDescription className={`text-sm mt-1 ${alertVariants({ textColor: severity })}`}>
              {message}
            </AlertDescription>
          )}
        </div>
        {dismissable && onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 rounded-full -mr-1 focus-visible:ring-2 focus-visible:ring-primary"
            onClick={onDismiss}
            aria-label="Dismiss alert"
            tabIndex={0}
          >
            <X className="h-4 w-4 text-muted-foreground" aria-hidden />
            <span className="sr-only">Dismiss alert</span>
          </Button>
        )}
      </div>
    </Alert>
  );
}
