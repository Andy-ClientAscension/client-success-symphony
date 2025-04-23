
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Send, Eye, CheckCircle2, XCircle } from "lucide-react";
import { useRenewals } from "@/hooks/use-renewals";
import { format } from "date-fns";

export function BackendOffersTracker() {
  const { offers, isLoading, error, updateBackendOffer } = useRenewals();

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'draft': return <DollarSign className="h-4 w-4 text-muted-foreground" />;
      case 'sent': return <Send className="h-4 w-4 text-blue-500" />;
      case 'viewed': return <Eye className="h-4 w-4 text-yellow-500" />;
      case 'accepted': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  const handleOfferStatusUpdate = async (offerId: string, newStatus: Renewals.BackendOffer['status']) => {
    await updateBackendOffer(offerId, { 
      status: newStatus,
      updated_at: new Date().toISOString() 
    });
  };

  if (isLoading) return <div>Loading backend offers...</div>;
  if (error) return <div>Error loading offers: {error}</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Backend Offers
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {offers.map(offer => (
            <div 
              key={offer.id} 
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center space-x-3">
                {getStatusIcon(offer.status)}
                <div>
                  <div className="font-medium">
                    {offer.offer_type} Offer
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Client {offer.client_id}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={
                  offer.status === 'accepted' ? 'default' :
                  offer.status === 'rejected' ? 'destructive' :
                  offer.status === 'viewed' ? 'outline' : 'secondary'
                }>
                  {offer.status}
                </Badge>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    ${offer.offer_amount.toLocaleString()}
                  </div>
                  {offer.sent_at && (
                    <div className="text-xs text-muted-foreground">
                      Sent: {format(new Date(offer.sent_at), "MMM d, yyyy")}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
