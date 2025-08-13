import React from 'react';
import { Layout } from '@/components/Layout/Layout';
import { SystemAuditProvider, SystemAuditDashboard } from '@/components/SystemAudit';

export default function SystemAudit() {
  return (
    <Layout>
      <SystemAuditProvider>
        <div className="container py-6">
          <SystemAuditDashboard />
        </div>
      </SystemAuditProvider>
    </Layout>
  );
}