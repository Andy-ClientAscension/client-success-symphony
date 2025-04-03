
import React from "react";
import { Client } from "@/lib/data";
import { Phone, BarChart2, DollarSign } from "lucide-react";

interface ClientMetricsSectionProps {
  client: Client;
}

export function ClientMetricsSection({ client }: ClientMetricsSectionProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="border border-red-100 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <Phone className="h-4 w-4 text-red-600" />
          <span className="font-medium">Calls Booked</span>
        </div>
        <p className="text-xl font-bold">{client.callsBooked}</p>
      </div>
      
      <div className="border border-red-100 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <BarChart2 className="h-4 w-4 text-red-600" />
          <span className="font-medium">Deals Closed</span>
        </div>
        <p className="text-xl font-bold">{client.dealsClosed}</p>
      </div>
      
      <div className="border border-red-100 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="h-4 w-4 text-red-600" />
          <span className="font-medium">Monthly Revenue</span>
        </div>
        <p className="text-xl font-bold">${client.mrr}</p>
      </div>
    </div>
  );
}
