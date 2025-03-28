
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
    <Card className="border border-red-100">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl flex items-center">
          <DollarSign className="h-5 w-5 mr-2 text-red-600" />
          Payment Alerts
        </CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={checkPayments} 
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {overduePayments.length > 0 ? (
          <div className="space-y-3">
            {overduePayments.map((payment) => (
              <Alert key={payment.clientId} variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle className="flex items-center justify-between">
                  <span>{payment.clientName}</span>
                  <Badge variant="destructive">{payment.daysOverdue} days overdue</Badge>
                </AlertTitle>
                <AlertDescription className="flex justify-between items-center mt-2">
                  <span>
                    Last payment: {payment.lastPaymentDate 
                      ? new Date(payment.lastPaymentDate).toLocaleDateString() 
                      : 'No record'}
                  </span>
                  <span className="font-semibold">
                    ${payment.amountDue?.toFixed(2)} due
                  </span>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <p>All client payments are up to date</p>
            <p className="text-sm mt-1">Last checked: {new Date().toLocaleString()}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
