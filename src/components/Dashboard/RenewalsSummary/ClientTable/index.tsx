
import { useRef, useEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useIsMobile } from "@/hooks/use-mobile";
import { ClientTableContext } from "./ClientTableContext";
import { TableHeader } from "./TableHeader";
import { ClientRow } from "./ClientRow";
import type { BackEndSale } from "@/lib/types";

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
    estimateSize: () => 56,
    overscan: 10,
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

  const contextValue = {
    filteredSales,
    formatTeamName,
    isMobile,
  };

  return (
    <ClientTableContext.Provider value={contextValue}>
      <div 
        ref={tableContainerRef}
        className="relative border rounded-md overflow-auto"
        style={{ height: '600px' }}
      >
        <table className="w-full">
          <TableHeader />
          <tbody>
            {rowVirtualizer.getVirtualItems().map((virtualRow) => (
              <ClientRow
                key={filteredSales[virtualRow.index].id}
                sale={filteredSales[virtualRow.index]}
                style={{
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                index={virtualRow.index}
              />
            ))}
          </tbody>
        </table>

        <div 
          style={{ 
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '1px',
          }} 
        />
      </div>
    </ClientTableContext.Provider>
  );
}
