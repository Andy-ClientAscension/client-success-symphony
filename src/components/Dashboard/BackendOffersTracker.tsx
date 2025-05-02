
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Send, Eye, CheckCircle2, XCircle, PlusCircle } from "lucide-react";
import { useRenewals } from "@/hooks/use-renewals";
import { format, addDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function BackendOffersTracker() {
  const { offers, isLoading, error, updateBackendOffer, createBackendOffer } = useRenewals();
  const { toast } = useToast();

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

  const handleOfferStatusUpdate = async (offerId: string, newStatus: "draft" | "sent" | "viewed" | "accepted" | "rejected") => {
    await updateBackendOffer(offerId, { 
      status: newStatus,
    });
  };

  const addSampleOffers = async () => {
    try {
      const currentDate = new Date();
      
      const sampleOffers = [
        {
          client_id: "client-001",
          offer_type: "Renewal",
          offer_amount: 6500,
          status: "sent" as const,
          sent_at: new Date().toISOString()
        },
        {
          client_id: "client-002",
          offer_type: "Upsell",
          offer_amount: 2500,
          status: "draft" as const
        },
        {
          client_id: "client-003",
          offer_type: "Premium Package",
          offer_amount: 9750,
          status: "viewed" as const,
          sent_at: addDays(currentDate, -5).toISOString(),
          viewed_at: addDays(currentDate, -2).toISOString()
        }
      ];
      
      // Add sample offers one by one
      for (const offer of sampleOffers) {
        await createBackendOffer(offer);
      }
      
      toast({
        title: "Sample offers added",
        description: "Sample backend offers have been added successfully.",
      });
      
    } catch (err) {
      toast({
        title: "Error adding offers",
        description: err instanceof Error ? err.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };

  // Show loading state
  if (isLoading) return (
    <Card className="p-6">
      <div className="flex items-center justify-center h-60">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 border-4 border-t-primary rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Loading backend offers...</p>
        </div>
      </div>
    </Card>
  );

  // Show error state
  if (error) return (
    <Card className="p-6">
      <div className="flex flex-col items-center justify-center h-60 gap-2">
        <XCircle className="h-10 w-10 text-red-500" />
        <p className="text-lg font-medium">Error loading offers</p>
        <p className="text-muted-foreground">{error}</p>
      </div>
    </Card>
  );

  // Show empty state with option to add sample data
  if (!offers.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Backend Offers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-60 gap-4 p-6">
            <DollarSign className="h-16 w-16 text-muted-foreground opacity-20" />
            <p className="text-lg font-medium text-center">No backend offers yet</p>
            <p className="text-muted-foreground text-center max-w-md">
              Create your first backend offer to start tracking client upsells and renewals or add sample data for testing.
            </p>
            <Button 
              onClick={addSampleOffers} 
              className="mt-2"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Sample Offers
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show existing offers
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
