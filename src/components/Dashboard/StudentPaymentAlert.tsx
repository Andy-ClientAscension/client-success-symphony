
import React from 'react';
import { AlertTriangle, DollarSign } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { PaymentStatus } from '@/lib/payment-monitor';

interface StudentPaymentAlertProps {
  paymentStatus: PaymentStatus;
}

export function StudentPaymentAlert({ paymentStatus }: StudentPaymentAlertProps) {
  if (!paymentStatus.isOverdue) return null;
  
  return (
    <Alert variant="destructive" className="mt-2 py-2 px-3">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4" />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Payment Overdue</span>
            <Badge variant="destructive">{paymentStatus.daysOverdue} days</Badge>
          </div>
          <AlertDescription className="text-xs mt-1">
            {paymentStatus.amountDue 
              ? `$${paymentStatus.amountDue.toFixed(2)} payment required`
              : 'Payment information required'}
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
}
