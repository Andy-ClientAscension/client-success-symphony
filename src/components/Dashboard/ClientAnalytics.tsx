
import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAllClients } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, TrendingUp, Calendar, Phone, DollarSign } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function ClientAnalytics() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const clients = getAllClients();
  
  const filteredClients = useMemo(() => {
    if (!searchQuery.trim()) return clients;
    
    const query = searchQuery.toLowerCase().trim();
    return clients.filter(client => 
      client.name.toLowerCase().includes(query) || 
      (client.csm && client.csm.toLowerCase().includes(query))
    );
  }, [clients, searchQuery]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case 'at-risk': return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
      case 'churned': return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case 'new': return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Client Analytics</CardTitle>
          <div className="w-[240px]">
            <Input
              placeholder="Search clients or CSMs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 text-xs"
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>CSM</TableHead>
                <TableHead>MRR</TableHead>
                <TableHead>Calls</TableHead>
                <TableHead>Reviews</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`${getStatusColor(client.status)}`}>
                      {client.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Progress value={client.progress} className="h-2 w-16 mr-2" />
                      <span className="text-xs">{client.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>{client.csm || "Unassigned"}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <DollarSign className="h-3 w-3 mr-1 text-green-600" />
                      {client.mrr}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Phone className="h-3 w-3 mr-1 text-blue-600" />
                      {client.callsBooked}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center" title="TrustPilot Review">
                        {client.trustPilotReview?.rating ? 
                          <CheckCircle className="h-4 w-4 text-green-600" /> :
                          <XCircle className="h-4 w-4 text-gray-400" />
                        }
                      </div>
                      <div className="flex items-center" title="Case Study">
                        {client.caseStudyInterview?.completed ? 
                          <CheckCircle className="h-4 w-4 text-green-600" /> :
                          <XCircle className="h-4 w-4 text-gray-400" />
                        }
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button asChild variant="outline" size="sm" className="h-7 text-xs">
                      <Link to={`/client/${client.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
