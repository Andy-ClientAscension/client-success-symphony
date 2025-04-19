
import React from "react";
import { format } from "date-fns";
import { Client } from "@/lib/data";
import { Calendar, MessageSquare, CreditCard, BarChart } from "lucide-react";
import { MetricItem } from "@/components/Dashboard/Shared/CardStyle";
import { ResponsiveGrid } from "@/components/Dashboard/Shared/ResponsiveGrid";

interface ClientDatesSectionProps {
  client: Client;
}

export function ClientDatesSection({ client }: ClientDatesSectionProps) {
  return (
    <ResponsiveGrid 
      cols={{ xs: 1, sm: 2, md: 2, lg: 4 }} 
      gap="md"
      aria-label={`Important dates for client ${client.name}`}
      role="region"
    >
      <MetricItem 
        icon={<Calendar className="h-4 w-4 text-primary" />}
        title="End Date"
        value={format(new Date(client.endDate), 'MMM dd, yyyy')}
      />
      
      <MetricItem 
        icon={<MessageSquare className="h-4 w-4 text-primary" />}
        title="Last Communication"
        value={format(new Date(client.lastCommunication), 'MMM dd, yyyy')}
      />
      
      <MetricItem 
        icon={<CreditCard className="h-4 w-4 text-primary" />}
        title="Last Payment"
        value={`$${client.lastPayment.amount} • ${format(new Date(client.lastPayment.date), 'MMM dd, yyyy')}`}
      />
      
      <MetricItem 
        icon={<BarChart className="h-4 w-4 text-primary" />}
        title="Lifetime Value"
        value={`$${client.lastPayment.amount * 12}`}
      />
    </ResponsiveGrid>
  );
}
