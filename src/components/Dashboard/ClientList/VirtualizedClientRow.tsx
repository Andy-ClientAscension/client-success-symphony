
import React from "react";
import { Client } from "@/lib/data";

interface VirtualizedClientRowProps {
  client: Client;
  columns: any[];
  style: React.CSSProperties;
  onClick?: (client: Client) => void;
}

export function VirtualizedClientRow({ 
  client, 
  columns, 
  style,
  onClick 
}: VirtualizedClientRowProps) {
  if (!client) return null;
  
  return (
    <tr
      className="hover:bg-muted/50 cursor-pointer transition-colors"
      style={style}
      onClick={() => onClick?.(client)}
      role="row"
      aria-rowindex={client.id}
    >
      {columns.map((column) => (
        <td
          key={`${client.id}-${column.key}`}
          className={`py-3 px-4 ${column.className || ''}`}
          role="cell"
        >
          {column.cell?.(client)}
        </td>
      ))}
    </tr>
  );
}
