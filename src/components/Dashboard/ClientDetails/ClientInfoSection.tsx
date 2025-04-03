
import React from "react";
import { format } from "date-fns";
import { Client } from "@/lib/data";
import { User } from "lucide-react";

interface ClientInfoSectionProps {
  client: Client;
}

export function ClientInfoSection({ client }: ClientInfoSectionProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
        {client.logo ? (
          <img src={client.logo} alt={client.name} className="h-full w-full rounded-full object-cover" />
        ) : (
          <span className="text-2xl font-bold">{client.name.charAt(0)}</span>
        )}
      </div>
      <div>
        <h2 className="text-xl font-bold">{client.name}</h2>
        <p className="text-sm text-muted-foreground">Client since {format(new Date(client.lastPayment.date), 'MMMM yyyy')}</p>
        {client.csm && (
          <div className="flex items-center mt-1 text-sm">
            <User className="h-3 w-3 mr-1 text-red-600" />
            <span>CSM: {client.csm}</span>
          </div>
        )}
      </div>
    </div>
  );
}
