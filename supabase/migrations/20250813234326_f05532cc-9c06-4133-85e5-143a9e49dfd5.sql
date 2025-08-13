-- Fix critical issues identified in audit (corrected)

-- 1. Create missing clients table to replace mock data
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('new', 'active', 'backend', 'olympia', 'at-risk', 'churned', 'paused', 'graduated')),
  team TEXT,
  csm TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  contract_value NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  nps_score INTEGER CHECK (nps_score >= 0 AND nps_score <= 10),
  calls_booked INTEGER DEFAULT 0,
  deals_closed INTEGER DEFAULT 0,
  mrr NUMERIC DEFAULT 0,
  last_communication DATE,
  backend_students INTEGER DEFAULT 0,
  growth NUMERIC DEFAULT 0,
  logo TEXT,
  last_payment_amount NUMERIC,
  last_payment_date DATE,
  trustpilot_date DATE,
  trustpilot_rating INTEGER CHECK (trustpilot_rating >= 1 AND trustpilot_rating <= 5),
  trustpilot_link TEXT,
  case_study_completed BOOLEAN DEFAULT FALSE,
  case_study_scheduled_date DATE,
  case_study_conducted BOOLEAN DEFAULT FALSE,
  case_study_notes TEXT,
  referral_count INTEGER DEFAULT 0,
  referral_names TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on clients table
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Create policies for clients table
CREATE POLICY "Users can view all clients" 
ON public.clients 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create clients" 
ON public.clients 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update clients" 
ON public.clients 
FOR UPDATE 
USING (true);

-- 2. Fix notification policy security issue
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;

CREATE POLICY "System and authorized users can create notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (
  -- Only allow authenticated users to create notifications for themselves
  -- or users with sales access to create notifications for others
  (auth.uid() = user_id) OR 
  (has_sales_access(auth.uid()))
);

-- 3. Add trigger for clients updated_at
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();