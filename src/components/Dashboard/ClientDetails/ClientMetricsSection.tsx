
import React from "react";
import { Client } from "@/lib/data";
import { Phone, BarChart2, DollarSign } from "lucide-react";
import { MetricItem } from "@/components/Dashboard/Shared/CardStyle";
import { ResponsiveGrid } from "@/components/Dashboard/Shared/ResponsiveGrid";

interface ClientMetricsSectionProps {
  client: Client;
}

export function ClientMetricsSection({ client }: ClientMetricsSectionProps) {
  return (
    <ResponsiveGrid 
      cols={{ xs: 1, sm: 3 }} 
      gap="md"
    >
      <MetricItem 
        icon={<Phone className="h-4 w-4 text-primary" />}
        title="Calls Booked"
        value={client.callsBooked.toString()}
      />
      
      <MetricItem 
        icon={<BarChart2 className="h-4 w-4 text-primary" />}
        title="Deals Closed"
        value={client.dealsClosed.toString()}
      />
      
      <MetricItem 
        icon={<DollarSign className="h-4 w-4 text-primary" />}
        title="Monthly Revenue"
        value={`$${client.mrr}`}
      />
    </ResponsiveGrid>
  );
}
