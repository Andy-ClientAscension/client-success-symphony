
import React from 'react';
import { DollarSign } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { PaymentStatus } from '@/lib/payment-monitor';

interface StudentPaymentAlertProps {
  paymentStatus: PaymentStatus;
}

export function StudentPaymentAlert({ paymentStatus }: StudentPaymentAlertProps) {
  if (!paymentStatus.isOverdue) return null;
  
  return (
    <div className="flex items-center justify-between w-full mt-1.5 text-xs">
      {paymentStatus.amountDue && (
        <div className="text-xs font-medium text-gray-700 flex items-center">
          <span className="text-gray-500">${paymentStatus.amountDue.toFixed(2)}</span>
        </div>
      )}
      
      <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 px-2 py-0 text-[10px]">
        {paymentStatus.daysOverdue} days overdue
      </Badge>
    </div>
  );
}
