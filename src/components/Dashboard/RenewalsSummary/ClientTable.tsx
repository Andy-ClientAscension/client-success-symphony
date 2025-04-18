
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";

interface BackEndSale {
  id: string;
  clientId: string;
  clientName: string;
  status: "renewed" | "churned";
  renewalDate: Date | string;
  notes: string;
  painPoints: string[];
  team?: string;
}

interface ClientTableProps {
  filteredSales: BackEndSale[];
  formatTeamName: (team: string) => string;
}

export function ClientTable({ filteredSales, formatTeamName }: ClientTableProps) {
  const { isMobile } = useIsMobile();
  
  return (
    <div className="overflow-x-auto -mx-4 sm:mx-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Client Name</TableHead>
            {!isMobile && <TableHead>Team</TableHead>}
            <TableHead>Status</TableHead>
            <TableHead>{isMobile ? "Reasons" : "Churn Reasons"}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredSales.length > 0 ? (
            filteredSales.map((sale) => (
              <TableRow key={sale.id}>
                <TableCell className="font-medium">{sale.clientName}</TableCell>
                {!isMobile && (
                  <TableCell>{sale.team ? formatTeamName(sale.team) : "Unassigned"}</TableCell>
                )}
                <TableCell>
                  <Badge
                    variant={sale.status === "renewed" ? "outline" : "destructive"}
                  >
                    {sale.status === "renewed" ? "Renewed" : "Churned"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {sale.status === "churned" && sale.painPoints.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {sale.painPoints.map((point, index) => (
                        <Badge key={`${sale.id}-reason-${index}`} variant="outline" className="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-xs">
                          {isMobile && point.length > 10 ? `${point.slice(0, 10)}...` : point}
                        </Badge>
                      ))}
                    </div>
                  ) : sale.status === "churned" ? (
                    <span className="text-muted-foreground text-sm">No reasons provided</span>
                  ) : null}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={isMobile ? 3 : 4} className="text-center py-4 text-muted-foreground">
                No clients found for the selected filter.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
