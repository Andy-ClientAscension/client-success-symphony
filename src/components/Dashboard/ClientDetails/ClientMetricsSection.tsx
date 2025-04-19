
import React from "react";
import { Client } from "@/lib/data";
import { Phone, BarChart2, DollarSign } from "lucide-react";
import { ResponsiveGrid } from "@/components/Dashboard/Shared/ResponsiveGrid";
import { HeroMetric } from "@/components/Dashboard/Metrics/HeroMetric";

interface ClientMetricsSectionProps {
  client: Client;
}

export function ClientMetricsSection({ client }: ClientMetricsSectionProps) {
  return (
    <ResponsiveGrid 
      cols={{ xs: 1, sm: 2, md: 3, lg: 3 }} 
      gap="md"
      aria-label={`Metrics for client ${client.name}`}
      role="region"
    >
      <HeroMetric 
        size="sm"
        title="Calls Booked"
        value={client.callsBooked.toString()}
        icon={<Phone className="h-4 w-4 text-primary" />}
      />
      
      <HeroMetric 
        size="sm"
        title="Deals Closed"
        value={client.dealsClosed.toString()}
        icon={<BarChart2 className="h-4 w-4 text-primary" />}
      />
      
      <HeroMetric 
        size="sm"
        title="Monthly Revenue"
        value={`$${client.mrr}`}
        icon={<DollarSign className="h-4 w-4 text-primary" />}
      />
    </ResponsiveGrid>
  );
}
