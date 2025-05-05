
import React from "react";
import { Client } from "@/lib/data";

interface VirtualizedClientRowProps {
  client: Client;
  columns: any[];
  style: React.CSSProperties;
}

export function VirtualizedClientRow({ 
  client, 
  columns, 
  style 
}: VirtualizedClientRowProps) {
  return (
    <tr
      className="hover:bg-muted/50 cursor-pointer transition-colors"
      style={style}
    >
      {columns.map((column) => (
        <td
          key={`${client.id}-${column.key}`}
          className={`py-3 px-4 ${column.className || ''}`}
        >
          {column.cell(client)}
        </td>
      ))}
    </tr>
  );
}
