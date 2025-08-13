-- Create a sample notification for testing the notification system
INSERT INTO public.notifications (
  user_id,
  title,
  message,
  type,
  read,
  related_table,
  related_id
) VALUES (
  (SELECT auth.uid()),
  'Welcome to Client Ascension',
  'Your dashboard has been updated with the latest features including search and notifications.',
  'info',
  false,
  'dashboard',
  gen_random_uuid()
);

-- Create another sample notification
INSERT INTO public.notifications (
  user_id,
  title,
  message,
  type,
  read,
  related_table
) VALUES (
  (SELECT auth.uid()),
  'New Feature: AI Insights',
  'Check out the new AI dashboard for advanced analytics and predictions.',
  'success',
  false,
  'features'
);