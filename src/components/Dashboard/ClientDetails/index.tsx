
import React from "react";
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
import { StyledCard } from "../Shared/CardStyle";

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
      <StyledCard 
        title="Client Details"
        variant="primary"
        headerClassName="flex flex-row items-center justify-between"
      >
        <div className="absolute top-6 right-6">
          <Badge className={getStatusColor(client.status)}>
            {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
          </Badge>
        </div>
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
      </StyledCard>
      
      <HealthScoreHistory clientId={client.id} clientName={client.name} />
    </div>
  );
}
