
import { useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { useVirtualizer } from "@tanstack/react-virtual";

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
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const scrollPositionRef = useRef(0);
  
  const rowVirtualizer = useVirtualizer({
    count: filteredSales.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 56, // Default row height
    overscan: 10, // Number of items to render above/below visible window
  });

  // Preserve scroll position on data updates
  useEffect(() => {
    if (tableContainerRef.current) {
      const savedScrollPosition = scrollPositionRef.current;
      tableContainerRef.current.scrollTop = savedScrollPosition;
    }
  }, [filteredSales]);

  // Save scroll position before unmount
  useEffect(() => {
    const handleScroll = () => {
      if (tableContainerRef.current) {
        scrollPositionRef.current = tableContainerRef.current.scrollTop;
      }
    };

    const container = tableContainerRef.current;
    container?.addEventListener('scroll', handleScroll);
    return () => container?.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div 
      ref={tableContainerRef}
      className="relative border rounded-md overflow-auto"
      style={{ height: '600px' }}
    >
      <table className="w-full">
        <thead className="sticky top-0 bg-white dark:bg-gray-800 z-10">
          <tr>
            <th className="p-3 text-left">Client Name</th>
            {!isMobile && <th className="p-3 text-left">Team</th>}
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">Reasons</th>
          </tr>
        </thead>

        <tbody>
          {rowVirtualizer.getVirtualItems().map((virtualRow) => {
            const sale = filteredSales[virtualRow.index];
            return (
              <tr 
                key={sale.id}
                data-index={virtualRow.index}
                style={{
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                className="absolute w-full"
              >
                <td className="p-3">{sale.clientName}</td>
                {!isMobile && (
                  <td className="p-3">
                    {sale.team ? formatTeamName(sale.team) : "Unassigned"}
                  </td>
                )}
                <td className="p-3">
                  <Badge
                    variant={sale.status === "renewed" ? "outline" : "destructive"}
                  >
                    {sale.status === "renewed" ? "Renewed" : "Churned"}
                  </Badge>
                </td>
                <td className="p-3">
                  {sale.status === "churned" && sale.painPoints.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {sale.painPoints.map((point, index) => (
                        <Badge 
                          key={`${sale.id}-reason-${index}`} 
                          variant="outline" 
                          className="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-xs"
                        >
                          {isMobile && point.length > 10 
                            ? `${point.slice(0, 10)}...` 
                            : point}
                        </Badge>
                      ))}
                    </div>
                  ) : sale.status === "churned" ? (
                    <span className="text-muted-foreground text-sm">
                      No reasons provided
                    </span>
                  ) : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div 
        style={{ 
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '1px',
        }} 
      />
    </div>
  );
}
