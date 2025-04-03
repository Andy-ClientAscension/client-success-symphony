
import React from "react";
import { format } from "date-fns";
import { Client } from "@/lib/data";
import { Calendar, MessageSquare, CreditCard, BarChart } from "lucide-react";

interface ClientDatesSectionProps {
  client: Client;
}

export function ClientDatesSection({ client }: ClientDatesSectionProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="border border-red-100 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="h-4 w-4 text-red-600" />
          <span className="font-medium">End Date</span>
        </div>
        <p>{format(new Date(client.endDate), 'MMM dd, yyyy')}</p>
      </div>
      
      <div className="border border-red-100 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <MessageSquare className="h-4 w-4 text-red-600" />
          <span className="font-medium">Last Communication</span>
        </div>
        <p>{format(new Date(client.lastCommunication), 'MMM dd, yyyy')}</p>
      </div>
      
      <div className="border border-red-100 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <CreditCard className="h-4 w-4 text-red-600" />
          <span className="font-medium">Last Payment</span>
        </div>
        <p>${client.lastPayment.amount} • {format(new Date(client.lastPayment.date), 'MMM dd, yyyy')}</p>
      </div>
      
      <div className="border border-red-100 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <BarChart className="h-4 w-4 text-red-600" />
          <span className="font-medium">Lifetime Value</span>
        </div>
        <p>${client.lastPayment.amount * 12}</p>
      </div>
    </div>
  );
}
