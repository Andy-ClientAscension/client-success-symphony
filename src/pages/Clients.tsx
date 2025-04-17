
import { Layout } from "@/components/Layout/Layout";
import { useState, useEffect, useCallback, useMemo } from "react";
import { ClientList } from "@/components/Dashboard/ClientList";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PlusCircle, BarChart2 } from "lucide-react";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { TeamAnalytics } from "@/components/Dashboard/TeamAnalytics";
import { EnhancedKanbanBoard } from "@/components/Dashboard/EnhancedKanbanBoard";
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

  // Memoize the client count
  const clientCount = useMemo(() => clients.length, [clients]);

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
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="text-lg font-bold">Clients Management ({clientCount})</div>
          <Button 
            onClick={handleAddNewClient}
            className="bg-red-600 hover:bg-red-700 px-6 py-2.5 text-base"
            size="lg"
          >
            <PlusCircle className="mr-2 h-5 w-5" /> Add New Client
          </Button>
        </div>
        
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <div className="overflow-x-auto border-b mb-4">
            <TabsList className="w-full md:w-auto justify-start bg-transparent p-0 flex-nowrap mb-0">
              <TabsTrigger 
                value="all" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 rounded-none px-3 py-1 bg-transparent text-xs whitespace-nowrap"
              >
                All Clients
              </TabsTrigger>
              <TabsTrigger 
                value="active" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 rounded-none px-3 py-1 bg-transparent text-xs whitespace-nowrap"
              >
                Active
              </TabsTrigger>
              <TabsTrigger 
                value="at-risk" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 rounded-none px-3 py-1 bg-transparent text-xs whitespace-nowrap"
              >
                At Risk
              </TabsTrigger>
              <TabsTrigger 
                value="new" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 rounded-none px-3 py-1 bg-transparent text-xs whitespace-nowrap"
              >
                New
              </TabsTrigger>
              <TabsTrigger 
                value="churned" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 rounded-none px-3 py-1 bg-transparent text-xs whitespace-nowrap"
              >
                Churned
              </TabsTrigger>
              <TabsTrigger 
                value="team-health" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 rounded-none px-3 py-1 bg-transparent text-xs whitespace-nowrap"
              >
                <BarChart2 className="h-3 w-3 mr-1" />
                Team Health
              </TabsTrigger>
              <TabsTrigger 
                value="student-tracking" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-red-600 data-[state=active]:text-red-600 rounded-none px-3 py-1 bg-transparent text-xs whitespace-nowrap"
              >
                Student Tracking
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* Use key prop to force remount components only when needed */}
          <TabsContent value="all" className="m-0">
            <ClientList key={`all-${forceReload}`} />
          </TabsContent>
          
          <TabsContent value="active" className="m-0">
            <ClientList key={`active-${forceReload}`} statusFilter="active" />
          </TabsContent>
          
          <TabsContent value="at-risk" className="m-0">
            <ClientList key={`at-risk-${forceReload}`} statusFilter="at-risk" />
          </TabsContent>
          
          <TabsContent value="new" className="m-0">
            <ClientList key={`new-${forceReload}`} statusFilter="new" />
          </TabsContent>
          
          <TabsContent value="churned" className="m-0">
            <ClientList key={`churned-${forceReload}`} statusFilter="churned" />
          </TabsContent>
          
          <TabsContent value="team-health" className="m-0">
            <TeamAnalytics key={`team-health-${forceReload}`} />
          </TabsContent>
          
          <TabsContent value="student-tracking" className="m-0 p-0">
            <EnhancedKanbanBoard key={`kanban-${forceReload}`} fullScreen={false} clients={clients} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
