
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricsOverview } from './MetricsOverview';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ChartErrorFallback } from '../Shared/ErrorFallbacks';

export function CompanyMetrics() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Company Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <ErrorBoundary 
            fallback={<ChartErrorFallback error={new Error("Failed to load metrics")} />}
          >
            <MetricsOverview />
          </ErrorBoundary>
        </div>
      </CardContent>
    </Card>
  );
}
