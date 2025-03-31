
import React from "react";
import { TableCell, TableBody, TableHead, TableHeader, TableRow, Table } from "@/components/ui/table";
import { SSCPerformanceRow } from "./SSCPerformanceRow";
import { Client } from "@/lib/data";
import { HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SSCPerformanceTableProps {
  csmList: string[];
  clients: Client[];
  selectedTeam: string;
}

export function SSCPerformanceTable({ csmList, clients, selectedTeam }: SSCPerformanceTableProps) {
  return (
    <>
      <div className="flex items-center mb-2">
        <h3 className="text-sm font-medium">Student Success Coach Performance</h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 ml-2 text-muted-foreground cursor-help" />
            </TooltipTrigger>
            <TooltipContent className="max-w-sm p-3">
              <p className="text-xs">Team Health Grade is calculated based on multiple factors:</p>
              <ul className="text-xs mt-1 list-disc pl-4">
                <li>NPS Score (30%)</li>
                <li>Client Retention (30%)</li>
                <li>Growth Metrics (20%)</li>
                <li>MRR Trends (20%)</li>
              </ul>
              <p className="text-xs mt-1">Grades range from F (poor) to A+ (excellent)</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">SSC</TableHead>
              <TableHead className="text-right">Clients</TableHead>
              <TableHead className="text-right">Backend Students</TableHead>
              <TableHead className="text-right">Team Health Grade</TableHead>
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
