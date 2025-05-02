
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { WifiOff, RefreshCw } from "lucide-react";

interface NetworkStatusAlertProps {
  isConnected: boolean;
  onRetryConnection: () => void;
}

export function NetworkStatusAlert({ 
  isConnected, 
  onRetryConnection 
}: NetworkStatusAlertProps) {
  if (isConnected) {
    return null;
  }

  return (
    <Alert variant="destructive" className="text-sm py-2 bg-amber-50 border-amber-300 mb-4">
      <WifiOff className="h-4 w-4" />
      <AlertDescription className="flex justify-between items-center">
        <span>You appear to be offline. Please check your internet connection.</span>
        <Button 
          size="sm" 
          variant="outline"
          onClick={onRetryConnection}
          className="ml-2"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Retry
        </Button>
      </AlertDescription>
    </Alert>
  );
}
