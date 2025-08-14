-- Create SSC capacity tracking table
CREATE TABLE public.ssc_capacities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ssc_name TEXT NOT NULL,
  team TEXT NOT NULL,
  max_capacity INTEGER NOT NULL DEFAULT 60,
  current_students INTEGER NOT NULL DEFAULT 0,
  available_capacity INTEGER GENERATED ALWAYS AS (max_capacity - current_students) STORED,
  capacity_percentage NUMERIC GENERATED ALWAYS AS (ROUND((current_students::NUMERIC / max_capacity::NUMERIC) * 100, 1)) STORED,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(ssc_name, team)
);

-- Enable RLS
ALTER TABLE public.ssc_capacities ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "SSCs can view their own capacity" 
ON public.ssc_capacities 
FOR SELECT 
USING (true); -- Allow all authenticated users to view capacities

CREATE POLICY "Managers can manage capacities" 
ON public.ssc_capacities 
FOR ALL 
USING (has_sales_access(auth.uid()));

-- Create function to update SSC capacity counts
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
$$ LANGUAGE plpgsql;

-- Create trigger for automatic capacity updates
CREATE TRIGGER update_ssc_capacity_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_ssc_capacity();

-- Create trigger for updated_at
CREATE TRIGGER update_ssc_capacities_updated_at
  BEFORE UPDATE ON public.ssc_capacities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Initialize capacities for existing SSCs
INSERT INTO public.ssc_capacities (ssc_name, team, current_students)
SELECT 
  assigned_ssc,
  COALESCE(team, 'Default') as team,
  COUNT(*) as current_students
FROM public.clients 
WHERE assigned_ssc IS NOT NULL 
  AND status IN ('active', 'new', 'at-risk')
GROUP BY assigned_ssc, COALESCE(team, 'Default')
ON CONFLICT (ssc_name, team) DO NOTHING;