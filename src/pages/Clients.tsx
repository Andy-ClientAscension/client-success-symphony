
import { Layout } from "@/components/Layout/Layout";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ClientsTabs } from "@/components/Dashboard/ClientsTabs";
import { ClientsHeader } from "@/components/Dashboard/ClientsHeader";
import { useToast } from "@/hooks/use-toast";
import { useKanbanStore } from "@/utils/kanbanStore";
import { STORAGE_KEYS, loadData, saveData } from "@/utils/persistence";
import { LoadingState } from "@/components/LoadingState";
import { getAllClients, Client } from "@/lib/data";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Clients() {
  const [activeTab, setActiveTab] = useState("all");
  const [forceReload, setForceReload] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { loadPersistedData } = useKanbanStore();

  // Optimize client data initialization
  const initializeClientData = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Enable data persistence
      localStorage.setItem("persistDashboard", "true");
      
      // Initialize client data if not already present
      const storedClients = loadData<Client[]>(STORAGE_KEYS.CLIENTS, []);
      
      if (!storedClients || !Array.isArray(storedClients) || storedClients.length === 0) {
        // Load default clients from data.ts if no clients in storage
        const defaultClients = getAllClients();
        
        if (defaultClients && defaultClients.length > 0) {
          saveData(STORAGE_KEYS.CLIENTS, defaultClients);
          saveData(STORAGE_KEYS.CLIENT_STATUS, defaultClients);
          setClients(defaultClients);
        }
      } else {
        setClients(storedClients);
        
        // Ensure client data is saved to client status as well for new users
        if (localStorage.getItem(STORAGE_KEYS.CLIENT_STATUS) === null) {
          saveData(STORAGE_KEYS.CLIENT_STATUS, storedClients);
        }
      }
      
      // Load the kanban data - wrapped in a try/catch to prevent errors
      try {
        await loadPersistedData();
      } catch (error) {
        console.error("Error loading kanban data:", error);
      }
    } catch (error) {
      console.error("Error initializing client data:", error);
      toast({
        title: "Error Loading Students",
        description: "There was an issue loading the student data. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [loadPersistedData, toast]);

  // Initialize data only once on component mount
  useEffect(() => {
    initializeClientData();
  }, [initializeClientData]);

  // Optimize storage event handling
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent | CustomEvent) => {
      const key = event instanceof StorageEvent ? event.key : (event as CustomEvent).detail?.key;
      
      // Only reload on relevant storage changes
      if (key === STORAGE_KEYS.CLIENTS || key === STORAGE_KEYS.CLIENT_STATUS || 
          key === STORAGE_KEYS.KANBAN || key === null) {
        
        console.log("Storage change detected in Clients.tsx:", key);
        
        // Reload clients from storage
        const updatedClients = loadData<Client[]>(STORAGE_KEYS.CLIENTS, []);
        if (updatedClients && updatedClients.length > 0) {
          setClients(updatedClients);
        }
        
        // Increment force reload counter to refresh child components
        setForceReload(prev => prev + 1);
      }
    };
    
    // Listen for both the storage event and our custom events
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('storageUpdated', handleStorageChange as EventListener);
    window.addEventListener('storageRestored', handleStorageChange as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('storageUpdated', handleStorageChange as EventListener);
      window.removeEventListener('storageRestored', handleStorageChange as EventListener);
    };
  }, []);

  const handleAddNewClient = useCallback(() => {
    navigate("/add-client");
  }, [navigate]);

  // Optimize tab change handling
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
    requestAnimationFrame(() => {
      setForceReload(prev => prev + 1);
    });
  }, []);

  const getStatusSummary = () => {
    if (!clients.length) return null;
    
    const summary = clients.reduce((acc, client) => {
      acc[client.status] = (acc[client.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return (
      <div className="flex gap-2 mb-4 flex-wrap">
        {Object.entries(summary).map(([status, count]) => (
          <Badge
            key={status}
            variant={
              status === 'active' ? 'default' :
              status === 'at-risk' ? 'destructive' :
              status === 'churned' ? 'secondary' : 'outline'
            }
            className="px-3 py-1"
          >
            {status}: {count}
          </Badge>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <Layout>
        <LoadingState message="Loading dashboard data..." size="lg" />
      </Layout>
    );
  }

  return (
    <Layout>
      <Card className="p-6">
        <ClientsHeader 
          clientCount={clients.length} 
          onAddNewClient={handleAddNewClient} 
        />
        
        {getStatusSummary()}
        
        <ClientsTabs 
          activeTab={activeTab} 
          onTabChange={handleTabChange} 
          forceReload={forceReload}
        />
      </Card>
    </Layout>
  );
}

