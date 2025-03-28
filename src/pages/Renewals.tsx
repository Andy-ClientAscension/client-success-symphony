
import { useState } from "react";
import { Layout } from "@/components/Layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Calendar, Clock, Home } from "lucide-react";
import { MOCK_CLIENTS } from "@/lib/data";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Link } from "react-router-dom";

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
    price: `$${(Math.floor(Math.random() * 500) + 500).toLocaleString()}/year`
  };
}).sort((a, b) => a.daysUntil - b.daysUntil);

export default function Renewals() {
  const [filter, setFilter] = useState("all");
  
  const filteredRenewals = filter === "all" 
    ? renewals 
    : renewals.filter(renewal => renewal.status === filter);
  
  return (
    <Layout>
      <ErrorBoundary>
        <div className="container py-6 max-w-6xl">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Client Renewals</h1>
              <p className="text-muted-foreground">Track and manage upcoming client contract renewals.</p>
            </div>
            <Button asChild variant="destructive" className="gap-2">
              <Link to="/">
                <Home className="h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
          
          <div className="flex gap-2 mb-6">
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
          
          <Card>
            <CardHeader>
              <CardTitle>Client Renewals</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Renewal Date</TableHead>
                    <TableHead>Time Remaining</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRenewals.map((renewal) => (
                    <TableRow key={renewal.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{renewal.clientName}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                          {format(renewal.renewalDate, "MMM d, yyyy")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
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
                        }>
                          {renewal.status === "soon" ? "Due Soon" : 
                           renewal.status === "overdue" ? "Overdue" : "Upcoming"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{renewal.price}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </ErrorBoundary>
    </Layout>
  );
}
