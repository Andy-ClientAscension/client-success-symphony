
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { ResponsiveTable, Column } from "@/components/Dashboard/Shared/ResponsiveTable";

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
  
  const columns: Column<BackEndSale>[] = [
    {
      key: 'clientName',
      header: 'Client Name',
      cell: (sale) => <span className="font-medium">{sale.clientName}</span>
    },
    {
      key: 'team',
      header: 'Team',
      cell: (sale) => <span>{sale.team ? formatTeamName(sale.team) : "Unassigned"}</span>,
      hideOnMobile: true
    },
    {
      key: 'status',
      header: 'Status',
      cell: (sale) => (
        <Badge
          variant={sale.status === "renewed" ? "outline" : "destructive"}
        >
          {sale.status === "renewed" ? "Renewed" : "Churned"}
        </Badge>
      )
    },
    {
      key: 'reasons',
      header: isMobile ? "Reasons" : "Churn Reasons",
      cell: (sale) => (
        sale.status === "churned" && sale.painPoints.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {sale.painPoints.map((point, index) => (
              <Badge 
                key={`${sale.id}-reason-${index}`} 
                variant="outline" 
                className="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-xs"
              >
                {isMobile && point.length > 10 ? `${point.slice(0, 10)}...` : point}
              </Badge>
            ))}
          </div>
        ) : sale.status === "churned" ? (
          <span className="text-muted-foreground text-sm">No reasons provided</span>
        ) : null
      )
    }
  ];

  return (
    <ResponsiveTable
      data={filteredSales}
      columns={columns}
      keyExtractor={(sale) => sale.id}
      emptyMessage="No clients found for the selected filter."
      stripedRows={true}
    />
  );
}
