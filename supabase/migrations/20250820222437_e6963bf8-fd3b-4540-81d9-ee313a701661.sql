-- Enable Row Level Security on tables that have policies but RLS not enabled
-- This fixes the security linter errors

-- Enable RLS on renewal_forecasts table
ALTER TABLE public.renewal_forecasts ENABLE ROW LEVEL SECURITY;

-- Enable RLS on backend_offers table  
ALTER TABLE public.backend_offers ENABLE ROW LEVEL SECURITY;