
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MessageSquare, CreditCard, BarChart } from "lucide-react";
import { format } from "date-fns";
import { Client } from "@/lib/data";

interface ClientDetailsProps {
  client: Client;
}

export function ClientDetails({ client }: ClientDetailsProps) {
  const getStatusColor = (status: Client['status']) => {
    switch (status) {
      case 'active':
        return 'bg-success-100 text-success-800 hover:bg-success-200';
      case 'at-risk':
        return 'bg-warning-100 text-warning-800 hover:bg-warning-200';
      case 'churned':
        return 'bg-danger-100 text-danger-800 hover:bg-danger-200';
      case 'new':
        return 'bg-brand-100 text-brand-800 hover:bg-brand-200';
      default:
        return '';
    }
  };
  
  const getProgressColor = (progress: number) => {
    if (progress >= 70) return 'bg-success-500';
    if (progress >= 40) return 'bg-warning-500';
    return 'bg-danger-500';
  };
  
  const getNPSColor = (score: number | null) => {
    if (score === null) return '';
    if (score >= 8) return 'text-success-600';
    if (score >= 6) return 'text-warning-600';
    return 'text-danger-600';
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Client Details</CardTitle>
        <Badge className={getStatusColor(client.status)}>
          {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
              {client.logo ? (
                <img src={client.logo} alt={client.name} className="h-full w-full rounded-full object-cover" />
              ) : (
                <span className="text-2xl font-bold">{client.name.charAt(0)}</span>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold">{client.name}</h2>
              <p className="text-sm text-muted-foreground">Client since {format(new Date(client.lastPayment.date), 'MMMM yyyy')}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-muted-foreground">Progress</span>
              <div className="flex items-center gap-2">
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${getProgressColor(client.progress)}`} 
                    style={{ width: `${client.progress}%` }} 
                  />
                </div>
                <span className="text-sm font-medium">{client.progress}%</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-muted-foreground">NPS Score</span>
              <span className={`text-2xl font-bold ${getNPSColor(client.npsScore)}`}>
                {client.npsScore !== null ? client.npsScore : 'N/A'}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-brand-600" />
                <span className="font-medium">End Date</span>
              </div>
              <p>{format(new Date(client.endDate), 'MMM dd, yyyy')}</p>
            </div>
            
            <div className="border rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="h-4 w-4 text-brand-600" />
                <span className="font-medium">Last Communication</span>
              </div>
              <p>{format(new Date(client.lastCommunication), 'MMM dd, yyyy')}</p>
            </div>
            
            <div className="border rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="h-4 w-4 text-brand-600" />
                <span className="font-medium">Last Payment</span>
              </div>
              <p>${client.lastPayment.amount} • {format(new Date(client.lastPayment.date), 'MMM dd, yyyy')}</p>
            </div>
            
            <div className="border rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <BarChart className="h-4 w-4 text-brand-600" />
                <span className="font-medium">Lifetime Value</span>
              </div>
              <p>${client.lastPayment.amount * 12}</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button>Contact</Button>
            <Button variant="outline">View History</Button>
            <Button variant="outline">Add Note</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
