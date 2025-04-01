
import { useState, useEffect } from "react";
import { AlertTriangle, DollarSign, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { monitorPayments, PaymentStatus } from "@/lib/payment-monitor";
import { getAllClients } from "@/lib/data";
import { ScrollArea } from "@/components/ui/scroll-area";

export function PaymentAlerts() {
  const [overduePayments, setOverduePayments] = useState<PaymentStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const checkPayments = async () => {
    setIsLoading(true);
    try {
      const clients = getAllClients();
      const overdue = await monitorPayments(clients);
      
      setOverduePayments(overdue);
      
      if (overdue.length > 0) {
        toast({
          title: "Payment Alert",
          description: `${overdue.length} client(s) have overdue payments`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Payment Status",
          description: "All client payments are up to date",
        });
      }
    } catch (error) {
      console.error("Error monitoring payments:", error);
      toast({
        title: "Error",
        description: "Failed to check payment statuses",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial check when component loads
    checkPayments();
    
    // Set up periodic checks (every hour)
    const intervalId = setInterval(checkPayments, 60 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  return (
    <Card className="h-auto mb-2">
      <CardHeader className="flex flex-row justify-between items-center p-2 border-b">
        <CardTitle className="text-sm flex items-center font-medium">
          <DollarSign className="h-4 w-4 mr-1 text-red-600" />
          Payment Alerts
        </CardTitle>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={checkPayments} 
          disabled={isLoading}
          className="h-6 text-xs px-2 py-0 text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent className="p-2">
        <ScrollArea className="h-[150px]">
          {overduePayments.length > 0 ? (
            <div className="space-y-1">
              {overduePayments.map((payment) => (
                <div key={payment.clientId} className="flex justify-between items-center p-1.5 mb-1 border-b border-red-100">
                  <div className="flex items-center">
                    <AlertTriangle className="h-3 w-3 text-red-600 mr-2 flex-shrink-0" />
                    <span className="text-xs font-medium truncate max-w-[120px]">
                      {payment.clientName}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Badge variant="destructive" className="text-xs px-1.5 py-0 mr-1.5">
                      {payment.daysOverdue}d
                    </Badge>
                    <span className="text-xs font-semibold text-red-600 whitespace-nowrap">
                      ${payment.amountDue?.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-xs text-muted-foreground">
              <p>All client payments are up to date</p>
              <p className="text-xs mt-1">Last checked: {new Date().toLocaleString()}</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
