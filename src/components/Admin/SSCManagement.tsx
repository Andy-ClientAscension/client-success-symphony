import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Search, UserCog, Trash2, Users, TrendingUp, AlertTriangle } from "lucide-react";
import { getAllClients } from "@/lib/data";

interface SSCData {
  name: string;
  totalStudents: number;
  activeStudents: number;
  newStudents: number;
  atRiskStudents: number;
  graduatedStudents: number;
  teams: string[];
}

export function SSCManagement() {
  const [sscData, setSSCData] = useState<SSCData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const mainSSCs = ["Andy", "Chris", "Cillin", "Nick", "Stephen"];

  useEffect(() => {
    fetchSSCData();
  }, []);

  const fetchSSCData = async () => {
    try {
      setLoading(true);
      const clients = getAllClients();
      
      const sscStats = mainSSCs.map(ssc => {
        const sscClients = clients.filter(client => 
          client.assigned_ssc === ssc || client.csm === ssc
        );
        
        const activeStudents = sscClients.filter(c => c.status === 'active').length;
        const newStudents = sscClients.filter(c => c.status === 'new').length;
        const atRiskStudents = sscClients.filter(c => c.status === 'at-risk').length;
        const graduatedStudents = sscClients.filter(c => c.status === 'graduated').length;
        const teams = [...new Set(sscClients.map(c => c.team).filter(Boolean))];

        return {
          name: ssc,
          totalStudents: sscClients.length,
          activeStudents,
          newStudents,
          atRiskStudents,
          graduatedStudents,
          teams
        };
      });

      setSSCData(sscStats);
    } catch (error) {
      console.error('Error fetching SSC data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch SSC data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const removeSSCFromStudents = async (sscName: string) => {
    try {
      // Update all students assigned to this SSC to remove the assignment
      const { error: updateError } = await supabase
        .from('clients')
        .update({ 
          assigned_ssc: null,
          csm: null 
        })
        .or(`assigned_ssc.eq.${sscName},csm.eq.${sscName}`);

      if (updateError) throw updateError;

      // Remove SSC capacity record if it exists
      const { error: deleteError } = await supabase
        .from('ssc_capacities')
        .delete()
        .eq('ssc_name', sscName);

      if (deleteError && deleteError.code !== 'PGRST116') { // Ignore "not found" error
        throw deleteError;
      }

      toast({
        title: "Success",
        description: `${sscName} has been removed and students have been unassigned`
      });

      fetchSSCData();
    } catch (error) {
      console.error('Error removing SSC:', error);
      toast({
        title: "Error",
        description: "Failed to remove SSC",
        variant: "destructive"
      });
    }
  };

  const filteredSSCs = sscData.filter(ssc =>
    ssc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getWorkloadBadge = (totalStudents: number) => {
    if (totalStudents === 0) return <Badge variant="outline">No Students</Badge>;
    if (totalStudents < 20) return <Badge variant="secondary">Light Load</Badge>;
    if (totalStudents < 40) return <Badge variant="default">Normal Load</Badge>;
    if (totalStudents < 60) return <Badge variant="warning">Heavy Load</Badge>;
    return <Badge variant="destructive">Overloaded</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>SSC Management</CardTitle>
          <CardDescription>Loading SSC data...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            SSC Management
          </CardTitle>
          <CardDescription>
            Manage Student Success Consultants and their workloads
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search SSCs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
            {filteredSSCs.map((ssc) => (
              <Card key={ssc.name} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{ssc.name}</CardTitle>
                    {getWorkloadBadge(ssc.totalStudents)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        Total Students
                      </span>
                      <span className="font-semibold">{ssc.totalStudents}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-green-600">Active</span>
                      <span>{ssc.activeStudents}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-blue-600">New</span>
                      <span>{ssc.newStudents}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-red-600">At Risk</span>
                      <span>{ssc.atRiskStudents}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-purple-600">Graduated</span>
                      <span>{ssc.graduatedStudents}</span>
                    </div>
                    {ssc.teams.length > 0 && (
                      <div className="pt-2">
                        <span className="text-xs text-muted-foreground">Teams:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {ssc.teams.map(team => (
                            <Badge key={team} variant="outline" className="text-xs">{team}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-destructive hover:text-destructive flex-1"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove SSC
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove SSC</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove {ssc.name} as an SSC? This will:
                            <ul className="list-disc list-inside mt-2 space-y-1">
                              <li>Unassign all {ssc.totalStudents} students from {ssc.name}</li>
                              <li>Remove {ssc.name} from the capacity tracking system</li>
                              <li>Require manual reassignment of students to other SSCs</li>
                            </ul>
                            <div className="mt-3 p-3 bg-destructive/10 rounded-md">
                              <div className="flex items-center gap-2 text-destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <span className="font-medium">This action cannot be undone</span>
                              </div>
                            </div>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => removeSSCFromStudents(ssc.name)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Remove SSC
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredSSCs.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No SSCs found matching your search.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}