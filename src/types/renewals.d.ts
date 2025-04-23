
export namespace Renewals {
  interface Forecast {
    id: string;
    client_id: string;
    forecast_date: string;
    renewal_date: string;
    likelihood_status: 'likely' | 'at_risk' | 'unknown';
    current_contract_value: number;
    potential_upsell_value?: number;
    forecast_notes?: string;
  }

  interface BackendOffer {
    id: string;
    client_id: string;
    offer_type: string;
    offer_amount: number;
    status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected';
    sent_at?: string;
    viewed_at?: string;
    response_at?: string;
    response_notes?: string;
  }
}
