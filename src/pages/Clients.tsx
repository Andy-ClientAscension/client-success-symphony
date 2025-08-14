import React from 'react';
import { DashboardLayout } from '@/components/templates';
import { SSCClientManagement } from '@/components/SSCClientManagement';

export default function Clients() {
  return (
    <DashboardLayout>
      <SSCClientManagement />
    </DashboardLayout>
  );
}