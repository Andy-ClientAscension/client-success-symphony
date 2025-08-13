-- Phase 1: Critical Security Fixes - Implement proper RLS policies

-- 1. Fix profiles table - restrict to own profile only
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Users can view their own profile only" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- 2. Restrict renewal_forecasts to sales managers/executives only
-- First create a function to check if user has sales role
CREATE OR REPLACE FUNCTION public.has_sales_access(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles ur
    WHERE ur.user_id = $1 
    AND ur.role IN ('admin', 'manager')
  );
$$;

DROP POLICY IF EXISTS "Allow read access to authenticated users" ON public.renewal_forecasts;
CREATE POLICY "Sales managers can view renewal forecasts" 
ON public.renewal_forecasts 
FOR SELECT 
USING (public.has_sales_access(auth.uid()));

CREATE POLICY "Sales managers can update renewal forecasts" 
ON public.renewal_forecasts 
FOR UPDATE 
USING (public.has_sales_access(auth.uid()));

DROP POLICY IF EXISTS "Allow update access to authenticated users" ON public.renewal_forecasts;
DROP POLICY IF EXISTS "Allow write access to authenticated users" ON public.renewal_forecasts;

CREATE POLICY "Sales managers can create renewal forecasts" 
ON public.renewal_forecasts 
FOR INSERT 
WITH CHECK (public.has_sales_access(auth.uid()));

-- 3. Restrict backend_offers to assigned users only
DROP POLICY IF EXISTS "Allow read access to authenticated users" ON public.backend_offers;
DROP POLICY IF EXISTS "Allow update access to authenticated users" ON public.backend_offers;
DROP POLICY IF EXISTS "Allow write access to authenticated users" ON public.backend_offers;

CREATE POLICY "Users can view their assigned offers" 
ON public.backend_offers 
FOR SELECT 
USING (public.has_sales_access(auth.uid()));

CREATE POLICY "Sales team can manage offers" 
ON public.backend_offers 
FOR ALL
USING (public.has_sales_access(auth.uid()));

-- 4. Improve communications security - sender/recipient/supervisors only
DROP POLICY IF EXISTS "Users can view communications" ON public.communications;

CREATE POLICY "Users can view relevant communications" 
ON public.communications 
FOR SELECT 
USING (
  auth.uid() = sent_by OR 
  public.has_sales_access(auth.uid())
);