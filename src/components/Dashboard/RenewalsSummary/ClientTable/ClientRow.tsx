
import { Badge } from "@/components/ui/badge";
import { useClientTable, BackEndSale } from "./ClientTableContext";

interface ClientRowProps {
  sale: BackEndSale;
  style: React.CSSProperties;
  index: number;
}

export function ClientRow({ sale, style, index }: ClientRowProps) {
  const { isMobile, formatTeamName } = useClientTable();

  return (
    <tr 
      key={sale.id}
      data-index={index}
      style={style}
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
}
