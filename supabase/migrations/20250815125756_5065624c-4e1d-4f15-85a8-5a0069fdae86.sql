-- Insert sample renewal forecasts based on existing clients
-- This will create renewal forecasts for clients with contracts ending soon

INSERT INTO public.renewal_forecasts (
  client_id,
  forecast_date,
  renewal_date,
  likelihood_status,
  current_contract_value,
  potential_upsell_value,
  forecast_notes
)
SELECT 
  c.id as client_id,
  CURRENT_DATE as forecast_date,
  c.end_date as renewal_date,
  CASE 
    WHEN c.end_date < CURRENT_DATE + INTERVAL '30 days' THEN 'at_risk'
    WHEN c.end_date < CURRENT_DATE + INTERVAL '90 days' THEN 'likely'
    ELSE 'unknown'
  END as likelihood_status,
  c.contract_value as current_contract_value,
  c.contract_value * 0.2 as potential_upsell_value,
  CASE 
    WHEN c.end_date < CURRENT_DATE + INTERVAL '30 days' THEN 'Contract expires soon - immediate follow-up required'
    WHEN c.end_date < CURRENT_DATE + INTERVAL '90 days' THEN 'Good candidate for renewal discussion'
    ELSE 'Monitor for renewal timing'
  END as forecast_notes
FROM public.clients c
WHERE c.end_date IS NOT NULL
  AND c.status IN ('active', 'backend', 'olympia')
  AND NOT EXISTS (
    SELECT 1 FROM public.renewal_forecasts rf 
    WHERE rf.client_id = c.id
  )
LIMIT 20;