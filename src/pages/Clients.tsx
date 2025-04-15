
import { Layout } from "@/components/Layout/Layout";
import { useState, useEffect } from "react";
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
import { STORAGE_KEYS } from "@/utils/persistence";

export default function Clients() {
  const [activeTab, setActiveTab] = useState("all");
  const [forceReload, setForceReload] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { loadPersistedData } = useKanbanStore();

  // Force reload data when localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      setForceReload(prev => prev + 1);
      console.log("Forcing Clients.tsx to reload data");
    };
    
    // Listen for both the storage event and our custom event
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('storageUpdated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('storageUpdated', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    // Initialize the kanban store when the component mounts
    try {
      // Enable data persistence
      localStorage.setItem("persistDashboard", "true");
      
      // Load the kanban data
      loadPersistedData();
      console.log("Kanban store initialized in Clients.tsx");
    } catch (error) {
      console.error("Error initializing kanban store:", error);
      toast({
        title: "Error Loading Students",
        description: "There was an issue loading the student data. Please refresh the page.",
        variant: "destructive",
      });
    }
  }, [loadPersistedData, toast, forceReload]);

  const handleAddNewClient = () => {
    navigate("/add-client");
  };

  return (
    <Layout>
      <div className="space-y-4 pb-12 w-full">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="text-lg font-bold">Clients Management</div>
          <Button 
            onClick={handleAddNewClient}
            className="bg-red-600 hover:bg-red-700 px-6 py-2.5 text-base"
            size="lg"
          >
            <PlusCircle className="mr-2 h-5 w-5" /> Add New Client
          </Button>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
            <EnhancedKanbanBoard key={`kanban-${forceReload}`} fullScreen={false} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
