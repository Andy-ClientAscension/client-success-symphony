import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSystemAudit } from './SystemAuditProvider';
import { ButtonAuditor, LoadingStateAuditor } from '../PageAudit';
import { AlertTriangle, CheckCircle, Clock, Shield, Zap, Database, Navigation, Cpu } from 'lucide-react';

const categoryIcons = {
  database: Database,
  component: Cpu,
  navigation: Navigation,
  functionality: CheckCircle,
  performance: Zap,
  security: Shield
};

const severityColors = {
  critical: 'destructive',
  high: 'destructive', 
  medium: 'default',
  low: 'secondary'
} as const;

export function SystemAuditDashboard() {
  const { issues, isAuditing, runFullAudit, markIssueFixed, getCriticalIssues } = useSystemAudit();
  
  const criticalIssues = getCriticalIssues();
  const totalIssues = issues.filter(i => !i.fixed).length;
  const fixedIssues = issues.filter(i => i.fixed).length;

  const categories = Object.keys(categoryIcons);
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">System Audit Dashboard</h2>
          <p className="text-muted-foreground">
            Comprehensive health check of all application components
          </p>
        </div>
        <Button 
          onClick={runFullAudit}
          disabled={isAuditing}
          variant="outline"
        >
          {isAuditing ? (
            <>
              <Clock className="h-4 w-4 mr-2 animate-spin" />
              Running Audit...
            </>
          ) : (
            'Run Full Audit'
          )}
        </Button>
      </div>

      {/* Critical Issues Alert */}
      {criticalIssues.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {criticalIssues.length} critical issue{criticalIssues.length !== 1 ? 's' : ''} found that require immediate attention!
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-destructive">{criticalIssues.length}</div>
            <p className="text-sm text-muted-foreground">Critical Issues</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-500">{totalIssues}</div>
            <p className="text-sm text-muted-foreground">Total Issues</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-500">{fixedIssues}</div>
            <p className="text-sm text-muted-foreground">Issues Fixed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {totalIssues > 0 ? Math.round((fixedIssues / (totalIssues + fixedIssues)) * 100) : 100}%
            </div>
            <p className="text-sm text-muted-foreground">Health Score</p>
          </CardContent>
        </Card>
      </div>

      {/* Issues by Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(category => {
          const Icon = categoryIcons[category as keyof typeof categoryIcons];
          const categoryIssues = issues.filter(i => i.category === category && !i.fixed);
          
          return (
            <Card key={category}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-base">
                  <Icon className="h-4 w-4 mr-2" />
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                  {categoryIssues.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {categoryIssues.length}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {categoryIssues.length === 0 ? (
                  <div className="flex items-center text-sm text-green-600">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    No issues found
                  </div>
                ) : (
                  <div className="space-y-2">
                    {categoryIssues.slice(0, 3).map(issue => (
                      <div key={issue.id} className="flex items-start justify-between text-sm">
                        <div className="flex-1">
                          <div className="font-medium">{issue.title}</div>
                          <div className="text-muted-foreground">{issue.description}</div>
                        </div>
                        <div className="flex items-center space-x-2 ml-2">
                          <Badge variant={severityColors[issue.severity]} className="text-xs">
                            {issue.severity}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => markIssueFixed(issue.id)}
                            className="h-6 px-2"
                          >
                            ✓
                          </Button>
                        </div>
                      </div>
                    ))}
                    {categoryIssues.length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        +{categoryIssues.length - 3} more issues
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detailed Issues List */}
      {totalIssues > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>All Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {issues.filter(i => !i.fixed).map(issue => (
                <div key={issue.id} className="flex items-start justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge variant={severityColors[issue.severity]}>
                        {issue.severity}
                      </Badge>
                      <Badge variant="outline">
                        {issue.category}
                      </Badge>
                      {issue.page && (
                        <Badge variant="secondary">
                          {issue.page}
                        </Badge>
                      )}
                    </div>
                    <h4 className="font-medium">{issue.title}</h4>
                    <p className="text-sm text-muted-foreground">{issue.description}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => markIssueFixed(issue.id)}
                    variant="outline"
                  >
                    Mark Fixed
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Page-Level Audits */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ButtonAuditor />
        <LoadingStateAuditor />
      </div>
    </div>
  );
}