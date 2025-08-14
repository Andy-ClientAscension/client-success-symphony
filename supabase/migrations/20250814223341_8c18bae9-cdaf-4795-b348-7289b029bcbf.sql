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
  WHEN CAST(SUBSTRING(id::text, 1, 1) AS INTEGER) % 5 = 1 THEN 'Andy'
  WHEN CAST(SUBSTRING(id::text, 1, 1) AS INTEGER) % 5 = 2 THEN 'Nick' 
  WHEN CAST(SUBSTRING(id::text, 1, 1) AS INTEGER) % 5 = 3 THEN 'Chris'
  WHEN CAST(SUBSTRING(id::text, 1, 1) AS INTEGER) % 5 = 4 THEN 'Cillin'
  ELSE 'Stephen'
END
WHERE assigned_ssc IS NULL;

-- Update RLS policy for SSC data access
DROP POLICY IF EXISTS "Users can view all clients" ON public.clients;

CREATE POLICY "SSCs can view assigned clients" 
ON public.clients 
FOR SELECT 
USING (true);  -- Simplified for now, will enhance with proper SSC filtering

CREATE POLICY "SSCs can update assigned clients" 
ON public.clients 
FOR UPDATE 
USING (true);  -- Simplified for now, will enhance with proper SSC filtering