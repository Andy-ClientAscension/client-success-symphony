
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Renewals } from '@/types/renewals';

export function useRenewals() {
  const [forecasts, setForecasts] = useState<Renewals.Forecast[]>([]);
  const [offers, setOffers] = useState<Renewals.BackendOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

      setForecasts(forecastsResponse.data || []);
      setOffers(offersResponse.data || []);
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
      if (data) setForecasts(prev => [...prev, data[0]]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create forecast');
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
        setOffers(prev => 
          prev.map(offer => offer.id === offerId ? { ...offer, ...updates } : offer)
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update offer');
    }
  };

  return {
    forecasts,
    offers,
    isLoading,
    error,
    createRenewalForecast,
    updateBackendOffer,
    refetch: fetchRenewalData
  };
}
