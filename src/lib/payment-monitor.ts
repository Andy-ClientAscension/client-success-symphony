
import { apiIntegrations } from "./api";
import { useToast } from "@/hooks/use-toast";

// Interface for payment data
export interface PaymentStatus {
  clientId: string;
  clientName: string;
  lastPaymentDate: string | null;
  daysOverdue: number | null;
  amountDue: number | null;
  isOverdue: boolean;
}

// Check for overdue payments (days since last payment)
export const checkOverduePayments = async (
  clients: { id: string; name: string }[],
  dayThreshold: number = 30
): Promise<PaymentStatus[]> => {
  const paymentStatuses: PaymentStatus[] = [];
  
  for (const client of clients) {
    try {
      // Mock API call to Stripe - in a real implementation, 
      // this would be replaced with actual Stripe API call
      const response = await apiIntegrations.stripe.getPayments(client.id);
      
      if (!response.success) {
        throw new Error('Failed to fetch payment data');
      }
      
      // This is a placeholder for actual payment processing logic
      // In a real implementation, you would analyze the actual payment data
      const mockPayments = response.data || [];
      const hasRecentPayment = mockPayments.length > 0;
      
      // For demo purposes, we're creating mock data
      // This would be replaced with actual payment data analysis
      const lastPaymentDate = hasRecentPayment 
        ? new Date(Date.now() - Math.floor(Math.random() * 60) * 24 * 60 * 60 * 1000).toISOString()
        : null;
        
      const daysOverdue = lastPaymentDate 
        ? Math.floor((Date.now() - new Date(lastPaymentDate).getTime()) / (24 * 60 * 60 * 1000))
        : null;
        
      const isOverdue = daysOverdue !== null && daysOverdue > dayThreshold;
      
      paymentStatuses.push({
        clientId: client.id,
        clientName: client.name,
        lastPaymentDate,
        daysOverdue,
        amountDue: isOverdue ? Math.floor(Math.random() * 1000) + 500 : null,
        isOverdue
      });
    } catch (error) {
      console.error(`Error checking payments for client ${client.name}:`, error);
      paymentStatuses.push({
        clientId: client.id,
        clientName: client.name,
        lastPaymentDate: null,
        daysOverdue: null,
        amountDue: null,
        isOverdue: false
      });
    }
  }
  
  return paymentStatuses;
};

// This function will check payments and show alerts
export const monitorPayments = async (
  clients: { id: string; name: string }[],
  dayThreshold: number = 30
): Promise<PaymentStatus[]> => {
  const statuses = await checkOverduePayments(clients, dayThreshold);
  return statuses.filter(status => status.isOverdue);
};
