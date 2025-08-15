-- Create contract notifications table to track automated alerts
CREATE TABLE public.contract_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL,
  days_remaining INTEGER NOT NULL,
  notification_type TEXT NOT NULL, -- '80_days', '45_days', '30_days', '2_weeks', '1_week', '5_days', '3_days', '2_days', '24_hours', 'contract_ended'
  assigned_ssc TEXT NOT NULL,
  team TEXT,
  client_name TEXT NOT NULL,
  contract_end_date DATE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  acknowledged BOOLEAN NOT NULL DEFAULT false,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  acknowledged_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.contract_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for notifications
CREATE POLICY "SSCs can view their team notifications" 
ON public.contract_notifications 
FOR SELECT 
USING (assigned_ssc = auth.email()::text OR assigned_ssc IN (
  SELECT assigned_ssc FROM public.clients WHERE team = (
    SELECT team FROM public.clients WHERE assigned_ssc = auth.email()::text LIMIT 1
  )
));

CREATE POLICY "SSCs can acknowledge their notifications" 
ON public.contract_notifications 
FOR UPDATE 
USING (assigned_ssc = auth.email()::text);

-- System can insert notifications
CREATE POLICY "System can create notifications" 
ON public.contract_notifications 
FOR INSERT 
WITH CHECK (true);

-- Create index for performance
CREATE INDEX idx_contract_notifications_ssc ON public.contract_notifications(assigned_ssc);
CREATE INDEX idx_contract_notifications_date ON public.contract_notifications(contract_end_date);
CREATE INDEX idx_contract_notifications_acknowledged ON public.contract_notifications(acknowledged);

-- Function to update updated_at timestamp
CREATE TRIGGER update_contract_notifications_updated_at
  BEFORE UPDATE ON public.contract_notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();