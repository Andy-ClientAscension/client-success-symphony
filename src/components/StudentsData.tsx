
import React, { useCallback } from 'react';
import { useApiWithRetry } from '@/hooks/use-api-with-retry';
import { getStudents } from '@/services/api/student-service';
import { DataTableWithRetry } from '@/components/ui/DataTableWithRetry';
import { withSentryErrorBoundary } from '@/components/SentryErrorBoundary';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from "@/lib/utils";

function StudentsDataComponent() {
  const { 
    data, 
    isLoading, 
    error, 
    retry, 
    isRetrying 
  } = useApiWithRetry(
    () => getStudents({ limit: 10, page: 1 }),
    { 
      executeOnMount: true,
      retryOptions: {
        maxRetries: 3,
        initialDelay: 1000,
        showToastOnRetry: true
      }
    }
  );

  const handleRetry = useCallback(() => {
    retry();
  }, [retry]);

  // Enhanced columns with proper ARIA labels and descriptions
  const columns = [
    {
      id: 'name',
      header: 'Name',
      cell: (student: any) => <span className="font-medium">{student.name}</span>
    },
    {
      id: 'status',
      header: 'Status',
      cell: (student: any) => {
        const statusVariant = 
          student.status === 'active' ? 'success' :
          student.status === 'at-risk' ? 'warning' : 'default';
        
        const statusText = student.status.charAt(0).toUpperCase() + student.status.slice(1);
        
        return (
          <Badge 
            variant={statusVariant}
            aria-label={`Status: ${statusText}`}
          >
            {statusText}
          </Badge>
        );
      }
    },
    {
      id: 'team',
      header: 'Team',
      cell: (student: any) => student.team || 'Unassigned'
    },
    {
      id: 'progress',
      header: 'Progress',
      cell: (student: any) => {
        const progress = student.progress || 0;
        const progressColor = 
          progress < 30 ? "bg-red-500" : 
          progress < 70 ? "bg-yellow-500" : 
          "bg-green-500";
          
        return (
          <div 
            className="flex items-center gap-2"
            aria-label={`Progress: ${progress}%`}
            role="meter"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <Progress 
              value={progress} 
              className="h-2"
              indicatorClassName={cn(progressColor)}
            />
            <span className="text-xs w-8 text-right">{progress}%</span>
          </div>
        );
      }
    }
  ];

  return (
    <DataTableWithRetry
      data={data?.data?.data || []}
      columns={columns}
      isLoading={isLoading}
      error={error instanceof Error ? error : error ? new Error(error.message) : null}
      onRetry={handleRetry}
      isRetrying={isRetrying}
      title="Students"
      emptyMessage="No students found"
      aria-label="Students data table"
      aria-busy={isLoading || isRetrying}
      aria-live="polite"
    />
  );
}

// Export the component wrapped with Sentry error boundary
export const StudentsData = withSentryErrorBoundary(StudentsDataComponent, {
  name: 'StudentsData',
});
