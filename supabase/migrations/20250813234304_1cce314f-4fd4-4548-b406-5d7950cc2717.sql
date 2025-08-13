-- Fix critical issues identified in audit

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

-- 4. Insert sample data from mock data to clients table
INSERT INTO public.clients (
  id, name, status, team, csm, start_date, end_date, contract_value, 
  notes, progress, nps_score, calls_booked, deals_closed, mrr, 
  last_communication, backend_students, growth, last_payment_amount, 
  last_payment_date, trustpilot_date, trustpilot_rating, trustpilot_link,
  case_study_completed, case_study_scheduled_date, case_study_conducted, 
  case_study_notes, referral_count, referral_names
) VALUES 
('1', 'Acme Corporation', 'active', 'enterprise', 'John Smith', '2023-01-01', '2024-01-01', 50000, 
 'Key enterprise client with multiple product lines', 85, 9, 8, 3, 4500, 
 '2023-11-15', 12, 15, 4500, '2023-11-01', '2023-10-15', 5, 'https://trustpilot.com/reviews/acme123',
 true, '2023-09-20', true, 'Great success story with 45% efficiency improvement', 3, 
 ARRAY['Stark Industries', 'Wayne Enterprises', 'Oscorp']),
('2', 'Globex Industries', 'at-risk', 'mid-market', 'Jane Doe', '2022-11-15', '2023-11-15', 25000,
 'Renewal discussions needed, showing signs of churn', 45, 6, 4, 1, 2200,
 '2023-11-05', 7, 2, 2200, '2023-11-01', '2023-08-22', 3, 'https://trustpilot.com/reviews/globex789',
 false, '2023-11-25', false, 'Need to focus on their success with our product', 0, ARRAY[]::TEXT[]),
('3', 'Initech Software', 'new', 'smb', 'David Johnson', '2023-05-01', '2023-11-01', 10000,
 'New client, needs onboarding assistance', 25, NULL, 3, 1, 1800,
 '2023-11-10', 3, 0, 1800, '2023-11-01', NULL, NULL, NULL,
 false, NULL, false, 'Too early for case study', 0, ARRAY[]::TEXT[]);