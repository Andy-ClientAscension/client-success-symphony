-- Add contract tracking fields to clients table
ALTER TABLE public.clients 
ADD COLUMN contract_type text,
ADD COLUMN contract_duration_months integer;

-- Add some helpful comments
COMMENT ON COLUMN public.clients.contract_type IS 'Type of contract: Front End, GCC, Olympia, Recovery, Custom';
COMMENT ON COLUMN public.clients.contract_duration_months IS 'Duration of contract in months';