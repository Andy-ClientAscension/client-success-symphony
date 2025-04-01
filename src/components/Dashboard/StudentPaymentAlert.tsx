
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { PaymentStatus } from '@/utils/kanbanStore';
import { formatDistanceToNow } from 'date-fns';

interface StudentPaymentAlertProps {
  paymentStatus: PaymentStatus;
}

export function StudentPaymentAlert({ paymentStatus }: StudentPaymentAlertProps) {
  if (!paymentStatus.isOverdue) return null;
  
  return (
    <div className="flex items-center justify-between w-full mt-1.5 text-xs">
      <div className="text-xs font-medium text-gray-700 flex items-center gap-1">
        {paymentStatus.amountDue && (
          <span className="text-gray-500">${paymentStatus.amountDue.toFixed(2)}</span>
        )}
        {paymentStatus.lastPaymentDate && (
          <span className="text-gray-400 text-[10px]">
            (last payment: {formatDistanceToNow(new Date(paymentStatus.lastPaymentDate))} ago)
          </span>
        )}
      </div>
      
      <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 px-2 py-0 text-[10px]">
        {paymentStatus.daysOverdue} days overdue
      </Badge>
    </div>
  );
}
