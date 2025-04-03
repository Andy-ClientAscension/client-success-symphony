
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Client } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { HealthScoreHistory } from "../HealthScoreHistory";
import { ClientInfoSection } from "./ClientInfoSection";
import { ClientProgressSection } from "./ClientProgressSection";
import { ClientMetricsSection } from "./ClientMetricsSection";
import { ClientDatesSection } from "./ClientDatesSection";
import { ClientAdditionalInfo } from "./ClientAdditionalInfo";
import { ClientActionButtons } from "./ClientActionButtons";

interface ClientDetailsProps {
  client: Client;
}

export function ClientDetails({ client }: ClientDetailsProps) {
  const { toast } = useToast();

  const getStatusColor = (status: Client['status']) => {
    switch (status) {
      case 'active':
        return 'bg-success-100 text-success-800 hover:bg-success-200';
      case 'at-risk':
        return 'bg-warning-100 text-warning-800 hover:bg-warning-200';
      case 'churned':
        return 'bg-danger-100 text-danger-800 hover:bg-danger-200';
      case 'new':
        return 'bg-brand-100 text-brand-800 hover:bg-brand-200';
      default:
        return '';
    }
  };

  const handleContactClient = () => {
    toast({
      title: "Contact Initiated",
      description: `Opening communication with ${client.name}`,
    });
  };

  const handleViewHistory = () => {
    toast({
      title: "Loading History",
      description: `Viewing interaction history for ${client.name}`,
    });
  };

  const handleAddNote = () => {
    toast({
      title: "Add Note",
      description: `Adding a note for ${client.name}`,
    });
  };
  
  return (
    <div className="space-y-6">
      <Card className="border-red-100">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Client Details</CardTitle>
          <Badge className={getStatusColor(client.status)}>
            {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <ClientInfoSection client={client} />
            <ClientProgressSection client={client} />
            <ClientMetricsSection client={client} />
            <ClientDatesSection client={client} />
            <ClientAdditionalInfo client={client} />
            <ClientActionButtons 
              clientId={client.id}
              clientName={client.name}
              onContactClient={handleContactClient}
              onViewHistory={handleViewHistory}
              onAddNote={handleAddNote}
            />
          </div>
        </CardContent>
      </Card>
      
      <HealthScoreHistory clientId={client.id} clientName={client.name} />
    </div>
  );
}
