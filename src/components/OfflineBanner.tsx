
import { useState, useEffect } from 'react';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useOfflineSync } from '@/hooks/useOfflineSync';

interface OfflineBannerProps {
  position?: 'top' | 'bottom';
  className?: string;
}

export function OfflineBanner({ 
  position = 'top', 
  className = ''
}: OfflineBannerProps) {
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const { 
    isOnline, 
    isSyncing, 
    pendingOperationsCount,
    triggerSync 
  } = useOfflineSync();
  const [visible, setVisible] = useState(!isOnline);
  
  // Fade out the banner when going online after being offline
  useEffect(() => {
    if (isFirstLoad) {
      setIsFirstLoad(false);
      return;
    }
    
    setVisible(!isOnline);
    
    // If we're going from offline to online, show briefly and then hide
    if (isOnline) {
      const timer = setTimeout(() => {
        setVisible(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, isFirstLoad]);
  
  // Don't render anything if we're online and the banner isn't visible
  if (isOnline && !visible && pendingOperationsCount === 0) return null;
  
  const positionStyles = position === 'top' 
    ? 'top-0 left-0 right-0' 
    : 'bottom-4 left-1/2 transform -translate-x-1/2';
  
  return (
    <div 
      className={`fixed z-50 w-full max-w-md mx-auto transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      } ${positionStyles} ${className}`}
      aria-live="polite"
    >
      <Alert 
        variant={isOnline ? "default" : "destructive"} 
        className={`shadow-lg ${!isOnline ? 'bg-amber-50/95 border-amber-300' : 'bg-green-50/95 border-green-300'}`}
      >
        <div className="flex items-start">
          {isOnline ? (
            <Wifi className="h-5 w-5 text-green-500 mr-2" />
          ) : (
            <WifiOff className="h-5 w-5 text-amber-500 mr-2" />
          )}
          
          <div className="flex-1">
            <AlertTitle>
              {isOnline 
                ? "You're back online" 
                : "You're currently offline"}
            </AlertTitle>
            <AlertDescription>
              {isOnline 
                ? pendingOperationsCount > 0 
                  ? `Syncing ${pendingOperationsCount} pending changes...` 
                  : "All your changes are in sync."
                : "Changes you make will be synced when your connection is restored."}
            </AlertDescription>
            
            {pendingOperationsCount > 0 && isOnline && (
              <Button 
                size="sm" 
                variant="outline" 
                className="mt-2"
                onClick={triggerSync}
                disabled={isSyncing}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${isSyncing ? 'animate-spin' : ''}`} />
                Sync now ({pendingOperationsCount})
              </Button>
            )}
          </div>
        </div>
      </Alert>
    </div>
  );
}
