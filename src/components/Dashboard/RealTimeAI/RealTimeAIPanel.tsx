import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useRealtimeAI } from '@/hooks/useRealtimeAI';
import { Client } from '@/lib/data';
import { 
  AlertTriangle, 
  TrendingUp, 
  Brain, 
  Target, 
  RefreshCw, 
  Clock,
  Shield,
  Zap,
  AlertCircle
} from 'lucide-react';

interface RealTimeAIPanelProps {
  clients: Client[];
}

export function RealTimeAIPanel({ clients }: RealTimeAIPanelProps) {
  const [activeTab, setActiveTab] = useState('anomalies');
  const [showAllAnomalies, setShowAllAnomalies] = useState(false);
  
  const {
    anomalies,
    insights,
    isProcessing,
    lastProcessed,
    alertCount,
    processData,
    clearAlerts,
    getCriticalAlerts,
    getRecentInsights,
    stats
  } = useRealtimeAI(clients, {
    enableAnomalyDetection: true,
    enableInsightGeneration: true,
    alertThreshold: 'medium',
    processingInterval: 30000
  });

  const criticalAlerts = getCriticalAlerts();
  const recentInsights = getRecentInsights(24);

  // Group and condense anomalies
  const groupedAnomalies = React.useMemo(() => {
    const groups: { [key: string]: typeof anomalies } = {};
    
    anomalies.forEach(anomaly => {
      const key = `${anomaly.anomalyType}_${anomaly.severity}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(anomaly);
    });

    return Object.entries(groups)
      .map(([key, groupAnomalies]) => ({
        type: groupAnomalies[0].anomalyType,
        severity: groupAnomalies[0].severity,
        count: groupAnomalies.length,
        clients: groupAnomalies.map(a => a.clientName),
        sample: groupAnomalies[0],
        allItems: groupAnomalies
      }))
      .sort((a, b) => {
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return severityOrder[b.severity as keyof typeof severityOrder] - severityOrder[a.severity as keyof typeof severityOrder];
      });
  }, [anomalies]);

  const displayedAnomalies = showAllAnomalies ? groupedAnomalies : groupedAnomalies.slice(0, 5);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getAnomalyIcon = (type: string) => {
    switch (type) {
      case 'revenue_drop': return <TrendingUp className="h-4 w-4" />;
      case 'engagement_decline': return <Target className="h-4 w-4" />;
      case 'payment_delay': return <Clock className="h-4 w-4" />;
      case 'nps_drop': return <AlertCircle className="h-4 w-4" />;
      case 'churn_risk': return <AlertTriangle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            <div>
              <CardTitle className="text-lg">Real-Time AI Analytics</CardTitle>
              <CardDescription>
                AI-powered anomaly detection and predictive insights
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {alertCount > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                {alertCount} alerts
              </Badge>
            )}
            <Button
              onClick={() => {
                processData();
                clearAlerts();
              }}
              disabled={isProcessing}
              size="sm"
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isProcessing ? 'animate-spin' : ''}`} />
              {isProcessing ? 'Processing...' : 'Refresh'}
            </Button>
          </div>
        </div>
        
        {lastProcessed && (
          <div className="text-xs text-muted-foreground">
            Last updated: {lastProcessed.toLocaleTimeString()}
          </div>
        )}
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-destructive">{stats.criticalAnomalies}</div>
            <div className="text-xs text-muted-foreground">Critical Issues</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.totalAnomalies}</div>
            <div className="text-xs text-muted-foreground">Total Anomalies</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{stats.highPriorityInsights}</div>
            <div className="text-xs text-muted-foreground">High Impact Insights</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{Math.round(stats.averageConfidence * 100)}%</div>
            <div className="text-xs text-muted-foreground">Avg Confidence</div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="anomalies" className="relative">
              <Shield className="h-4 w-4 mr-2" />
              Anomalies
              {criticalAlerts.length > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {criticalAlerts.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="insights">
              <Zap className="h-4 w-4 mr-2" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="predictions">
              <Brain className="h-4 w-4 mr-2" />
              Predictions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="anomalies" className="mt-4">
            {anomalies.length === 0 ? (
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertTitle>All Systems Normal</AlertTitle>
                <AlertDescription>
                  No anomalies detected in your client data. Everything looks healthy!
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-3">
                {displayedAnomalies.map((group, index) => (
                  <Alert key={`${group.type}_${group.severity}_${index}`} variant={getSeverityColor(group.severity) as any}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getAnomalyIcon(group.type)}
                        <div className="flex-1">
                          <AlertTitle className="text-sm">
                            {group.type.replace('_', ' ').toUpperCase()}
                            {group.count > 1 && (
                              <Badge variant="outline" className="ml-2 text-xs">
                                {group.count} clients
                              </Badge>
                            )}
                          </AlertTitle>
                          <AlertDescription className="text-xs mt-1">
                            {group.sample.description}
                            {group.count > 1 && (
                              <div className="mt-1 text-xs text-muted-foreground">
                                <strong>Affected:</strong> {group.clients.slice(0, 3).join(', ')}
                                {group.clients.length > 3 && ` and ${group.clients.length - 3} more`}
                              </div>
                            )}
                          </AlertDescription>
                          <div className="text-xs text-muted-foreground mt-2">
                            <strong>Action:</strong> {group.sample.suggestedAction}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge variant={getSeverityColor(group.severity) as any} className="text-xs">
                          {group.severity}
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          {Math.round(group.sample.confidence * 100)}% confident
                        </div>
                      </div>
                    </div>
                  </Alert>
                ))}
                
                {groupedAnomalies.length > 5 && (
                  <div className="flex justify-center pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAllAnomalies(!showAllAnomalies)}
                    >
                      {showAllAnomalies 
                        ? `Show Less (${groupedAnomalies.length - 5} hidden)` 
                        : `Show All ${groupedAnomalies.length} Issue Types`
                      }
                    </Button>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="insights" className="mt-4">
            {insights.length === 0 ? (
              <Alert>
                <Brain className="h-4 w-4" />
                <AlertTitle>Generating Insights</AlertTitle>
                <AlertDescription>
                  AI is analyzing your data. Check back in a moment for intelligent insights.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-3">
                {recentInsights.map((insight) => (
                  <Card key={insight.id} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm">{insight.title}</h4>
                      <Badge variant={getImpactColor(insight.impact) as any} className="text-xs">
                        {insight.impact} impact
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {insight.description}
                    </p>
                    {insight.affectedClients.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        <strong>Affected clients:</strong> {insight.affectedClients.join(', ')}
                      </div>
                    )}
                    <div className="flex justify-between items-center mt-2">
                      <Badge variant="outline" className="text-xs">
                        {insight.type}
                      </Badge>
                      <div className="text-xs text-muted-foreground">
                        {Math.round(insight.confidence * 100)}% confidence
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="predictions" className="mt-4">
            <Alert>
              <Brain className="h-4 w-4" />
              <AlertTitle>Advanced Predictions Coming Soon</AlertTitle>
              <AlertDescription>
                Revenue forecasting, churn prediction models, and growth opportunity scoring will be available in the next update.
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}