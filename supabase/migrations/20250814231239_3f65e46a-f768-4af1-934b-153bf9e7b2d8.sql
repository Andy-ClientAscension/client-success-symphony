-- Fix critical security issue: Restrict clients table access
DROP POLICY IF EXISTS "Users can view all clients" ON public.clients;

-- Create proper RLS policy for clients table
CREATE POLICY "Authenticated users can view clients" 
ON public.clients 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Fix SSC capacities access - restrict to authenticated users only
DROP POLICY IF EXISTS "SSCs can view their own capacity" ON public.ssc_capacities;

CREATE POLICY "Authenticated users can view capacities" 
ON public.ssc_capacities 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Fix function search path security issue
CREATE OR REPLACE FUNCTION public.update_ssc_capacity()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle INSERT
  IF TG_OP = 'INSERT' THEN
    -- Increase capacity count for assigned SSC
    IF NEW.assigned_ssc IS NOT NULL AND NEW.status IN ('active', 'new', 'at-risk') THEN
      INSERT INTO public.ssc_capacities (ssc_name, team, current_students)
      VALUES (NEW.assigned_ssc, COALESCE(NEW.team, 'Default'), 1)
      ON CONFLICT (ssc_name, team) 
      DO UPDATE SET 
        current_students = ssc_capacities.current_students + 1,
        updated_at = now();
    END IF;
    RETURN NEW;
  END IF;

  -- Handle UPDATE
  IF TG_OP = 'UPDATE' THEN
    -- Decrease count for old SSC if changed
    IF OLD.assigned_ssc IS NOT NULL AND OLD.assigned_ssc != COALESCE(NEW.assigned_ssc, '') 
       AND OLD.status IN ('active', 'new', 'at-risk') THEN
      UPDATE public.ssc_capacities 
      SET current_students = GREATEST(current_students - 1, 0),
          updated_at = now()
      WHERE ssc_name = OLD.assigned_ssc AND team = COALESCE(OLD.team, 'Default');
    END IF;

    -- Increase count for new SSC if changed
    IF NEW.assigned_ssc IS NOT NULL AND NEW.assigned_ssc != COALESCE(OLD.assigned_ssc, '')
       AND NEW.status IN ('active', 'new', 'at-risk') THEN
      INSERT INTO public.ssc_capacities (ssc_name, team, current_students)
      VALUES (NEW.assigned_ssc, COALESCE(NEW.team, 'Default'), 1)
      ON CONFLICT (ssc_name, team) 
      DO UPDATE SET 
        current_students = ssc_capacities.current_students + 1,
        updated_at = now();
    END IF;

    -- Handle status changes
    IF OLD.status != NEW.status AND NEW.assigned_ssc IS NOT NULL THEN
      -- If moving TO active status, increase count
      IF NEW.status IN ('active', 'new', 'at-risk') AND OLD.status NOT IN ('active', 'new', 'at-risk') THEN
        INSERT INTO public.ssc_capacities (ssc_name, team, current_students)
        VALUES (NEW.assigned_ssc, COALESCE(NEW.team, 'Default'), 1)
        ON CONFLICT (ssc_name, team) 
        DO UPDATE SET 
          current_students = ssc_capacities.current_students + 1,
          updated_at = now();
      END IF;

      -- If moving FROM active status, decrease count
      IF OLD.status IN ('active', 'new', 'at-risk') AND NEW.status NOT IN ('active', 'new', 'at-risk') THEN
        UPDATE public.ssc_capacities 
        SET current_students = GREATEST(current_students - 1, 0),
            updated_at = now()
        WHERE ssc_name = NEW.assigned_ssc AND team = COALESCE(NEW.team, 'Default');
      END IF;
    END IF;

    RETURN NEW;
  END IF;

  -- Handle DELETE
  IF TG_OP = 'DELETE' THEN
    IF OLD.assigned_ssc IS NOT NULL AND OLD.status IN ('active', 'new', 'at-risk') THEN
      UPDATE public.ssc_capacities 
      SET current_students = GREATEST(current_students - 1, 0),
          updated_at = now()
      WHERE ssc_name = OLD.assigned_ssc AND team = COALESCE(OLD.team, 'Default');
    END IF;
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';