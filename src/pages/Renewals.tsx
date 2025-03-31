
import { useState } from "react";
import { Layout } from "@/components/Layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Calendar, Clock, Home, Users } from "lucide-react";
import { MOCK_CLIENTS } from "@/lib/data";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Link } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Available teams for filtering
const TEAMS = [
  { id: "all", name: "All Teams" },
  { id: "Team-Andy", name: "Team-Andy" },
  { id: "Team-Chris", name: "Team-Chris" },
  { id: "Team-Alex", name: "Team-Alex" },
  { id: "Team-Cillin", name: "Team-Cillin" },
];

// Calculate dummy renewal dates based on client ID
const renewals = MOCK_CLIENTS.map(client => {
  // Create a renewal date based on client ID (for demo purposes)
  const randomDaysOffset = parseInt(client.id) * 30;
  const today = new Date();
  
  // Create the renewalDate safely
  const renewalDate = new Date(today.getTime() + randomDaysOffset * 24 * 60 * 60 * 1000);
  
  // Calculate days until renewal
  const daysUntil = Math.ceil((renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  // Determine status based on days until renewal
  let status = "upcoming";
  if (daysUntil < 0) {
    status = "overdue";
  } else if (daysUntil < 30) {
    status = "soon";
  }
  
  return {
    id: client.id,
    clientName: client.name,
    renewalDate,
    daysUntil,
    status,
    price: `$${(Math.floor(Math.random() * 500) + 500).toLocaleString()}/year`,
    team: client.team || "Unassigned"
  };
}).sort((a, b) => a.daysUntil - b.daysUntil);

export default function Renewals() {
  const [filter, setFilter] = useState("all"); // Status filter
  const [selectedTeam, setSelectedTeam] = useState("all"); // Team filter
  
  const filteredRenewals = renewals
    .filter(renewal => filter === "all" || renewal.status === filter) // Filter by status
    .filter(renewal => selectedTeam === "all" || renewal.team === selectedTeam); // Filter by team
  
  return (
    <Layout>
      <ErrorBoundary>
        <div className="container py-6 max-w-6xl">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Client Renewals</h1>
              <p className="text-muted-foreground font-medium">Track and manage upcoming client contract renewals.</p>
            </div>
            <Button asChild variant="destructive" className="gap-2 text-white bg-red-600 hover:bg-red-700 text-base px-6 py-2">
              <Link to="/">
                <Home className="h-5 w-5" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
            <div className="flex gap-2 flex-wrap">
              <Badge 
                variant={filter === "all" ? "default" : "outline"} 
                className="cursor-pointer"
                onClick={() => setFilter("all")}
              >
                All
              </Badge>
              <Badge 
                variant={filter === "soon" ? "default" : "outline"} 
                className="cursor-pointer"
                onClick={() => setFilter("soon")}
              >
                Due Soon
              </Badge>
              <Badge 
                variant={filter === "upcoming" ? "default" : "outline"} 
                className="cursor-pointer"
                onClick={() => setFilter("upcoming")}
              >
                Upcoming
              </Badge>
              <Badge 
                variant={filter === "overdue" ? "default" : "outline"} 
                className="cursor-pointer"
                onClick={() => setFilter("overdue")}
              >
                Overdue
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                <SelectTrigger className="w-[180px] h-8 text-xs">
                  <SelectValue placeholder="Filter by team" />
                </SelectTrigger>
                <SelectContent>
                  {TEAMS.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Client Renewals</CardTitle>
              {selectedTeam !== "all" && (
                <Badge variant="outline" className="ml-2">
                  Team: {selectedTeam}
                </Badge>
              )}
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-foreground">Client</TableHead>
                    <TableHead className="text-foreground">Renewal Date</TableHead>
                    <TableHead className="text-foreground">Time Remaining</TableHead>
                    <TableHead className="text-foreground">Status</TableHead>
                    <TableHead className="text-right text-foreground">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRenewals.length > 0 ? (
                    filteredRenewals.map((renewal) => (
                      <TableRow key={renewal.id}>
                        <TableCell className="text-foreground font-medium">
                          <div>
                            <div className="font-medium">{renewal.clientName}</div>
                            <div className="text-xs text-muted-foreground">{renewal.team}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-foreground">
                          <div className="flex items-center">
                            <Calendar className="mr-2 h-4 w-4 text-primary" />
                            {format(renewal.renewalDate, "MMM d, yyyy")}
                          </div>
                        </TableCell>
                        <TableCell className="text-foreground">
                          <div className="flex items-center">
                            <Clock className="mr-2 h-4 w-4 text-primary" />
                            {renewal.daysUntil < 0 
                              ? `${Math.abs(renewal.daysUntil)} days overdue` 
                              : `${renewal.daysUntil} days remaining`}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            renewal.status === "overdue" ? "destructive" : 
                            renewal.status === "soon" ? "outline" : 
                            "secondary"
                          } className="font-medium">
                            {renewal.status === "soon" ? "Due Soon" : 
                             renewal.status === "overdue" ? "Overdue" : "Upcoming"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-foreground font-medium">{renewal.price}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                        No renewals found for the selected filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </ErrorBoundary>
    </Layout>
  );
}
