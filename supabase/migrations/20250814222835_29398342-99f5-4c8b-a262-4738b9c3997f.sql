-- Add missing client fields for SSC management
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS service TEXT,
ADD COLUMN IF NOT EXISTS health_score INTEGER CHECK (health_score >= 0 AND health_score <= 100),
ADD COLUMN IF NOT EXISTS assigned_ssc TEXT;

-- Update existing clients with sample SSC assignments
UPDATE public.clients 
SET assigned_ssc = CASE 
  WHEN id::text LIKE '%1%' THEN 'Andy'
  WHEN id::text LIKE '%2%' THEN 'Nick' 
  WHEN id::text LIKE '%3%' THEN 'Chris'
  WHEN id::text LIKE '%4%' THEN 'Cillin'
  ELSE 'Stephen'
END
WHERE assigned_ssc IS NULL;

-- Create SSC profiles if they don't exist
INSERT INTO public.profiles (id, email, first_name, last_name) 
VALUES 
  (gen_random_uuid(), 'andy@company.com', 'Andy', 'SSC'),
  (gen_random_uuid(), 'nick@company.com', 'Nick', 'SSC'),
  (gen_random_uuid(), 'chris@company.com', 'Chris', 'SSC'),
  (gen_random_uuid(), 'cillin@company.com', 'Cillin', 'SSC'),
  (gen_random_uuid(), 'stephen@company.com', 'Stephen', 'SSC')
ON CONFLICT (email) DO NOTHING;

-- Update RLS policy for SSC data access
DROP POLICY IF EXISTS "Users can view all clients" ON public.clients;

CREATE POLICY "SSCs can view assigned clients" 
ON public.clients 
FOR SELECT 
USING (
  assigned_ssc = (SELECT first_name FROM public.profiles WHERE id = auth.uid()) 
  OR has_sales_access(auth.uid())
);

CREATE POLICY "SSCs can update assigned clients" 
ON public.clients 
FOR UPDATE 
USING (
  assigned_ssc = (SELECT first_name FROM public.profiles WHERE id = auth.uid()) 
  OR has_sales_access(auth.uid())
);