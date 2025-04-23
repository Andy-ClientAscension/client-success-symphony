
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Flag, Info } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

interface RiskAlertsProps {
  healthData: StudentHealth.StudentHealthData;
  className?: string;
}

export function RiskAlerts({ healthData, className }: RiskAlertsProps) {
  const { riskLevel, currentScore, factors, lastUpdated } = healthData;
  
  // Generate alerts based on health data
  const generateAlerts = () => {
    const alerts = [];
    
    // Risk level alert
    if (riskLevel === 'critical' || riskLevel === 'high') {
      alerts.push({
        id: 'risk-level',
        title: `Student at ${riskLevel} risk`,
        description: `Overall health score is ${currentScore}, indicating ${riskLevel} risk.`,
        icon: <AlertTriangle className="h-4 w-4" />,
        severity: 'error'
      });
    }
    
    // Factor-specific alerts
    if (factors.engagement < 30) {
      alerts.push({
        id: 'low-engagement',
        title: 'Low engagement detected',
        description: `Engagement score is ${factors.engagement}, indicating very limited activity.`,
        icon: <Info className="h-4 w-4" />,
        severity: 'warning'
      });
    }
    
    if (factors.progress < 30) {
      alerts.push({
        id: 'low-progress',
        title: 'Progress concerns',
        description: `Progress score is ${factors.progress}, indicating potential roadblocks.`,
        icon: <Info className="h-4 w-4" />,
        severity: 'warning'
      });
    }
    
    if (factors.sentiment < 30) {
      alerts.push({
        id: 'negative-sentiment',
        title: 'Negative sentiment detected',
        description: `Sentiment score is ${factors.sentiment}, indicating dissatisfaction.`,
        icon: <Flag className="h-4 w-4" />,
        severity: 'warning'
      });
    }
    
    if (factors.attendance < 30) {
      alerts.push({
        id: 'poor-attendance',
        title: 'Poor attendance',
        description: `Attendance score is ${factors.attendance}, indicating missed sessions.`,
        icon: <Info className="h-4 w-4" />,
        severity: 'warning'
      });
    }
    
    // Score trend alerts from 30-day trend
    const trend = healthData.trends['30d'];
    if (trend.change < -10) {
      alerts.push({
        id: 'declining-trend',
        title: 'Declining health score trend',
        description: `Health score has decreased by ${Math.abs(trend.change)} points over the last 30 days.`,
        icon: <AlertTriangle className="h-4 w-4" />,
        severity: 'error'
      });
    }
    
    return alerts;
  };
  
  const alerts = generateAlerts();
  
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">Risk Alerts</CardTitle>
          <Badge
            variant="outline"
            className={cn(
              "font-medium",
              riskLevel === 'critical' ? "border-red-500 text-red-500" :
              riskLevel === 'high' ? "border-orange-500 text-orange-500" :
              riskLevel === 'medium' ? "border-yellow-500 text-yellow-500" :
              "border-green-500 text-green-500"
            )}
          >
            {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} Risk
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {alerts.length > 0 ? (
          <div className="space-y-3">
            {alerts.map(alert => (
              <Alert 
                key={alert.id}
                variant={alert.severity === 'error' ? 'destructive' : 'default'}
              >
                {alert.icon}
                <AlertTitle>{alert.title}</AlertTitle>
                <AlertDescription>
                  {alert.description}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <p>No risk alerts detected</p>
            <p className="text-xs mt-2">
              Last updated: {format(parseISO(lastUpdated), 'MMM d, yyyy h:mm a')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
