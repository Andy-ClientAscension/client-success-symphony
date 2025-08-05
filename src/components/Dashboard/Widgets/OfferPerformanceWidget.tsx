import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, DollarSign, Eye, MessageSquare } from 'lucide-react';
import { getBackendOffers } from '@/lib/supabase-queries';
import { LoadingState } from '@/components/LoadingState';

interface BackendOffer {
  id: string;
  client_id: string;
  offer_amount: number;
  offer_type: string;
  status: string;
  sent_at?: string;
  viewed_at?: string;
  response_at?: string;
  response_notes?: string;
  created_at: string;
}

export function OfferPerformanceWidget() {
  const [offers, setOffers] = useState<BackendOffer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    try {
      const data = await getBackendOffers();
      setOffers(data);
    } catch (error) {
      console.error('Error loading offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'viewed': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOfferTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'upsell': return 'bg-purple-100 text-purple-800';
      case 'renewal': return 'bg-blue-100 text-blue-800';
      case 'new_service': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  // Calculate metrics
  const totalOffers = offers.length;
  const sentOffers = offers.filter(o => o.status !== 'draft').length;
  const viewedOffers = offers.filter(o => o.viewed_at).length;
  const acceptedOffers = offers.filter(o => o.status === 'accepted').length;
  const rejectedOffers = offers.filter(o => o.status === 'rejected').length;

  const viewRate = sentOffers > 0 ? (viewedOffers / sentOffers) * 100 : 0;
  const conversionRate = sentOffers > 0 ? (acceptedOffers / sentOffers) * 100 : 0;
  const totalValue = acceptedOffers > 0 ? 
    offers.filter(o => o.status === 'accepted').reduce((sum, o) => sum + o.offer_amount, 0) : 0;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Offer Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingState message="Loading offer data..." />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Offer Performance
        </CardTitle>
        <CardDescription>
          Track offer success rates and revenue impact
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-900">Revenue Won</span>
            </div>
            <p className="text-xl font-bold text-green-700">{formatCurrency(totalValue)}</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Conversion Rate</span>
            </div>
            <p className="text-xl font-bold text-blue-700">{conversionRate.toFixed(1)}%</p>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="space-y-3">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">View Rate</span>
              <span className="text-sm text-muted-foreground">{viewedOffers}/{sentOffers}</span>
            </div>
            <Progress value={viewRate} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">{viewRate.toFixed(1)}% of sent offers viewed</p>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">Acceptance Rate</span>
              <span className="text-sm text-muted-foreground">{acceptedOffers}/{sentOffers}</span>
            </div>
            <Progress value={conversionRate} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">{conversionRate.toFixed(1)}% of sent offers accepted</p>
          </div>
        </div>

        {/* Recent Offers */}
        <div className="space-y-3">
          <h4 className="font-medium">Recent Offers</h4>
          {offers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No offers found</p>
          ) : (
            offers.slice(0, 5).map((offer) => (
              <div key={offer.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">Client {offer.client_id.slice(0, 8)}</span>
                    <Badge className={getOfferTypeColor(offer.offer_type)}>
                      {offer.offer_type.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {offer.sent_at && (
                      <span>Sent: {new Date(offer.sent_at).toLocaleDateString()}</span>
                    )}
                    {offer.viewed_at && (
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        Viewed
                      </span>
                    )}
                    {offer.response_at && (
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        Responded
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(offer.offer_amount)}</p>
                  <Badge className={getStatusColor(offer.status)}>
                    {offer.status}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>

        {offers.length > 5 && (
          <p className="text-sm text-muted-foreground text-center">
            +{offers.length - 5} more offers
          </p>
        )}
      </CardContent>
    </Card>
  );
}