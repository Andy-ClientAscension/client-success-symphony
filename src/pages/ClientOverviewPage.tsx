
import React from 'react';
import { DashboardLayout } from '@/components/templates';
import { ClientList } from '@/components/organisms';
import { Card } from '@/components/ui/card';

export function ClientOverviewPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <Card className="w-full">
          <ClientList />
        </Card>
      </div>
    </DashboardLayout>
  );
}
