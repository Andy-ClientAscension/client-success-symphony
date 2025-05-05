
import { Layout } from "@/components/Layout/Layout";
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ClientsTabs } from "@/components/Dashboard/ClientsTabs";
import { ClientsHeader } from "@/components/Dashboard/ClientsHeader";
import { useToast } from "@/hooks/use-toast";
import { useKanbanStore } from "@/utils/kanbanStore";
import { STORAGE_KEYS, loadData, saveData } from "@/utils/persistence";
import { CriticalLoadingState } from "@/components/CriticalLoadingState";
import { getAllClients, Client } from "@/lib/data";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataSyncMonitor } from "@/components/Dashboard/DataSyncMonitor";
import { useSmartLoading } from "@/hooks/useSmartLoading";

export default function Clients() {
  const [activeTab, setActiveTab] = useState("all");
  const [forceReload, setForceReload] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [clients, setClients] = useState<Client[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { loadPersistedData } = useKanbanStore();
  const initializationAttempted = useRef(false);

  // Use smart loading to provide better UX
  const { isLoading: showLoading, forceShowLoading } = useSmartLoading(isLoading, {
    minLoadingTime: 1000,
    priority: 1
  });
  
  // Fix: Properly handle async/sync data operations with error handling
  const initializeClientData = useCallback(async () => {
    if (initializationAttempted.current) {
      console.log("Initialization already attempted, skipping");
      return;
    }
    
    console.log("Initializing client data...");
    initializationAttempted.current = true;
    setIsLoading(true);
    forceShowLoading();
    setError(null);
    
    try {
      // Enable data persistence
      localStorage.setItem("persistDashboard", "true");
      
      // Initialize client data if not already present
      const storedClients = loadData<Client[]>(STORAGE_KEYS.CLIENTS, []);
      
      if (!storedClients || !Array.isArray(storedClients) || storedClients.length === 0) {
        // Load default clients - wrapped in a try/catch to handle potential async issues
        try {
          // Get default clients - this is synchronous now but could be async in future
          const defaultClients = getAllClients();
          
          if (defaultClients && defaultClients.length > 0) {
            console.log(`Loaded ${defaultClients.length} default clients`);
            saveData(STORAGE_KEYS.CLIENTS, defaultClients);
            saveData(STORAGE_KEYS.CLIENT_STATUS, defaultClients);
            setClients(defaultClients);
          } else {
            console.warn("No default clients returned from getAllClients()");
            setClients([]);
          }
        } catch (dataError) {
          console.error("Error loading default client data:", dataError);
          toast({
            title: "Data Loading Error",
            description: "Failed to load default client data.",
            variant: "destructive",
          });
          setClients([]);
        }
      } else {
        console.log(`Loaded ${storedClients.length} clients from storage`);
        setClients(storedClients);
        
        // Ensure client data is saved to client status as well for new users
        if (localStorage.getItem(STORAGE_KEYS.CLIENT_STATUS) === null) {
          saveData(STORAGE_KEYS.CLIENT_STATUS, storedClients);
        }
      }
      
      // Load the kanban data - keep this in a separate try/catch to isolate errors
      try {
        await loadPersistedData();
        console.log("Kanban data loaded successfully");
      } catch (kanbanError) {
        console.error("Error loading kanban data:", kanbanError);
        // Don't block the UI if kanban data can't be loaded
        toast({
          title: "Warning",
          description: "Kanban board data couldn't be loaded properly.",
          variant: "default", // Fixed the invalid variant "warning" to "default"
        });
      }
    } catch (error) {
      console.error("Critical error initializing client data:", error);
      setError("Failed to load client data. Please refresh the page.");
      toast({
        title: "Error Loading Students",
        description: "There was an issue loading the student data. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      console.log("Setting isLoading to false after initialization");
      setIsLoading(false);
    }
  }, [loadPersistedData, toast, forceShowLoading]);

  // Initialize data only once on component mount
  useEffect(() => {
    console.log("Clients component mounted, calling initializeClientData");
    initializeClientData()
      .catch(err => {
        console.error("Unhandled error during client data initialization:", err);
        setIsLoading(false); // Ensure loading state is cleared even if there's an error
        setError("An unexpected error occurred. Please refresh the page.");
      });
  }, [initializeClientData]);

  // Optimize storage event handling with debouncing
  useEffect(() => {
    let debounceTimer: NodeJS.Timeout | null = null;
    
    const handleStorageChange = (event: StorageEvent | CustomEvent) => {
      const key = event instanceof StorageEvent ? event.key : (event as CustomEvent).detail?.key;
      
      // Only reload on relevant storage changes
      if (key === STORAGE_KEYS.CLIENTS || key === STORAGE_KEYS.CLIENT_STATUS || 
          key === STORAGE_KEYS.KANBAN || key === null) {
        
        // Debounce the reload to prevent multiple rapid updates
        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }
        
        debounceTimer = setTimeout(() => {
          console.log("Storage change detected in Clients.tsx:", key);
          
          // Reload clients from storage
          try {
            const updatedClients = loadData<Client[]>(STORAGE_KEYS.CLIENTS, []);
            if (updatedClients && updatedClients.length > 0) {
              setClients(updatedClients);
            }
            
            // Increment force reload counter to refresh child components
            setForceReload(prev => prev + 1);
          } catch (error) {
            console.error("Error processing storage change:", error);
          }
        }, 100);
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
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  }, []);

  const handleAddNewClient = useCallback(() => {
    navigate("/add-client");
  }, [navigate]);

  // Optimize tab change handling to prevent unnecessary rerenders
  const handleTabChange = useCallback((value: string) => {
    if (activeTab !== value) {
      setActiveTab(value);
      // Use requestAnimationFrame for smoother UI updates
      requestAnimationFrame(() => {
        setForceReload(prev => prev + 1);
      });
    }
  }, [activeTab]);

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

  // Use a more immediate loading indicator first
  if (showLoading && !clients.length) {
    console.log("Rendering initial loading state");
    return (
      <Layout>
        <CriticalLoadingState message="Loading clients..." isBlocking={true} />
      </Layout>
    );
  }

  if (error) {
    console.log("Rendering error state");
    return (
      <Layout>
        <Card className="p-6">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-destructive">Error Loading Data</h2>
            <p>{error}</p>
            <button 
              onClick={() => {
                initializationAttempted.current = false;
                initializeClientData();
              }}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Retry
            </button>
          </div>
        </Card>
      </Layout>
    );
  }

  console.log("Rendering main clients UI, isLoading:", isLoading);
  return (
    <Layout>
      <div className="mb-4">
        <DataSyncMonitor />
      </div>
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
