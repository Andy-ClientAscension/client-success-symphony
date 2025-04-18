
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
    console.log("Initializing client data in Clients.tsx");
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
          console.log(`Loading ${defaultClients.length} default clients in Clients.tsx`);
          saveData(STORAGE_KEYS.CLIENTS, defaultClients);
          saveData(STORAGE_KEYS.CLIENT_STATUS, defaultClients);
          setClients(defaultClients);
        } else {
          console.warn("No default clients available");
        }
      } else {
        console.log(`Loaded ${storedClients.length} clients from storage in Clients.tsx`);
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
    // Check if data was already loaded in this session
    const dataLoaded = sessionStorage.getItem('clientsPageDataLoaded');
    
    if (!dataLoaded) {
      initializeClientData();
      sessionStorage.setItem('clientsPageDataLoaded', 'true');
    } else {
      // Still load from storage but don't show loading screen
      const storedClients = loadData<Client[]>(STORAGE_KEYS.CLIENTS, []);
      if (storedClients && storedClients.length > 0) {
        setClients(storedClients);
      }
      setIsLoading(false);
    }
  }, [initializeClientData]);

  // Optimize storage event handling with debouncing
  useEffect(() => {
    let debounceTimer: ReturnType<typeof setTimeout>;
    
    const handleStorageChange = (event: StorageEvent | CustomEvent) => {
      const key = event instanceof StorageEvent ? event.key : (event as CustomEvent).detail?.key;
      
      // Only reload on relevant storage changes
      if (key === STORAGE_KEYS.CLIENTS || key === STORAGE_KEYS.CLIENT_STATUS || 
          key === STORAGE_KEYS.KANBAN || key === null) {
        
        // Debounce to prevent multiple rapid updates
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          console.log("Storage change detected in Clients.tsx:", key);
          
          // Reload clients from storage
          const updatedClients = loadData<Client[]>(STORAGE_KEYS.CLIENTS, []);
          if (updatedClients && updatedClients.length > 0) {
            setClients(updatedClients);
          }
          
          // Increment force reload counter to refresh child components
          setForceReload(prev => prev + 1);
        }, 300);
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
      clearTimeout(debounceTimer);
    };
  }, []);

  const handleAddNewClient = useCallback(() => {
    navigate("/add-client");
  }, [navigate]);

  // Optimize tab change handling
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
    // Use requestAnimationFrame instead of setTimeout for smoother transitions
    requestAnimationFrame(() => {
      setForceReload(prev => prev + 1);
    });
  }, []);

  if (isLoading) {
    return (
      <Layout>
        <LoadingState message="Loading dashboard data..." size="lg" />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4 pb-12 w-full">
        <ClientsHeader 
          clientCount={clients.length} 
          onAddNewClient={handleAddNewClient} 
        />
        
        <ClientsTabs 
          activeTab={activeTab} 
          onTabChange={handleTabChange} 
          forceReload={forceReload}
        />
      </div>
    </Layout>
  );
}
