
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Client } from "@/lib/data";

interface SSCPerformanceRowProps {
  csm: string;
  clients: Client[];
}

export function SSCPerformanceRow({ csm, clients }: SSCPerformanceRowProps) {
  const csmClients = clients.filter(client => client.csm === csm);
  
  // For now, we'll assume all clients are backend students
  const backendStudents = csmClients.length;
  
  // Calculate team health metrics
  const clientsWithNPS = csmClients.filter(client => client.npsScore !== null);
  const avgNPS = clientsWithNPS.length > 0 
    ? Math.round(clientsWithNPS.reduce((sum, client) => sum + (client.npsScore || 0), 0) / clientsWithNPS.length)
    : 0;
  
  // Determine health color based on NPS
  let healthColor = "text-green-600";
  let healthText = "Healthy";
  
  if (avgNPS < 6) {
    healthColor = "text-red-600";
    healthText = "At Risk";
  } else if (avgNPS >= 6 && avgNPS < 8) {
    healthColor = "text-amber-600";
    healthText = "Adequate";
  }
  
  return (
    <TableRow>
      <TableCell className="font-medium">{csm}</TableCell>
      <TableCell className="text-right">{csmClients.length}</TableCell>
      <TableCell className="text-right">{backendStudents}</TableCell>
      <TableCell className={`text-right font-medium ${healthColor}`}>
        {healthText} (NPS: {avgNPS})
      </TableCell>
    </TableRow>
  );
}
