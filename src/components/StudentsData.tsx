
import React from 'react';
import { useApi } from '@/hooks/use-api';
import { getStudents } from '@/services/api/student-service';
import { Skeleton } from '@/components/ui/skeleton';
import { DashboardErrorAlert } from '@/components/Dashboard/DashboardErrorAlert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { withSentryErrorBoundary } from '@/components/SentryErrorBoundary';
import { captureException } from '@/utils/sentry/config';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ReloadIcon } from '@radix-ui/react-icons';

function StudentsDataComponent() {
  const { data, isLoading, error, execute } = useApi(
    () => getStudents({ limit: 10, page: 1 }),
    { executeOnMount: true }
  );

  const [retryCount, setRetryCount] = React.useState(0);

  // Report error to Sentry manually if needed
  React.useEffect(() => {
    if (error) {
      captureException(error, { 
        source: 'StudentsData', 
        context: 'data loading',
        extra: { retryCount }
      });
    }
  }, [error, retryCount]);

  const handleRetry = React.useCallback(() => {
    setRetryCount(prev => prev + 1);
    execute();
  }, [execute]);

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Students</span>
            <button 
              onClick={handleRetry} 
              className="text-sm text-blue-500 hover:text-blue-700 flex items-center gap-1"
              disabled={isLoading}
            >
              {isLoading ? <ReloadIcon className="animate-spin h-4 w-4 mr-1" /> : null}
              {isLoading ? 'Retrying...' : 'Retry'}
            </button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error.message || "Failed to load student data"}</AlertDescription>
          </Alert>
          <DashboardErrorAlert error={new Error(error.message)} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Students</span>
          <button 
            onClick={() => execute()} 
            className="text-sm text-blue-500 hover:text-blue-700 flex items-center gap-1"
            disabled={isLoading}
          >
            {isLoading ? <ReloadIcon className="animate-spin h-4 w-4 mr-1" /> : null}
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        ) : data?.data?.data?.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Progress</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.data.map(student => (
                <TableRow key={student.id}>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.status}</TableCell>
                  <TableCell>{student.team || 'Unassigned'}</TableCell>
                  <TableCell>{student.progress || 0}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No students found
          </div>
        )}
        
        <div className="mt-4 text-sm text-muted-foreground">
          {data?.data?.count ? `Showing ${data.data.data?.length || 0} of ${data.data.count} students` : ''}
        </div>
      </CardContent>
    </Card>
  );
}

// Export the component wrapped with Sentry error boundary
export const StudentsData = withSentryErrorBoundary(StudentsDataComponent, {
  name: 'StudentsData',
});
