
import React from "react";
import { Client } from "@/lib/data";
import { Phone, BarChart2, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClientMetricsSectionProps {
  client: Client;
}

export function ClientMetricsSection({ client }: ClientMetricsSectionProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
    </div>
  );
}

interface MetricItemProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  className?: string;
}

function MetricItem({ icon, title, value, className }: MetricItemProps) {
  return (
    <div className={cn("border border-border rounded-lg p-3", className)}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="font-medium">{title}</span>
      </div>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}
