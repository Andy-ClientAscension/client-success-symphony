
import { useState, useEffect } from "react";
import { AlertTriangle, DollarSign, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { monitorPayments, PaymentStatus } from "@/lib/payment-monitor";
import { getAllClients } from "@/lib/data";
import { Badge } from "@/components/ui/badge";

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
      <CardHeader className="p-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[0.6rem] flex items-center">
            <DollarSign className="h-1.5 w-1.5 mr-0.5 text-red-600" />
            Payment Alerts
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={checkPayments} 
            disabled={isLoading}
            className="h-3 text-[6px] px-0.5 py-0"
          >
            <RefreshCw className={`h-1.5 w-1.5 mr-0.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 pt-0">
        {overduePayments.length > 0 ? (
          <div className="space-y-0.5 text-[5px]">
            {overduePayments.map((payment) => (
              <Alert key={payment.clientId} variant="destructive" className="p-0.5">
                <AlertTriangle className="h-1.5 w-1.5" />
                <AlertTitle className="flex items-center justify-between text-[6px]">
                  <span>{payment.clientName}</span>
                  <Badge variant="destructive" className="text-[5px] px-0.5 py-0">{payment.daysOverdue} days</Badge>
                </AlertTitle>
                <AlertDescription className="flex justify-between items-center mt-0.5 text-[5px]">
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
          <div className="text-center py-1 text-[6px] text-muted-foreground">
            <p>All client payments are up to date</p>
            <p className="text-[5px] mt-0.5">Last checked: {new Date().toLocaleString()}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
