import React from 'react';
import { Shield, ShieldAlert, ShieldCheck, AlertTriangle, DollarSign, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface RiskIndicatorProps {
  riskLevel: 'high' | 'medium' | 'low' | 'none';
  className?: string;
  showIcon?: boolean;
  size?: 'sm' | 'default' | 'lg';
}

interface PaymentIndicatorProps {
  paymentStatus: 'paid' | 'unpaid' | 'overdue';
  lastPaymentDate?: string;
  className?: string;
  showIcon?: boolean;
  size?: 'sm' | 'default' | 'lg';
}

export function RiskIndicator({ riskLevel, className, showIcon = true, size = 'default' }: RiskIndicatorProps) {
  const getRiskConfig = (level: string) => {
    switch (level) {
      case 'high':
        return {
          label: 'At Risk',
          color: 'bg-risk-high text-white',
          icon: <AlertTriangle className="h-3 w-3" />
        };
      case 'medium':
        return {
          label: 'Medium Risk',
          color: 'bg-risk-medium text-white',
          icon: <ShieldAlert className="h-3 w-3" />
        };
      case 'low':
      case 'none':
        return {
          label: 'No Risk',
          color: 'bg-risk-low text-white',
          icon: <ShieldCheck className="h-3 w-3" />
        };
      default:
        return {
          label: 'Unknown',
          color: 'bg-muted text-muted-foreground',
          icon: <Shield className="h-3 w-3" />
        };
    }
  };

  const config = getRiskConfig(riskLevel);
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    default: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5'
  };

  return (
    <Badge 
      className={cn(
        config.color,
        sizeClasses[size],
        'gap-1 font-medium border-0',
        className
      )}
    >
      {showIcon && config.icon}
      {config.label}
    </Badge>
  );
}

export function PaymentIndicator({ paymentStatus, lastPaymentDate, className, showIcon = true, size = 'default' }: PaymentIndicatorProps) {
  const getPaymentConfig = (status: string) => {
    switch (status) {
      case 'paid':
        return {
          label: 'Paid',
          color: 'bg-payment-paid text-white',
          icon: <DollarSign className="h-3 w-3" />
        };
      case 'unpaid':
        return {
          label: 'Not Paid',
          color: 'bg-payment-unpaid text-white',
          icon: <XCircle className="h-3 w-3" />
        };
      case 'overdue':
        return {
          label: 'Overdue',
          color: 'bg-payment-overdue text-white animate-pulse',
          icon: <AlertTriangle className="h-3 w-3" />
        };
      default:
        return {
          label: 'Unknown',
          color: 'bg-muted text-muted-foreground',
          icon: <DollarSign className="h-3 w-3" />
        };
    }
  };

  const config = getPaymentConfig(paymentStatus);
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    default: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5'
  };

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <Badge 
        className={cn(
          config.color,
          sizeClasses[size],
          'gap-1 font-medium border-0'
        )}
      >
        {showIcon && config.icon}
        {config.label}
      </Badge>
      {lastPaymentDate && paymentStatus === 'paid' && (
        <span className="text-xs text-muted-foreground">
          Last: {new Date(lastPaymentDate).toLocaleDateString()}
        </span>
      )}
    </div>
  );
}

// Helper function to determine risk level based on client data
export function calculateRiskLevel(client: any): 'high' | 'medium' | 'low' | 'none' {
  const healthScore = client.health_score || 0;
  const npsScore = client.npsScore || 0;
  const growth = client.growth || 0;
  
  // High risk conditions
  if (healthScore < 50 || npsScore < 0 || growth < -10) {
    return 'high';
  }
  
  // Medium risk conditions
  if (healthScore < 70 || npsScore < 5 || growth < 0) {
    return 'medium';
  }
  
  // Low risk or no risk
  return 'low';
}

// Helper function to determine payment status
export function calculatePaymentStatus(client: any): 'paid' | 'unpaid' | 'overdue' {
  const lastPayment = client.lastPayment;
  
  if (!lastPayment || !lastPayment.date) {
    return 'unpaid';
  }
  
  const lastPaymentDate = new Date(lastPayment.date);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  // If last payment was more than 30 days ago, consider overdue
  if (lastPaymentDate < thirtyDaysAgo) {
    return 'overdue';
  }
  
  return 'paid';
}