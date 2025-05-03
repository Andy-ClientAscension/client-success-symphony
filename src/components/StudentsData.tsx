
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

  const columns = [
    {
      id: 'name',
      header: 'Name',
      cell: (student: any) => <span className="font-medium">{student.name}</span>
    },
    {
      id: 'status',
      header: 'Status',
      cell: (student: any) => (
        <Badge variant={
          student.status === 'active' ? 'success' :
          student.status === 'at-risk' ? 'warning' : 'default'
        }>
          {student.status}
        </Badge>
      )
    },
    {
      id: 'team',
      header: 'Team',
      cell: (student: any) => student.team || 'Unassigned'
    },
    {
      id: 'progress',
      header: 'Progress',
      cell: (student: any) => (
        <div className="flex items-center gap-2">
          <Progress 
            value={student.progress || 0} 
            className="h-2"
            indicatorClassName={cn(
              student.progress < 30 ? "bg-red-500" : 
              student.progress < 70 ? "bg-yellow-500" : 
              "bg-green-500"
            )}
          />
          <span className="text-xs w-8 text-right">{student.progress || 0}%</span>
        </div>
      )
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
    />
  );
}

// Export the component wrapped with Sentry error boundary
export const StudentsData = withSentryErrorBoundary(StudentsDataComponent, {
  name: 'StudentsData',
});
