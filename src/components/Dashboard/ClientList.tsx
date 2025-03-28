import { useState } from "react";
import { MoreHorizontal, ChevronRight, PlusCircle } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Client, getAllClients } from "@/lib/data";

export function ClientList() {
  const [clients] = useState<Client[]>(getAllClients());
  const navigate = useNavigate();
  
  const getStatusBadge = (status: Client['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-success-100 text-success-800 hover:bg-success-200">Active</Badge>;
      case 'at-risk':
        return <Badge className="bg-warning-100 text-warning-800 hover:bg-warning-200">At Risk</Badge>;
      case 'churned':
        return <Badge className="bg-danger-100 text-danger-800 hover:bg-danger-200">Churned</Badge>;
      case 'new':
        return <Badge className="bg-brand-100 text-brand-800 hover:bg-brand-200">New</Badge>;
      default:
        return null;
    }
  };
  
  const getDaysRemaining = (endDate: string) => {
    const days = differenceInDays(new Date(endDate), new Date());
    if (days < 0) return 'Expired';
    return `${days} days`;
  };
  
  const getProgressColor = (progress: number) => {
    if (progress >= 70) return 'bg-success-500';
    if (progress >= 40) return 'bg-warning-500';
    return 'bg-danger-500';
  };
  
  const handleAddNewClient = () => {
    navigate("/add-client");
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Client Overview</CardTitle>
        <Button 
          onClick={handleAddNewClient}
          className="bg-red-600 hover:bg-red-700"
        >
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Client
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Last Communication</TableHead>
                <TableHead>Last Payment</TableHead>
                <TableHead>NPS</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>{getStatusBadge(client.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${getProgressColor(client.progress)}`} 
                          style={{ width: `${client.progress}%` }} 
                        />
                      </div>
                      <span className="text-xs">{client.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{format(new Date(client.endDate), 'MMM dd, yyyy')}</span>
                      <span className="text-xs text-muted-foreground">{getDaysRemaining(client.endDate)}</span>
                    </div>
                  </TableCell>
                  <TableCell>{format(new Date(client.lastCommunication), 'MMM dd, yyyy')}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>${client.lastPayment.amount}</span>
                      <span className="text-xs text-muted-foreground">{format(new Date(client.lastPayment.date), 'MMM dd, yyyy')}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {client.npsScore !== null ? (
                      <Badge className={
                        client.npsScore >= 8 ? "bg-success-100 text-success-800" :
                        client.npsScore >= 6 ? "bg-warning-100 text-warning-800" :
                        "bg-danger-100 text-danger-800"
                      }>
                        {client.npsScore}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Contact Client</DropdownMenuItem>
                          <DropdownMenuItem>Edit Information</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
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
