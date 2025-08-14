import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WifiOff, Wifi, Download, RefreshCw, Database, Cloud } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OfflineData {
  dashboardData: any;
  clientData: any[];
  lastSync: string;
}

interface OfflineSupportProps {
  children: React.ReactNode;
}

export function OfflineSupport({ children }: OfflineSupportProps) {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [hasOfflineData, setHasOfflineData] = useState(false);
  const [offlineDataAge, setOfflineDataAge] = useState<number>(0);
  const [pendingSync, setPendingSync] = useState(false);
  const { toast } = useToast();

  // Check for cached offline data
  useEffect(() => {
    const checkOfflineData = () => {
      try {
        const cachedData = localStorage.getItem('offline_dashboard_data');
        if (cachedData) {
          const data: OfflineData = JSON.parse(cachedData);
          setHasOfflineData(true);
          
          const lastSync = new Date(data.lastSync);
          const ageInHours = (Date.now() - lastSync.getTime()) / (1000 * 60 * 60);
          setOfflineDataAge(ageInHours);
        }
      } catch (error) {
        console.error('Error checking offline data:', error);
      }
    };

    checkOfflineData();
  }, []);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "Back online",
        description: "Connection restored. Syncing data...",
      });
      // syncPendingData will be called via useEffect dependency
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "You're offline",
        description: "Using cached data. Some features may be limited.",
        variant: "destructive"
      });
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, [toast]);

  // Sync pending data when back online
  const syncPendingData = useCallback(async () => {
    if (!isOnline) return;

    try {
      setPendingSync(true);
      
      // Get pending changes
      const pendingChanges = localStorage.getItem('pending_changes');
      if (pendingChanges) {
        const changes = JSON.parse(pendingChanges);
        
        // Here you would sync the changes to your backend
        console.log('Syncing pending changes:', changes);
        
        // Clear pending changes after successful sync
        localStorage.removeItem('pending_changes');
        
        toast({
          title: "Data synced",
          description: "All pending changes have been synchronized.",
        });
      }
    } catch (error) {
      console.error('Failed to sync pending data:', error);
      toast({
        title: "Sync failed",
        description: "Some changes couldn't be synchronized.",
        variant: "destructive"
      });
    } finally {
      setPendingSync(false);
    }
  }, [isOnline, toast]);

  // Call syncPendingData when coming back online
  useEffect(() => {
    if (isOnline && pendingSync === false) {
      syncPendingData();
    }
  }, [isOnline, syncPendingData, pendingSync]);

  // Cache data for offline use
  const cacheDataForOffline = useCallback((data: any) => {
    try {
      const offlineData: OfflineData = {
        dashboardData: data.dashboard,
        clientData: data.clients || [],
        lastSync: new Date().toISOString()
      };
      
      localStorage.setItem('offline_dashboard_data', JSON.stringify(offlineData));
      setHasOfflineData(true);
      setOfflineDataAge(0);
    } catch (error) {
      console.error('Failed to cache data for offline use:', error);
    }
  }, []);


  // Queue changes for later sync when offline
  const queueChange = useCallback((change: any) => {
    try {
      const pendingChanges = JSON.parse(localStorage.getItem('pending_changes') || '[]');
      pendingChanges.push({
        ...change,
        timestamp: new Date().toISOString(),
        id: Math.random().toString(36).substr(2, 9)
      });
      localStorage.setItem('pending_changes', JSON.stringify(pendingChanges));
    } catch (error) {
      console.error('Failed to queue change:', error);
    }
  }, []);

  // Download data for offline use
  const downloadOfflineData = useCallback(async () => {
    try {
      // In a real app, you'd fetch fresh data here
      const mockData = {
        dashboard: { metrics: 'latest dashboard data' },
        clients: ['client1', 'client2', 'client3']
      };
      
      cacheDataForOffline(mockData);
      
      toast({
        title: "Offline data updated",
        description: "Latest data cached for offline use.",
      });
    } catch (error) {
      console.error('Failed to download offline data:', error);
      toast({
        title: "Download failed",
        description: "Couldn't cache data for offline use.",
        variant: "destructive"
      });
    }
  }, [cacheDataForOffline, toast]);

  return (
    <div className="relative">
      {/* Offline indicator */}
      {!isOnline && (
        <Alert className="mb-4 border-orange-200 bg-orange-50 dark:bg-orange-950/10">
          <WifiOff className="h-4 w-4 text-orange-600" />
          <AlertDescription className="flex items-center justify-between">
            <div>
              <span className="font-medium text-orange-800 dark:text-orange-200">
                You're offline
              </span>
              <span className="text-orange-700 dark:text-orange-300 ml-2">
                {hasOfflineData ? 
                  `Using cached data from ${offlineDataAge < 1 ? 'less than an hour' : `${Math.round(offlineDataAge)} hours`} ago` :
                  'No cached data available'
                }
              </span>
            </div>
            
            {hasOfflineData && (
              <Badge variant="outline" className="border-orange-300 text-orange-700">
                Offline Mode
              </Badge>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Offline data management card */}
      {isOnline && (
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Database className="h-4 w-4" />
              Offline Support
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Wifi className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Online</span>
                </div>
                
                {hasOfflineData && (
                  <div className="text-xs text-muted-foreground">
                    Cached data: {offlineDataAge < 1 ? 'Up to date' : `${Math.round(offlineDataAge)}h old`}
                  </div>
                )}
                
                {pendingSync && (
                  <div className="flex items-center gap-1 text-xs text-blue-600">
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    Syncing...
                  </div>
                )}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={downloadOfflineData}
                disabled={pendingSync}
              >
                <Download className="h-3 w-3 mr-2" />
                Update Offline Data
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {children}
    </div>
  );
}

// Hook for offline-aware data operations
export function useOfflineSupport() {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  const saveOfflineData = useCallback((key: string, data: any) => {
    try {
      localStorage.setItem(`offline_${key}`, JSON.stringify({
        data,
        timestamp: new Date().toISOString()
      }));
    } catch (error) {
      console.error('Failed to save offline data:', error);
    }
  }, []);

  const getOfflineData = useCallback((key: string) => {
    try {
      const stored = localStorage.getItem(`offline_${key}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          data: parsed.data,
          timestamp: new Date(parsed.timestamp),
          age: Date.now() - new Date(parsed.timestamp).getTime()
        };
      }
    } catch (error) {
      console.error('Failed to get offline data:', error);
    }
    return null;
  }, []);

  const queueOfflineAction = useCallback((action: any) => {
    if (!isOnline) {
      try {
        const queue = JSON.parse(localStorage.getItem('offline_action_queue') || '[]');
        queue.push({
          ...action,
          timestamp: new Date().toISOString(),
          id: Math.random().toString(36).substr(2, 9)
        });
        localStorage.setItem('offline_action_queue', JSON.stringify(queue));
        return true;
      } catch (error) {
        console.error('Failed to queue offline action:', error);
        return false;
      }
    }
    return false;
  }, [isOnline]);

  return {
    isOnline,
    saveOfflineData,
    getOfflineData,
    queueOfflineAction
  };
}

// Service Worker registration for advanced offline support
export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('SW registered: ', registration);
      } catch (registrationError) {
        console.log('SW registration failed: ', registrationError);
      }
    });
  }
}