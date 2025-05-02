
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, TrendingUp, AlertTriangle, PlusCircle } from "lucide-react";
import { useRenewals } from "@/hooks/use-renewals";
import { format, addMonths } from "date-fns";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function RenewalForecastPanel() {
  const { forecasts, isLoading, error, createRenewalForecast } = useRenewals();
  const { toast } = useToast();

  const getLikelihoodIcon = (status: string) => {
    switch(status) {
      case 'likely': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'at_risk': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Calendar className="h-4 w-4 text-muted-foreground" />;
    }
  };
  
  const addSampleForecasts = async () => {
    try {
      const currentDate = new Date();
      
      const sampleForecasts = [
        {
          client_id: "client-001",
          forecast_date: new Date().toISOString(),
          renewal_date: addMonths(currentDate, 2).toISOString(),
          likelihood_status: "likely" as const,
          current_contract_value: 5000,
          potential_upsell_value: 1500,
          forecast_notes: "Client expressed interest in premium tier"
        },
        {
          client_id: "client-002", 
          forecast_date: new Date().toISOString(),
          renewal_date: addMonths(currentDate, 1).toISOString(),
          likelihood_status: "at_risk" as const,
          current_contract_value: 3000,
          forecast_notes: "Need to schedule follow-up call"
        },
        {
          client_id: "client-003",
          forecast_date: new Date().toISOString(),
          renewal_date: addMonths(currentDate, 3).toISOString(),
          likelihood_status: "unknown" as const, 
          current_contract_value: 7500,
          potential_upsell_value: 2500
        }
      ];
      
      // Add sample forecasts one by one
      for (const forecast of sampleForecasts) {
        await createRenewalForecast(forecast);
      }
      
      toast({
        title: "Sample forecasts added",
        description: "Sample renewal forecasts have been added successfully.",
      });
      
    } catch (err) {
      toast({
        title: "Error adding forecasts",
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
          <p className="text-muted-foreground">Loading renewal forecasts...</p>
        </div>
      </div>
    </Card>
  );

  // Show error state  
  if (error) return (
    <Card className="p-6">
      <div className="flex flex-col items-center justify-center h-60 gap-2">
        <AlertTriangle className="h-10 w-10 text-red-500" />
        <p className="text-lg font-medium">Error loading forecasts</p>
        <p className="text-muted-foreground">{error}</p>
      </div>
    </Card>
  );

  // Show empty state with option to add sample data
  if (!forecasts.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Renewal Forecasts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-60 gap-4 p-6">
            <Calendar className="h-16 w-16 text-muted-foreground opacity-20" />
            <p className="text-lg font-medium text-center">No renewal forecasts yet</p>
            <p className="text-muted-foreground text-center max-w-md">
              Add your first renewal forecast to start tracking upcoming client renewals or add sample data for testing.
            </p>
            <Button 
              onClick={addSampleForecasts} 
              className="mt-2"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Sample Forecasts
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show existing forecasts
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
