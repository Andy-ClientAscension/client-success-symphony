
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MetricErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
  className?: string;
}

export function MetricErrorFallback({
  error,
  resetErrorBoundary,
  className
}: MetricErrorFallbackProps) {
  return (
    <Card className={cn("bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800", className)}>
      <CardContent className="p-4 flex flex-col items-center justify-center text-center">
        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mb-2" />
        <p className="text-sm font-medium text-red-800 dark:text-red-200">Metric Unavailable</p>
        <p className="text-xs text-red-600 dark:text-red-300 mt-1">
          {error.message || "Failed to load metric data"}
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={resetErrorBoundary}
          className="mt-2 text-xs h-7 px-2"
        >
          Retry
        </Button>
      </CardContent>
    </Card>
  );
}
