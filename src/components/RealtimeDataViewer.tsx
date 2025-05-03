
import React, { useState } from 'react';
import { useRealtimeData } from '@/hooks/useRealtimeData';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, WifiOff } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface RealtimeDataViewerProps<T> {
  storageKey: string;
  tableName?: string;
  defaultValue: T;
  renderItem: (item: any) => React.ReactNode;
  title: string;
  enableNotifications?: boolean;
}

export function RealtimeDataViewer<T>({
  storageKey,
  tableName,
  defaultValue,
  renderItem,
  title,
  enableNotifications = true
}: RealtimeDataViewerProps<T>) {
  const [data, isLoading, error, refresh] = useRealtimeData<T>(
    storageKey,
    defaultValue,
    {
      tableName,
      enableNotifications
    }
  );

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-center p-4">
          <RefreshCw className="animate-spin mr-2 h-4 w-4" />
          <span>Loading {title}...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-4">
        <Alert variant="destructive">
          <AlertTitle>Error loading {title}</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
          <Button 
            onClick={refresh} 
            variant="outline" 
            size="sm" 
            className="mt-2"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </Alert>
      </Card>
    );
  }

  // Safely handle array or single object data
  const items = Array.isArray(data) ? data : [data];

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <Button 
          onClick={refresh} 
          variant="outline" 
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground">
          No data available
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item: any, index: number) => (
            <div key={item.id || index} className="border rounded-md p-3">
              {renderItem(item)}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
