
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
    try {
      const forecastsResponse = await supabase
        .from('renewal_forecasts')
        .select('*');
      
      const offersResponse = await supabase
        .from('backend_offers')
        .select('*');
      
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
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRenewalData();
  }, []);

  const createRenewalForecast = async (forecast: Omit<Renewals.Forecast, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('renewal_forecasts')
        .insert(forecast)
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
      throw new Error(errorMessage);
    }
  };

  const createBackendOffer = async (offer: Omit<Renewals.BackendOffer, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('backend_offers')
        .insert(offer)
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
