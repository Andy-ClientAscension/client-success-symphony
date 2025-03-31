
import React from "react";
import { TableCell, TableBody, TableHead, TableHeader, TableRow, Table } from "@/components/ui/table";
import { SSCPerformanceRow } from "./SSCPerformanceRow";
import { Client } from "@/lib/data";

interface SSCPerformanceTableProps {
  csmList: string[];
  clients: Client[];
  selectedTeam: string;
}

export function SSCPerformanceTable({ csmList, clients, selectedTeam }: SSCPerformanceTableProps) {
  return (
    <>
      <h3 className="text-sm font-medium mb-2">Student Success Coach Performance</h3>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">SSC</TableHead>
              <TableHead className="text-right">Clients</TableHead>
              <TableHead className="text-right">Backend Students</TableHead>
              <TableHead className="text-right">Team Health</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {csmList.filter(csm => {
              if (selectedTeam === "all") return true;
              return clients.some(client => client.csm === csm && client.team === selectedTeam);
            }).map((csm) => (
              <SSCPerformanceRow key={csm} csm={csm} clients={clients} />
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
