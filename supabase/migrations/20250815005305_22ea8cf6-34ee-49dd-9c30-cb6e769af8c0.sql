-- Fix the search path security issues
CREATE OR REPLACE FUNCTION public.get_user_assigned_ssc()
RETURNS TEXT AS $$
  SELECT assigned_ssc FROM public.clients WHERE assigned_ssc = auth.email()::text LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = 'public';

CREATE OR REPLACE FUNCTION public.get_user_team()
RETURNS TEXT AS $$
  SELECT team FROM public.clients WHERE assigned_ssc = auth.email()::text LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = 'public';