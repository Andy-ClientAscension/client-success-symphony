
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; 
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorWithRetryProps {
  error: Error | string;
  onRetry: () => void;
  title?: string;
  isRetrying?: boolean;
  variant?: "default" | "compact" | "inline";
  className?: string;
}

export function ErrorWithRetry({
  error,
  onRetry,
  title = "Error Loading Data",
  isRetrying = false,
  variant = "default",
  className
}: ErrorWithRetryProps) {
  const errorMessage = typeof error === "string" ? error : error.message;
  
  // Compact variant for smaller spaces (metrics, cards)
  if (variant === "compact") {
    return (
      <div className={cn("p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800", className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 mr-2" />
            <p className="text-sm font-medium text-red-800 dark:text-red-200">
              {title}
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRetry}
            disabled={isRetrying}
            className="h-7 px-2"
          >
            {isRetrying ? (
              <RefreshCw className="h-3 w-3 animate-spin" />
            ) : (
              <RefreshCw className="h-3 w-3" />
            )}
            <span className="ml-1">{isRetrying ? "Retrying..." : "Retry"}</span>
          </Button>
        </div>
        <p className="mt-1 text-xs text-red-600 dark:text-red-300 pl-6">
          {errorMessage}
        </p>
      </div>
    );
  }
  
  // Inline variant for table rows or list items
  if (variant === "inline") {
    return (
      <div className={cn("flex items-center justify-between py-2", className)}>
        <div className="flex items-center">
          <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 mr-2" />
          <span className="text-sm text-red-800 dark:text-red-200">{errorMessage}</span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onRetry}
          disabled={isRetrying}
          className="h-7 px-2"
        >
          {isRetrying ? (
            <RefreshCw className="h-3 w-3 animate-spin" />
          ) : (
            <RefreshCw className="h-3 w-3" />
          )}
          <span className="ml-1 sr-only">{isRetrying ? "Retrying..." : "Retry"}</span>
        </Button>
      </div>
    );
  }
  
  // Default variant with full card
  return (
    <Card className={cn("bg-red-50/50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30", className)}>
      <CardContent className="p-5">
        <Alert variant="destructive" className="bg-transparent border-red-200">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle className="mb-2">{title}</AlertTitle>
          <AlertDescription className="flex flex-col">
            <p className="mb-4">{errorMessage}</p>
            <div className="flex items-center">
              <Button 
                onClick={onRetry} 
                disabled={isRetrying}
                variant="outline" 
                className="gap-1"
              >
                {isRetrying ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                {isRetrying ? "Retrying..." : "Retry"}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
