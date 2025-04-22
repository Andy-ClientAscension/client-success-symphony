
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Wifi, WifiOff } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { errorService } from "@/utils/errorService";

export function OfflineDetector() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const { toast } = useToast();

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      toast({
        title: "You're back online",
        description: "Your internet connection has been restored",
        duration: 3000,
      });
    };

    const handleOffline = () => {
      setIsOffline(true);
      errorService.captureMessage("User went offline", {
        severity: "medium",
        context: {
          lastOnline: new Date().toISOString(),
          userAgent: navigator.userAgent
        }
      });
      
      toast({
        title: "You're offline",
        description: "Please check your internet connection",
        variant: "destructive",
        duration: null, // Keep showing until back online
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  if (!isOffline) return null;

  return (
    <Alert variant="destructive" className="fixed bottom-4 right-4 max-w-sm z-50">
      <WifiOff className="h-4 w-4" />
      <AlertTitle>You're offline</AlertTitle>
      <AlertDescription>
        Some features may be unavailable until your connection is restored.
        We'll keep your changes and sync them when you're back online.
      </AlertDescription>
    </Alert>
  );
}
