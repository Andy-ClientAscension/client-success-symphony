
import { useState, useEffect } from "react";
import { AlertTriangle, DollarSign, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { monitorPayments, PaymentStatus } from "@/lib/payment-monitor";
import { getAllClients } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
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
    <Card className="h-full">
      <CardHeader className="flex flex-row justify-between items-center p-2">
        <CardTitle className="text-sm flex items-center">
          <DollarSign className="h-4 w-4 mr-1 text-red-600" />
          Payment Alerts
        </CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={checkPayments} 
          disabled={isLoading}
          className="h-6 text-xs px-2 py-0"
        >
          <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent className="p-2">
        <ScrollArea className="h-[250px]">
          {overduePayments.length > 0 ? (
            <div className="space-y-2">
              {overduePayments.map((payment) => (
                <Alert key={payment.clientId} variant="destructive" className="p-2 mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  <div className="flex justify-between items-center">
                    <AlertTitle className="text-xs">
                      {payment.clientName}
                    </AlertTitle>
                    <Badge variant="destructive" className="text-xs px-1 py-0">{payment.daysOverdue} days</Badge>
                  </div>
                  <AlertDescription className="flex justify-between items-center mt-1 text-xs">
                    <span>
                      Last: {payment.lastPaymentDate 
                        ? new Date(payment.lastPaymentDate).toLocaleDateString() 
                        : 'No record'}
                    </span>
                    <span className="font-semibold">
                      ${payment.amountDue?.toFixed(2)}
                    </span>
                  </AlertDescription>
                </Alert>
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
