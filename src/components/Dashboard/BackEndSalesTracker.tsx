
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, FileText, ThumbsUp, ThumbsDown, PieChart, BarChart3 } from "lucide-react";
import { format } from "date-fns";
import { MOCK_CLIENTS } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";

// Define the structure for back-end sales data
interface BackEndSale {
  id: string;
  clientId: string;
  clientName: string;
  status: "renewed" | "churned";
  renewalDate: Date;
  notes: string;
  painPoints: string[];
}

// Define the form data structure
interface ChurnNotesFormData {
  notes: string;
  painPoints: string;
}

export function BackEndSalesTracker() {
  const [backEndSales, setBackEndSales] = useState<BackEndSale[]>([]);
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();
  
  const form = useForm<ChurnNotesFormData>({
    defaultValues: {
      notes: "",
      painPoints: ""
    },
  });
  
  // Initialize with mock data based on the client renewals
  useEffect(() => {
    // Generate random back-end sales data
    const today = new Date();
    const mockSales: BackEndSale[] = MOCK_CLIENTS.slice(0, 30).map(client => {
      // Randomly determine if the client renewed or churned
      const status = Math.random() > 0.3 ? "renewed" : "churned";
      
      // Create a date in the past for the renewal
      const randomDays = Math.floor(Math.random() * 90);
      const renewalDate = new Date(today);
      renewalDate.setDate(renewalDate.getDate() - randomDays);
      
      return {
        id: `bsale-${client.id}`,
        clientId: client.id,
        clientName: client.name,
        status,
        renewalDate,
        notes: status === "churned" ? "Client decided not to continue." : "",
        painPoints: status === "churned" 
          ? ["Price too high", "Not seeing value", "Changed business needs"].filter(() => Math.random() > 0.5)
          : []
      };
    });
    
    setBackEndSales(mockSales);
  }, []);
  
  // Calculate metrics
  const totalClients = backEndSales.length;
  const renewedClients = backEndSales.filter(sale => sale.status === "renewed").length;
  const churnedClients = backEndSales.filter(sale => sale.status === "churned").length;
  const renewalRate = totalClients > 0 ? (renewedClients / totalClients) * 100 : 0;
  
  // Filter clients based on active tab
  const filteredSales = backEndSales.filter(sale => {
    if (activeTab === "all") return true;
    return sale.status === activeTab;
  });
  
  // Handle form submission for churn notes
  const handleNotesSubmit = (data: ChurnNotesFormData) => {
    if (!selectedClient) return;
    
    // Update the selected client's notes and pain points
    setBackEndSales(prev => prev.map(sale => {
      if (sale.clientId === selectedClient) {
        return {
          ...sale,
          notes: data.notes,
          painPoints: data.painPoints.split(',').map(point => point.trim())
        };
      }
      return sale;
    }));
    
    toast({
      title: "Notes Updated",
      description: "Client churn notes have been saved successfully",
    });
    
    // Reset the form
    form.reset();
    setSelectedClient(null);
  };
  
  // Load client data into form when selected
  const handleSelectClient = (clientId: string) => {
    const client = backEndSales.find(sale => sale.clientId === clientId);
    if (client) {
      setSelectedClient(clientId);
      form.setValue("notes", client.notes);
      form.setValue("painPoints", client.painPoints.join(", "));
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Back End Sales Tracking
        </CardTitle>
        <CardDescription>
          Track client renewals, churn, and identify pain points to improve retention
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <ThumbsUp className="h-8 w-8 text-green-500 mb-2" />
                <p className="text-lg font-semibold">{renewedClients}</p>
                <p className="text-sm text-muted-foreground">Renewed Clients</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <ThumbsDown className="h-8 w-8 text-red-500 mb-2" />
                <p className="text-lg font-semibold">{churnedClients}</p>
                <p className="text-sm text-muted-foreground">Churned Clients</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center">
                <PieChart className="h-8 w-8 text-blue-500 mb-2" />
                <p className="text-lg font-semibold">{renewalRate.toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground">Renewal Rate</p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs onValueChange={setActiveTab} value={activeTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Clients</TabsTrigger>
            <TabsTrigger value="renewed">Renewed</TabsTrigger>
            <TabsTrigger value="churned">Churned</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client Name</TableHead>
                      <TableHead>Renewal Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSales.length > 0 ? (
                      filteredSales.map((sale) => (
                        <TableRow key={sale.id}>
                          <TableCell className="font-medium">{sale.clientName}</TableCell>
                          <TableCell>{format(sale.renewalDate, "MMM d, yyyy")}</TableCell>
                          <TableCell>
                            <Badge
                              variant={sale.status === "renewed" ? "outline" : "destructive"}
                            >
                              {sale.status === "renewed" ? "Renewed" : "Churned"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {sale.status === "churned" && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleSelectClient(sale.clientId)}
                                disabled={selectedClient === sale.clientId}
                              >
                                <FileText className="h-4 w-4 mr-1" />
                                {sale.notes ? "Edit Notes" : "Add Notes"}
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                          No clients found for the selected filter.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              
              <div>
                {selectedClient && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-medium flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Churn Notes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleNotesSubmit)} className="space-y-4">
                          <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Why did the client churn?</FormLabel>
                                <FormControl>
                                  <Textarea placeholder="Enter detailed notes about why the client churned..." {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="painPoints"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Pain Points (comma separated)</FormLabel>
                                <FormControl>
                                  <Textarea placeholder="Price too high, Not seeing value, etc..." {...field} />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" type="button" onClick={() => setSelectedClient(null)}>
                              Cancel
                            </Button>
                            <Button type="submit">Save Notes</Button>
                          </div>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
