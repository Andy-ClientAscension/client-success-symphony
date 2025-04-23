
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useStudentHealth } from '@/hooks/use-student-health';
import { HealthScoreIndicator } from './HealthScoreIndicator';
import { HealthScoreTrendChart } from './HealthScoreTrendChart';
import { HealthScoreFactors } from './HealthScoreFactors';
import { RiskAlerts } from './RiskAlerts';
import { ErrorBoundary } from '@/components/ErrorBoundary';

interface StudentHealthDashboardProps {
  studentId: string;
  studentName: string;
  className?: string;
}

export function StudentHealthDashboard({
  studentId,
  studentName,
  className
}: StudentHealthDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const { 
    healthData, 
    isLoading, 
    error, 
    loadHealthData 
  } = useStudentHealth(studentId, { autoUpdateFromNotes: true });
  
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Student Health Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-12">
            <div className="animate-pulse text-center">
              <div className="h-8 w-24 bg-gray-200 rounded mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading health data...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (error || !healthData) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Student Health Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-red-500 mb-2">Failed to load health data</p>
            <Button 
              variant="outline" 
              onClick={() => loadHealthData()}
              className="mt-2"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={className}>
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{studentName}'s Health Score</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Last updated: {format(parseISO(healthData.lastUpdated), 'MMM d, yyyy h:mm a')}
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => loadHealthData()}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="risks">Risks</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <ErrorBoundary>
                  <HealthScoreIndicator 
                    score={healthData.currentScore} 
                    size="lg"
                  />
                </ErrorBoundary>
              </div>
              <div className="md:col-span-2">
                <ErrorBoundary>
                  <HealthScoreFactors 
                    factors={healthData.factors} 
                  />
                </ErrorBoundary>
              </div>
            </div>
            
            <ErrorBoundary>
              <HealthScoreTrendChart 
                history={healthData.history} 
                trends={healthData.trends}
              />
            </ErrorBoundary>
          </TabsContent>
          
          <TabsContent value="trends">
            <div className="space-y-6">
              <ErrorBoundary>
                <HealthScoreTrendChart 
                  history={healthData.history} 
                  trends={healthData.trends}
                />
              </ErrorBoundary>
              
              <div className="bg-gray-50 p-6 rounded-lg border">
                <h3 className="font-medium mb-4">Health Score Timeline</h3>
                <div className="space-y-4 max-h-[400px] overflow-y-auto">
                  {healthData.history.slice(0, 20).map((entry, index) => (
                    <div 
                      key={entry.date} 
                      className="flex items-center justify-between border-b pb-2 last:border-0"
                    >
                      <div>
                        <div className="font-medium">
                          {format(parseISO(entry.date), 'MMM d, yyyy')}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(parseISO(entry.date), 'h:mm a')}
                        </div>
                      </div>
                      <div className={cn(
                        "text-lg font-bold",
                        entry.score >= 80 ? "text-green-600" :
                        entry.score >= 60 ? "text-yellow-600" :
                        entry.score >= 30 ? "text-orange-600" :
                        "text-red-600"
                      )}>
                        {entry.score}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="risks">
            <ErrorBoundary>
              <RiskAlerts healthData={healthData} />
            </ErrorBoundary>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
