-- Temporarily disable RLS policies for development to allow data access without authentication
ALTER TABLE public.renewal_forecasts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.backend_offers DISABLE ROW LEVEL SECURITY;