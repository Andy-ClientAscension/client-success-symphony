import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Clock, 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  Monitor,
  Database,
  Package
} from 'lucide-react';
import { performanceProfiler, checkPerformanceBudgets } from '@/utils/performance/performance-profiler';

interface PerformanceProfilerDashboardProps {
  visible?: boolean;
}

export function PerformanceProfilerDashboard({ visible = false }: PerformanceProfilerDashboardProps) {
  const [isVisible, setIsVisible] = useState(visible);
  const [report, setReport] = useState<any>(null);
  const [budgetCheck, setBudgetCheck] = useState<any>(null);
  const [autoRefresh, setAutoRefresh] = useState(false);

  const generateReport = () => {
    const newReport = performanceProfiler.generateReport();
    const newBudgetCheck = checkPerformanceBudgets();
    setReport(newReport);
    setBudgetCheck(newBudgetCheck);
  };

  useEffect(() => {
    if (isVisible) {
      generateReport();
    }
  }, [isVisible]);

  useEffect(() => {
    if (autoRefresh && isVisible) {
      const interval = setInterval(generateReport, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, isVisible]);

  const getRenderTimeColor = (time: number) => {
    if (time < 8) return 'text-green-600';
    if (time < 16) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getQueryEfficiencyColor = (efficiency: number) => {
    if (efficiency > 70) return 'text-green-600';
    if (efficiency > 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="fixed bottom-20 right-4 z-50"
        onClick={() => setIsVisible(true)}
      >
        <Monitor className="w-4 h-4 mr-1" />
        Profiler
      </Button>
    );
  }

  if (!report) {
    return (
      <Card className="fixed bottom-4 right-4 z-50 w-96">
        <CardContent className="p-4">
          <div className="flex items-center justify-center">
            <RefreshCw className="w-4 h-4 animate-spin mr-2" />
            Generating performance report...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="fixed inset-4 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 rounded-lg border shadow-lg overflow-auto">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Monitor className="w-6 h-6" />
            <h2 className="text-2xl font-bold">Performance Profiler</h2>
            <Badge variant={budgetCheck?.passed ? 'success' : 'destructive'}>
              {budgetCheck?.passed ? 'Within Budget' : 'Budget Exceeded'}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${autoRefresh ? 'animate-spin' : ''}`} />
              Auto {autoRefresh ? 'On' : 'Off'}
            </Button>
            <Button variant="outline" size="sm" onClick={generateReport}>
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsVisible(false)}>
              ×
            </Button>
          </div>
        </div>

        {budgetCheck && budgetCheck.violations.length > 0 && (
          <Alert className="mb-6">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              <strong>Performance Budget Violations:</strong>
              <ul className="list-disc ml-4 mt-2">
                {budgetCheck.violations.map((violation: string, idx: number) => (
                  <li key={idx}>{violation}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                Avg Render Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getRenderTimeColor(report.summary.averageRenderTime || 0)}`}>
                {(report.summary.averageRenderTime || 0).toFixed(2)}ms
              </div>
              <div className="text-xs text-muted-foreground">Target: &lt;16ms</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center">
                <Database className="w-4 h-4 mr-2" />
                Active Queries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{report.summary.totalQueries}</div>
              <div className="text-xs text-muted-foreground">Tracked queries</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center">
                <Package className="w-4 h-4 mr-2" />
                Memory Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              {report.summary.memoryUsage ? (
                <>
                  <div className="text-2xl font-bold">
                    {report.summary.memoryUsage.usagePercentage.toFixed(1)}%
                  </div>
                  <Progress 
                    value={report.summary.memoryUsage.usagePercentage} 
                    className="h-2 mt-2"
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    {(report.summary.memoryUsage.usedJSHeapSize / 1024 / 1024).toFixed(1)}MB used
                  </div>
                </>
              ) : (
                <div className="text-sm text-muted-foreground">Not available</div>
              )}
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="components" className="space-y-4">
          <TabsList>
            <TabsTrigger value="components">Components</TabsTrigger>
            <TabsTrigger value="queries">Queries</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
          </TabsList>

          <TabsContent value="components" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Component Render Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {report.renderProfiles.slice(0, 10).map((profile: any) => (
                    <div key={profile.componentName} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium">{profile.componentName}</div>
                        <div className="text-sm text-muted-foreground">
                          {profile.renderCount} renders • {profile.propsChanges} prop changes
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-medium ${getRenderTimeColor(profile.averageRenderTime)}`}>
                          {profile.averageRenderTime.toFixed(2)}ms
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Last: {profile.lastRenderTime.toFixed(2)}ms
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="queries" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Query Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {report.queryMetrics.slice(0, 10).map((query: any) => {
                    const efficiency = (query.cacheHits / query.totalCalls) * 100;
                    return (
                      <div key={query.queryKey} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <div className="font-medium">{query.queryKey}</div>
                          <div className="text-sm text-muted-foreground">
                            {query.totalCalls} calls • {query.cacheHits} cache hits
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-medium ${getQueryEfficiencyColor(efficiency)}`}>
                            {efficiency.toFixed(1)}% cached
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Avg: {query.averageDuration.toFixed(2)}ms
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {report.recommendations.length > 0 ? (
                    report.recommendations.map((rec: string, idx: number) => (
                      <Alert key={idx}>
                        <Zap className="w-4 h-4" />
                        <AlertDescription>{rec}</AlertDescription>
                      </Alert>
                    ))
                  ) : (
                    <Alert>
                      <CheckCircle className="w-4 h-4" />
                      <AlertDescription>
                        Great! No performance issues detected.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="benchmarks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Benchmarks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {report.benchmarks.length > 0 ? (
                    report.benchmarks.map((benchmark: any) => (
                      <div key={benchmark.name} className="flex items-center justify-between p-3 border rounded">
                        <div>
                          <div className="font-medium">{benchmark.name}</div>
                          {benchmark.metadata && (
                            <div className="text-sm text-muted-foreground">
                              {JSON.stringify(benchmark.metadata)}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            {benchmark.duration?.toFixed(2) || 'Running...'}ms
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      No benchmarks recorded yet
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}