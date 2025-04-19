
import { createContext, useContext } from 'react';
import { Client } from '@/lib/data';

interface ClientTableContextValue {
  clients: Client[];
  selectedClientIds: string[];
  onSelectClient: (clientId: string) => void;
  onSelectAll: () => void;
  onViewDetails: (client: Client) => void;
  onEditMetrics: (client: Client) => void;
  onUpdateNPS: (client: Client) => void;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

const ClientTableContext = createContext<ClientTableContextValue | undefined>(undefined);

export const useClientTable = () => {
  const context = useContext(ClientTableContext);
  if (!context) {
    throw new Error('useClientTable must be used within ClientTableProvider');
  }
  return context;
};

export const ClientTableProvider = ClientTableContext.Provider;
