
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useApiRequest } from '@/hooks/use-api-request';
import { getStudents, getStudent, updateStudentNotes } from '@/services/api/student-service';
import { getMetrics, getDashboardMetrics } from '@/services/api/metrics-service';
import { AlertCircle } from 'lucide-react';

export function ApiExample() {
  const { execute: fetchStudents, data: students, isLoading: loadingStudents, error: studentsError } = useApiRequest();
  const { execute: fetchMetrics, data: metrics, isLoading: loadingMetrics, error: metricsError } = useApiRequest();
  const { execute: fetchDashboardMetrics, data: dashboardMetrics, isLoading: loadingDashboardMetrics } = useApiRequest();
  
  const handleFetchStudents = async () => {
    await fetchStudents(() => getStudents({ limit: 10, page: 1 }));
  };
  
  const handleFetchMetrics = async () => {
    await fetchMetrics(() => getMetrics());
  };
  
  const handleFetchDashboardMetrics = async () => {
    await fetchDashboardMetrics(() => getDashboardMetrics());
  };
  
  // Example of updating student notes
  const handleUpdateStudentNotes = async (studentId: string, notes: string) => {
    const { error } = await updateStudentNotes(studentId, notes);
    
    if (!error) {
      // Refresh student list after update
      handleFetchStudents();
    }
  };
  
  return (
    <div className="grid gap-6">
      <h2 className="text-2xl font-bold">API Service Example</h2>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Students</CardTitle>
            <CardDescription>Fetch student data with filters</CardDescription>
          </CardHeader>
          <CardContent>
            {studentsError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{studentsError.message}</AlertDescription>
              </Alert>
            )}
            
            {loadingStudents ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : students?.data ? (
              <div className="space-y-2">
                <p>Total: {students.count}</p>
                <ul className="list-disc list-inside">
                  {students.data.slice(0, 5).map(student => (
                    <li key={student.id}>{student.name}</li>
                  ))}
                  {students.data.length > 5 && <li>+ {students.data.length - 5} more</li>}
                </ul>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No students loaded</p>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={handleFetchStudents} disabled={loadingStudents}>
              {loadingStudents ? 'Loading...' : 'Load Students'}
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Metrics</CardTitle>
            <CardDescription>Fetch performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            {metricsError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{metricsError.message}</AlertDescription>
              </Alert>
            )}
            
            {loadingMetrics ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : metrics ? (
              <div className="space-y-2">
                <ul className="list-disc list-inside">
                  {metrics.map(metric => (
                    <li key={metric.id}>
                      {metric.name}: {metric.value.toFixed(1)}
                      {metric.trend && metric.trend > 0 && ' ↑'}
                      {metric.trend && metric.trend < 0 && ' ↓'}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No metrics loaded</p>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={handleFetchMetrics} disabled={loadingMetrics}>
              {loadingMetrics ? 'Loading...' : 'Load Metrics'}
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Dashboard Summary</CardTitle>
            <CardDescription>Fetch aggregated dashboard metrics</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingDashboardMetrics ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : dashboardMetrics ? (
              <div className="space-y-2">
                <p>Active Students: {dashboardMetrics.activeStudents}</p>
                <p>Average NPS: {dashboardMetrics.averageNps.toFixed(1)}</p>
                <p>Retention Rate: {dashboardMetrics.retentionRate.toFixed(1)}%</p>
                <p>Revenue: ${dashboardMetrics.revenue.toFixed(2)}</p>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No dashboard metrics loaded</p>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={handleFetchDashboardMetrics} disabled={loadingDashboardMetrics}>
              {loadingDashboardMetrics ? 'Loading...' : 'Load Dashboard Metrics'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
