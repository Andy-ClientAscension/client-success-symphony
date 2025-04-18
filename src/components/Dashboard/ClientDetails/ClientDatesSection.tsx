
import React from "react";
import { format } from "date-fns";
import { Client } from "@/lib/data";
import { Calendar, MessageSquare, CreditCard, BarChart } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClientDatesSectionProps {
  client: Client;
}

export function ClientDatesSection({ client }: ClientDatesSectionProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <DateItem 
        icon={<Calendar className="h-4 w-4 text-primary" />}
        title="End Date"
        value={format(new Date(client.endDate), 'MMM dd, yyyy')}
      />
      
      <DateItem 
        icon={<MessageSquare className="h-4 w-4 text-primary" />}
        title="Last Communication"
        value={format(new Date(client.lastCommunication), 'MMM dd, yyyy')}
      />
      
      <DateItem 
        icon={<CreditCard className="h-4 w-4 text-primary" />}
        title="Last Payment"
        value={`$${client.lastPayment.amount} • ${format(new Date(client.lastPayment.date), 'MMM dd, yyyy')}`}
      />
      
      <DateItem 
        icon={<BarChart className="h-4 w-4 text-primary" />}
        title="Lifetime Value"
        value={`$${client.lastPayment.amount * 12}`}
      />
    </div>
  );
}

interface DateItemProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  className?: string;
}

function DateItem({ icon, title, value, className }: DateItemProps) {
  return (
    <div className={cn("border border-border rounded-lg p-3", className)}>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="font-medium">{title}</span>
      </div>
      <p>{value}</p>
    </div>
  );
}
