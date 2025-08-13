import { useState, useEffect } from 'react';
import { Loader2, Wifi, WifiOff, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SyncIndicatorProps {
  isLoading?: boolean;
  isRefreshing?: boolean;
  isOnline?: boolean;
  lastUpdated?: Date | null;
  onRefresh?: () => void;
  syncStatus?: 'idle' | 'syncing' | 'success' | 'error';
  className?: string;
}

export function SyncIndicator({
  isLoading = false,
  isRefreshing = false,
  isOnline = true,
  lastUpdated,
  onRefresh,
  syncStatus = 'idle',
  className
}: SyncIndicatorProps) {
  const [isVisible, setIsVisible] = useState(false);

  // Show indicator when there's activity
  useEffect(() => {
    if (isLoading || isRefreshing || syncStatus !== 'idle') {
      setIsVisible(true);
    } else {
      // Hide after a brief delay
      const timer = setTimeout(() => setIsVisible(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isRefreshing, syncStatus]);

  const formatLastUpdated = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just updated';
    if (diffInMinutes < 60) return `Updated ${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `Updated ${Math.floor(diffInMinutes / 60)}h ago`;
    return `Updated ${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getSyncIcon = () => {
    if (!isOnline) return WifiOff;
    if (isLoading || isRefreshing) return RefreshCw;
    if (syncStatus === 'success') return CheckCircle;
    if (syncStatus === 'error') return AlertTriangle;
    return Wifi;
  };

  const getSyncColor = () => {
    if (!isOnline || syncStatus === 'error') return 'text-red-500';
    if (syncStatus === 'success') return 'text-green-500';
    if (isLoading || isRefreshing) return 'text-blue-500';
    return 'text-muted-foreground';
  };

  const getSyncMessage = () => {
    if (!isOnline) return 'Offline';
    if (isLoading) return 'Loading...';
    if (isRefreshing) return 'Syncing...';
    if (syncStatus === 'success') return 'Synced';
    if (syncStatus === 'error') return 'Sync failed';
    return 'Online';
  };

  const Icon = getSyncIcon();

  if (!isVisible && syncStatus === 'idle' && !isLoading && !isRefreshing) {
    return null;
  }

  return (
    <div className={cn("flex items-center gap-2 text-xs", className)}>
      <div className="flex items-center gap-1">
        <Icon 
          className={cn(
            "h-3 w-3",
            getSyncColor(),
            (isLoading || isRefreshing) && "animate-spin"
          )} 
        />
        <span className={getSyncColor()}>
          {getSyncMessage()}
        </span>
      </div>
      
      {lastUpdated && !isLoading && !isRefreshing && (
        <span className="text-muted-foreground">
          {formatLastUpdated(lastUpdated)}
        </span>
      )}
      
      {onRefresh && !isLoading && !isRefreshing && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          className="h-5 px-2 text-xs"
        >
          Refresh
        </Button>
      )}
    </div>
  );
}

interface LoadingStateProps {
  isLoading: boolean;
  message?: string;
  showProgress?: boolean;
  progress?: number;
  className?: string;
  children?: React.ReactNode;
}

export function LoadingState({
  isLoading,
  message = "Loading...",
  showProgress = false,
  progress = 0,
  className,
  children
}: LoadingStateProps) {
  if (!isLoading && children) {
    return <>{children}</>;
  }

  if (!isLoading) {
    return null;
  }

  return (
    <div className={cn("flex flex-col items-center justify-center p-8 space-y-4", className)}>
      <div className="relative">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        {showProgress && (
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
            <div className="w-16 bg-muted rounded-full h-1">
              <div 
                className="bg-primary h-1 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
              />
            </div>
          </div>
        )}
      </div>
      
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">{message}</p>
        {showProgress && (
          <p className="text-xs text-muted-foreground mt-1">
            {Math.round(progress)}% complete
          </p>
        )}
      </div>
    </div>
  );
}

interface SkeletonLoaderProps {
  rows?: number;
  showAvatar?: boolean;
  className?: string;
}

export function SkeletonLoader({ rows = 3, showAvatar = false, className }: SkeletonLoaderProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-center space-x-4">
          {showAvatar && (
            <div className="w-10 h-10 bg-muted rounded-full animate-pulse" />
          )}
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
            <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("p-6 border border-border rounded-lg", className)}>
      <div className="space-y-4">
        <div className="h-4 bg-muted rounded animate-pulse w-1/3" />
        <div className="h-8 bg-muted rounded animate-pulse w-1/2" />
        <div className="space-y-2">
          <div className="h-3 bg-muted rounded animate-pulse w-full" />
          <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
        </div>
      </div>
    </div>
  );
}