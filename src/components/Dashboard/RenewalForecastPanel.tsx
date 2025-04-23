
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, TrendingUp, AlertTriangle } from "lucide-react";
import { useRenewals } from "@/hooks/use-renewals";
import { format } from "date-fns";

export function RenewalForecastPanel() {
  const { forecasts, isLoading, error } = useRenewals();

  const getLikelihoodIcon = (status: string) => {
    switch(status) {
      case 'likely': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'at_risk': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Calendar className="h-4 w-4 text-muted-foreground" />;
    }
  };

  if (isLoading) return <div>Loading renewal forecasts...</div>;
  if (error) return <div>Error loading forecasts: {error}</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Renewal Forecasts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {forecasts.map(forecast => (
            <div 
              key={forecast.id} 
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center space-x-3">
                {getLikelihoodIcon(forecast.likelihood_status)}
                <div>
                  <div className="font-medium">
                    Renewal for Client {forecast.client_id}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(forecast.renewal_date), "MMM d, yyyy")}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={
                  forecast.likelihood_status === 'likely' ? 'default' :
                  forecast.likelihood_status === 'at_risk' ? 'destructive' : 'outline'
                }>
                  {forecast.likelihood_status}
                </Badge>
                <div className="text-right">
                  <div className="text-sm font-medium">
                    ${forecast.current_contract_value.toLocaleString()}
                  </div>
                  {forecast.potential_upsell_value && (
                    <div className="text-xs text-muted-foreground">
                      Upsell: ${forecast.potential_upsell_value.toLocaleString()}
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
