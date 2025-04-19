
import { createContext, useContext } from 'react';

export interface BackEndSale {
  id: string;
  clientId: string;
  clientName: string;
  status: "renewed" | "churned";
  renewalDate: Date | string;
  notes: string;
  painPoints: string[];
  team?: string;
}

interface ClientTableContextValue {
  filteredSales: BackEndSale[];
  formatTeamName: (team: string) => string;
  isMobile: boolean;
}

export const ClientTableContext = createContext<ClientTableContextValue | undefined>(undefined);

export function useClientTable() {
  const context = useContext(ClientTableContext);
  if (!context) {
    throw new Error('useClientTable must be used within a ClientTableProvider');
  }
  return context;
}

