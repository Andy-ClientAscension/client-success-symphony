
import React from "react";
import { TableCell, TableBody, TableHead, TableHeader, TableRow, Table } from "@/components/ui/table";
import { SSCPerformanceRow } from "./SSCPerformanceRow";
import { Client } from "@/lib/data";
import { HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/use-mobile";

interface SSCPerformanceTableProps {
  csmList: string[];
  clients: Client[];
  selectedTeam: string;
}

// List of SSCs to exclude from the display
const excludedSSCs = [
  "John Smith",
  "Sarah Johnson",
  "Michael Brown",
  "Emily Davis",
  "David Wilson",
  "Jennifer Taylor",
  "Robert Anderson",
  "Jessica Thomas",
  "William Martinez",
  "Sophia Martinez"
];

export function SSCPerformanceTable({ csmList, clients, selectedTeam }: SSCPerformanceTableProps) {
  const isMobile = useIsMobile();
  
  // Filter out the excluded SSCs
  const filteredCsmList = csmList.filter(csm => !excludedSSCs.includes(csm));
  
  return (
    <div className="mt-6">
      <div className="flex items-center mb-3">
        <h3 className="text-base font-medium">Student Success Coach Performance</h3>
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
      <div className="border rounded-lg overflow-hidden bg-card text-card-foreground dark:border-gray-700">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 dark:bg-gray-800/50">
              <TableHead className={`py-4 text-sm ${isMobile ? 'w-[120px]' : 'w-[180px]'}`}>SSC</TableHead>
              <TableHead className={`text-center text-sm ${isMobile ? 'w-[70px]' : 'w-[100px]'}`}>Clients</TableHead>
              <TableHead className={`text-center text-sm ${isMobile ? 'hidden' : 'w-[180px]'}`}>Backend Students</TableHead>
              <TableHead>
                <div className="flex justify-between text-sm">
                  <div className="min-w-[80px]">Team Health</div>
                  <div className="flex-1 text-right">Metrics</div>
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCsmList.filter(csm => {
              if (selectedTeam === "all") return true;
              return clients.some(client => client.csm === csm && client.team === selectedTeam);
            }).map((csm) => (
              <SSCPerformanceRow key={csm} csm={csm} clients={clients} isMobile={isMobile} />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
