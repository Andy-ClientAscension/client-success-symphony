-- Add foreign key relationships for renewal forecasts and backend offers
-- This will enable the existing queries to work with the foreign key syntax

-- Add foreign key constraint for renewal_forecasts.client_id -> clients.id
ALTER TABLE public.renewal_forecasts 
ADD CONSTRAINT fk_renewal_forecasts_client_id 
FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;

-- Add foreign key constraint for backend_offers.client_id -> clients.id  
ALTER TABLE public.backend_offers 
ADD CONSTRAINT fk_backend_offers_client_id 
FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;