
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
    <div className="flex items-center gap-2 mt-2 text-xs">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
          <span className="font-medium text-red-600">Payment Due</span>
        </div>
        <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 px-2 py-0 text-[10px]">
          {paymentStatus.daysOverdue} days
        </Badge>
      </div>
      
      {paymentStatus.amountDue && (
        <div className="text-xs font-medium text-gray-700 mt-0.5 flex items-center">
          <DollarSign className="h-3 w-3 mr-1 text-gray-500" />
          {paymentStatus.amountDue.toFixed(2)}
        </div>
      )}
    </div>
  );
}
