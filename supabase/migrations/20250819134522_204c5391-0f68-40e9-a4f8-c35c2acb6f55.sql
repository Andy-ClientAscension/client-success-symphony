
-- DEMO-ONLY: Open read access for anon to clients and notifications

-- Ensure anon can read from the schema/tables
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.clients TO anon;
GRANT SELECT ON public.notifications TO anon;

-- Allow unauthenticated (anon) users to read all clients
CREATE POLICY "Public demo read access - clients (anon only)"
  ON public.clients
  FOR SELECT
  TO anon
  USING (true);

-- Allow unauthenticated (anon) users to read all notifications
CREATE POLICY "Public demo read access - notifications (anon only)"
  ON public.notifications
  FOR SELECT
  TO anon
  USING (true);
