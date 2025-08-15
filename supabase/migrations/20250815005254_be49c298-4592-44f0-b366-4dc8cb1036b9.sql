-- Fix the RLS policy to avoid infinite recursion
-- First drop the problematic policy
DROP POLICY IF EXISTS "SSCs can view their team notifications" ON public.contract_notifications;

-- Create a security definer function to get user's assigned SSC safely
CREATE OR REPLACE FUNCTION public.get_user_assigned_ssc()
RETURNS TEXT AS $$
  SELECT assigned_ssc FROM public.clients WHERE assigned_ssc = auth.email()::text LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create a security definer function to get user's team safely
CREATE OR REPLACE FUNCTION public.get_user_team()
RETURNS TEXT AS $$
  SELECT team FROM public.clients WHERE assigned_ssc = auth.email()::text LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create the correct policy using security definer functions
CREATE POLICY "SSCs can view their team notifications" 
ON public.contract_notifications 
FOR SELECT 
USING (
  assigned_ssc = auth.email()::text 
  OR 
  assigned_ssc IN (
    SELECT assigned_ssc FROM public.clients 
    WHERE team = public.get_user_team()
  )
);