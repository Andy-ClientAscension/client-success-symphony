import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, TrendingUp, DollarSign } from 'lucide-react';
import { getRenewalForecasts } from '@/lib/supabase-queries';
import { LoadingState } from '@/components/LoadingState';

interface RenewalForecast {
  id: string;
  client_id: string;
  forecast_date: string;
  renewal_date: string;
  current_contract_value: number;
  potential_upsell_value?: number;
  likelihood_status: string;
  forecast_notes?: string;
}

export function RenewalForecastWidget() {
  const [forecasts, setForecasts] = useState<RenewalForecast[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadForecasts();
  }, []);

  const loadForecasts = async () => {
    try {
      const data = await getRenewalForecasts();
      setForecasts(data);
    } catch (error) {
      console.error('Error loading renewal forecasts:', error);
    } finally {
      setLoading(false);
    }
  };

  const upcomingRenewals = forecasts.filter(f => {
    const renewalDate = new Date(f.renewal_date);
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    return renewalDate <= thirtyDaysFromNow;
  });

  const totalRevenue = upcomingRenewals.reduce((sum, f) => sum + f.current_contract_value, 0);
  const potentialUpsell = upcomingRenewals.reduce((sum, f) => sum + (f.potential_upsell_value || 0), 0);

  const getLikelihoodColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Renewal Forecasts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingState message="Loading forecasts..." />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          Renewal Forecasts
        </CardTitle>
        <CardDescription>
          Upcoming renewals in the next 30 days
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Total Revenue</span>
            </div>
            <p className="text-xl font-bold text-blue-700">{formatCurrency(totalRevenue)}</p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-900">Upsell Potential</span>
            </div>
            <p className="text-xl font-bold text-green-700">{formatCurrency(potentialUpsell)}</p>
          </div>
        </div>

        {/* Renewal List */}
        <div className="space-y-3">
          {upcomingRenewals.length === 0 ? (
            <p className="text-sm text-muted-foreground">No upcoming renewals in the next 30 days</p>
          ) : (
            upcomingRenewals.slice(0, 5).map((forecast) => (
              <div key={forecast.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">Client {forecast.client_id.slice(0, 8)}</p>
                    <Badge className={getLikelihoodColor(forecast.likelihood_status)}>
                      {forecast.likelihood_status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Renewal: {new Date(forecast.renewal_date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(forecast.current_contract_value)}</p>
                  {forecast.potential_upsell_value && (
                    <p className="text-sm text-green-600">
                      +{formatCurrency(forecast.potential_upsell_value)}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {upcomingRenewals.length > 5 && (
          <p className="text-sm text-muted-foreground text-center">
            +{upcomingRenewals.length - 5} more renewals
          </p>
        )}
      </CardContent>
    </Card>
  );
}