
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, WifiOff, ShieldAlert, XCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface AuthErrorProps {
  error?: {
    message: string;
    type?: "network" | "auth" | "validation" | "cors" | "server" | string;
    code?: string;
  } | null;
  onRetry?: () => void;
  onDiagnostic?: () => void;
}

export function AuthErrorDisplay({ error, onRetry, onDiagnostic }: AuthErrorProps) {
  if (!error) return null;

  // Define styling and icons based on error type
  const getErrorConfig = () => {
    switch (error.type) {
      case "network":
        return {
          icon: <WifiOff className="h-5 w-5" />,
          title: "Connection Error",
          className: "bg-amber-50 border-amber-300 text-amber-800",
          showDiagnostic: true,
          showRetry: true,
        };
      case "auth":
        return {
          icon: <ShieldAlert className="h-5 w-5" />,
          title: "Authentication Error",
          className: "bg-red-50 border-red-300 text-red-800",
          showDiagnostic: false,
          showRetry: false,
        };
      case "validation":
        return {
          icon: <XCircle className="h-5 w-5" />,
          title: "Validation Error",
          className: "bg-orange-50 border-orange-300 text-orange-800",
          showDiagnostic: false,
          showRetry: false,
        };
      case "cors":
        return {
          icon: <AlertCircle className="h-5 w-5" />,
          title: "Security Error",
          className: "bg-purple-50 border-purple-300 text-purple-800",
          showDiagnostic: true,
          showRetry: true,
        };
      case "server":
        return {
          icon: <AlertCircle className="h-5 w-5" />,
          title: "Server Error",
          className: "bg-blue-50 border-blue-300 text-blue-800",
          showDiagnostic: true,
          showRetry: true,
        };
      default:
        return {
          icon: <AlertCircle className="h-5 w-5" />,
          title: "Error",
          className: "bg-red-50 border-red-300 text-red-800",
          showDiagnostic: false,
          showRetry: true,
        };
    }
  };

  const { icon, title, className, showDiagnostic, showRetry } = getErrorConfig();

  return (
    <Alert variant="destructive" className={`text-sm py-3 mb-4 ${className}`}>
      <div className="flex items-start">
        <span className="mr-2 mt-0.5">{icon}</span>
        <div className="flex-1">
          <AlertTitle className="mb-1 text-sm font-medium">{title}</AlertTitle>
          <AlertDescription className="text-sm">{error.message}</AlertDescription>
          
          {/* Special cases based on error content */}
          {error.message?.includes('Email not confirmed') && (
            <div className="mt-2 text-xs">
              Please check your inbox (including spam folder) for a verification email.
              <Button 
                variant="link" 
                size="sm" 
                className="p-0 ml-2" 
              >
                Resend Verification Email
              </Button>
            </div>
          )}
          
          {/* Action buttons */}
          {(showRetry || showDiagnostic) && (
            <div className="flex space-x-3 mt-2">
              {showRetry && onRetry && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onRetry}
                  className="h-8 px-2 py-1 text-xs"
                >
                  Try Again
                </Button>
              )}
              {showDiagnostic && onDiagnostic && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onDiagnostic}
                  className="h-8 px-2 py-1 text-xs"
                >
                  Run Diagnostics
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Alert>
  );
}
