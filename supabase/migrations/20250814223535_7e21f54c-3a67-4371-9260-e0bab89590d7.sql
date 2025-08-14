-- Add missing client fields for SSC management
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS service TEXT,
ADD COLUMN IF NOT EXISTS health_score INTEGER,
ADD COLUMN IF NOT EXISTS assigned_ssc TEXT;

-- Simple assignment to spread clients across SSCs
UPDATE public.clients 
SET assigned_ssc = 'Andy'
WHERE assigned_ssc IS NULL AND EXTRACT(MICROSECONDS FROM created_at)::INTEGER % 5 = 0;

UPDATE public.clients 
SET assigned_ssc = 'Nick'
WHERE assigned_ssc IS NULL AND EXTRACT(MICROSECONDS FROM created_at)::INTEGER % 5 = 1;

UPDATE public.clients 
SET assigned_ssc = 'Chris'
WHERE assigned_ssc IS NULL AND EXTRACT(MICROSECONDS FROM created_at)::INTEGER % 5 = 2;

UPDATE public.clients 
SET assigned_ssc = 'Cillin'
WHERE assigned_ssc IS NULL AND EXTRACT(MICROSECONDS FROM created_at)::INTEGER % 5 = 3;

UPDATE public.clients 
SET assigned_ssc = 'Stephen'
WHERE assigned_ssc IS NULL;