import React from 'react';
import { DashboardLayout } from '@/components/templates';
import { SSCClientManagement } from '@/components/SSCClientManagement';

export default function Clients() {
  return (
    <div data-testid="clients-page">
      <DashboardLayout>
        <SSCClientManagement />
      </DashboardLayout>
    </div>
  );
}