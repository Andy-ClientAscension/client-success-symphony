
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ResponsiveGrid } from '../Shared/ResponsiveGrid';
import { SSCPerformanceMetrics } from '../Metrics/SSCPerformanceMetrics';
import { useDashboardData } from '@/hooks/useDashboardData';

export function SSCPerformanceOverview() {
  const { allClients } = useDashboardData();
  
  // Get unique CSMs from clients
  const csms = Array.from(new Set(allClients.map(client => client.csm)));

  return (
    <section 
      className="mb-6" 
      role="region" 
      aria-label="SSC Performance Overview"
    >
      <Card>
        <CardHeader>
          <CardTitle>SSC Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveGrid 
            cols={{ xs: 1, md: 2 }} 
            gap="lg"
          >
            {csms.map((csm) => (
              <SSCPerformanceMetrics
                key={csm}
                csm={csm}
                clients={allClients}
              />
            ))}
          </ResponsiveGrid>
        </CardContent>
      </Card>
    </section>
  );
}
