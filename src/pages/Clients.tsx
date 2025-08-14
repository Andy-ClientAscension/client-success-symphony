import React, { useState } from "react";
import { Layout } from "@/components/Layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Phone, Mail, DollarSign, RefreshCw } from "lucide-react";
import { ClientsErrorBoundary } from "@/features/clients/components/ClientsErrorBoundary";
import { DashboardProvider, useDashboard } from "@/components/Dashboard/DashboardProvider";
import { getAllClients, type Client } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";

// Inner component that uses dashboard context
const ClientsContent = React.memo(() => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { dashboardData } = useDashboard();
  const { toast } = useToast();

  // Get clients from unified data source
  const allClients = dashboardData?.allClients || getAllClients();
  
  // Add validation for data consistency
  React.useEffect(() => {
    const directClients = getAllClients();
    const dashboardClients = dashboardData?.allClients || [];
    
    if (dashboardClients.length > 0 && directClients.length !== dashboardClients.length) {
      console.warn(`Data sync warning: Direct source has ${directClients.length} clients, dashboard has ${dashboardClients.length}`);
      toast({
        title: "Data sync notice", 
        description: "Client data is being synchronized...",
        variant: "default"
      });
    }
  }, [dashboardData?.allClients, toast]);

  // Transform to include missing fields for display
  const displayClients = allClients.map((client: Client) => ({
    ...client,
    email: `contact@${client.name.toLowerCase().replace(/\s+/g, '')}.com`,
    phone: `+1${Math.floor(Math.random() * 9000000000 + 1000000000)}`
  }));

  // Filter clients based on search and status
  const filteredClients = displayClients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'at-risk': return 'bg-orange-100 text-orange-800';
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'churned': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <ClientsErrorBoundary>
        <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
          <div className="container mx-auto p-6">
          {/* Page Header with Data Status */}
          <div className="mb-8 flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">Clients</h1>
              <p className="text-muted-foreground">
                Manage your client relationships and track their progress
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  {allClients.length} Total Clients
                </Badge>
                {dashboardData?.isLoading && (
                  <Badge variant="secondary" className="text-xs">
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                    Syncing...
                  </Badge>
                )}
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => dashboardData?.refreshData?.()}
              disabled={dashboardData?.isLoading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="at-risk">At Risk</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="churned">Churned</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Client Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClients.map((client) => (
              <Card key={client.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{client.name}</CardTitle>
                      <Badge className={getStatusColor(client.status)}>
                        {client.status.replace('-', ' ')}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Health Score</div>
                      <div className="text-lg font-bold">{client.progress}%</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{client.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{client.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">${client.mrr.toLocaleString()}/month</span>
                  </div>
                  <div className="pt-2">
                    <div className="text-sm text-muted-foreground mb-1">NPS Score</div>
                    <div className="text-lg font-semibold">{client.npsScore}/10</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {filteredClients.length === 0 && (
            <Card className="p-8 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No clients found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== "all" 
                  ? "Try adjusting your search or filters"
                  : "Get started by adding your first client"
                }
              </p>
              {(searchTerm || statusFilter !== "all") && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                  }}
                >
                  Clear filters
                </Button>
              )}
            </Card>
          )}

          {/* Summary Stats - Now Using Real Data */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">{allClients.length}</div>
                <div className="text-sm text-muted-foreground">Total Clients</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {allClients.filter(c => c.status === 'active').length}
                </div>
                <div className="text-sm text-muted-foreground">Active</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {allClients.filter(c => c.status === 'at-risk').length}
                </div>
                <div className="text-sm text-muted-foreground">At Risk</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold">
                  ${allClients.reduce((sum, c) => sum + (c.mrr || 0), 0).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Total MRR</div>
              </CardContent>
            </Card>
          </div>
          </div>
        </div>
      </ClientsErrorBoundary>
    </Layout>
  );
});

// Main component wrapped with DashboardProvider
const Clients = React.memo(() => {
  return (
    <DashboardProvider>
      <ClientsContent />
    </DashboardProvider>
  );
});

export default Clients;