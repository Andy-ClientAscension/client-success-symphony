
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Renewals } from '@/types/renewals';
import { useToast } from '@/hooks/use-toast';

export function useRenewals() {
  const [forecasts, setForecasts] = useState<Renewals.Forecast[]>([]);
  const [offers, setOffers] = useState<Renewals.BackendOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchRenewalData = async () => {
    setIsLoading(true);
    setError(null); // Clear previous errors when starting a new fetch
    
    try {
      const forecastsResponse = await supabase
        .from('renewal_forecasts')
        .select(`
          *,
          clients:client_id (
            id,
            name,
            contract_value
          )
        `);
      
      const offersResponse = await supabase
        .from('backend_offers')
        .select(`
          *,
          clients:client_id (
            id,
            name
          )
        `);
      
      if (forecastsResponse.error) throw forecastsResponse.error;
      if (offersResponse.error) throw offersResponse.error;

      // Cast the data to ensure it matches our expected types
      setForecasts(forecastsResponse.data?.map(item => ({
        ...item,
        likelihood_status: item.likelihood_status as 'likely' | 'at_risk' | 'unknown'
      })) || []);
      
      setOffers(offersResponse.data?.map(item => ({
        ...item,
        status: item.status as 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected'
      })) || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error("Error fetching renewal data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRenewalData();
  }, []);

  const createRenewalForecast = async (forecast: Omit<Renewals.Forecast, 'id'>) => {
    try {
      // Ensure client_id is a valid UUID string
      const forecastData = {
        ...forecast,
        // Use a generated UUID for sample data instead of string IDs like "client-001"
        client_id: forecast.client_id.startsWith('client-') 
          ? crypto.randomUUID() 
          : forecast.client_id
      };
      
      const { data, error } = await supabase
        .from('renewal_forecasts')
        .insert(forecastData)
        .select();
      
      if (error) throw error;
      if (data) {
        // Cast the newly created item to ensure type safety
        const typedData = {
          ...data[0],
          likelihood_status: data[0].likelihood_status as 'likely' | 'at_risk' | 'unknown'
        };
        setForecasts(prev => [...prev, typedData]);
        return typedData;
      }
      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create forecast';
      setError(errorMessage);
      toast({
        title: "Error creating forecast",
        description: errorMessage,
        variant: "destructive"
      });
      throw new Error(errorMessage);
    }
  };

  const createBackendOffer = async (offer: Omit<Renewals.BackendOffer, 'id'>) => {
    try {
      // Ensure client_id is a valid UUID string
      const offerData = {
        ...offer,
        // Use a generated UUID for sample data instead of string IDs like "client-001"
        client_id: offer.client_id.startsWith('client-') 
          ? crypto.randomUUID() 
          : offer.client_id
      };
      
      const { data, error } = await supabase
        .from('backend_offers')
        .insert(offerData)
        .select();
      
      if (error) throw error;
      if (data) {
        // Cast the newly created item to ensure type safety
        const typedData = {
          ...data[0],
          status: data[0].status as 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected'
        };
        setOffers(prev => [...prev, typedData]);
        return typedData;
      }
      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create offer';
      setError(errorMessage);
      toast({
        title: "Error creating offer",
        description: errorMessage,
        variant: "destructive"
      });
      throw new Error(errorMessage);
    }
  };

  const updateBackendOffer = async (offerId: string, updates: Partial<Renewals.BackendOffer>) => {
    try {
      const { data, error } = await supabase
        .from('backend_offers')
        .update(updates)
        .eq('id', offerId)
        .select();
      
      if (error) throw error;
      if (data) {
        // Cast the updated data to ensure type safety
        const typedData = {
          ...data[0],
          status: data[0].status as 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected'
        };
        
        setOffers(prev => 
          prev.map(offer => offer.id === offerId ? typedData : offer)
        );
        return typedData;
      }
      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update offer';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return {
    forecasts,
    offers,
    isLoading,
    error,
    createRenewalForecast,
    createBackendOffer,
    updateBackendOffer,
    refetch: fetchRenewalData
  };
}
