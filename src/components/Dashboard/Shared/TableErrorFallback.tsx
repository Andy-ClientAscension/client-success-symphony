
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TableErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
  className?: string;
}

export function TableErrorFallback({
  error,
  resetErrorBoundary,
  className
}: TableErrorFallbackProps) {
  return (
    <Card className={cn("bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800", className)}>
      <CardContent className="p-6 flex flex-col items-center justify-center text-center">
        <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400 mb-3" />
        <p className="text-base font-medium text-red-800 dark:text-red-200">Table Data Unavailable</p>
        <p className="text-sm text-red-600 dark:text-red-300 mt-2 max-w-md">
          {error.message || "Failed to load table data. Please try again or contact support if the issue persists."}
        </p>
        <Button
          variant="outline"
          onClick={resetErrorBoundary}
          className="mt-4"
        >
          Retry
        </Button>
      </CardContent>
    </Card>
  );
}
