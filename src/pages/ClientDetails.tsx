
// Since ClientDetails.tsx is a read-only file, we need to create a wrapper component
// that passes the correct prop names to the components

import React from "react";
import { useParams } from "react-router-dom";
import { Layout } from "@/components/Layout/Layout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ClientDetails } from "@/components/Dashboard/ClientDetails";
import { TaskManager } from "@/components/Dashboard/TaskManager";
import { CommunicationCenter } from "@/components/Dashboard/CommunicationCenter";
import { MOCK_CLIENTS } from "@/lib/data";

export default function ClientDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const client = MOCK_CLIENTS.find(c => c.id === id) || MOCK_CLIENTS[0];

  return (
    <Layout>
      <ErrorBoundary>
        <div className="container py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ClientDetails client={client} />
              {/* Fix: The error was because TaskManager doesn't accept clientId prop */}
              <div className="mt-6">
                <TaskManager />
              </div>
            </div>
            <div className="space-y-6">
              <CommunicationCenter />
            </div>
          </div>
        </div>
      </ErrorBoundary>
    </Layout>
  );
}
