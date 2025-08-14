-- Insert mock client data into the clients table
INSERT INTO public.clients (
  id, name, status, team, csm, start_date, end_date, contract_value, 
  notes, progress, nps_score, calls_booked, deals_closed, mrr, 
  backend_students, growth, last_communication, last_payment_amount, 
  last_payment_date, trustpilot_date, trustpilot_rating, trustpilot_link,
  case_study_completed, case_study_scheduled_date, case_study_conducted,
  case_study_notes, referral_count, referral_names
) VALUES 
('1', 'Acme Corporation', 'active', 'enterprise', 'John Smith', '2023-01-01', '2024-01-01', 50000, 
 'Key enterprise client with multiple product lines', 85, 9, 8, 3, 4500, 
 12, 15, '2023-11-15', 4500, '2023-11-01', '2023-10-15', 5, 'https://trustpilot.com/reviews/acme123',
 true, '2023-09-20', true, 'Great success story with 45% efficiency improvement', 3, 
 ARRAY['Stark Industries', 'Wayne Enterprises', 'Oscorp']),

('2', 'Globex Industries', 'at-risk', 'mid-market', 'Jane Doe', '2022-11-15', '2023-11-15', 25000,
 'Renewal discussions needed, showing signs of churn', 45, 6, 4, 1, 2200,
 7, 2, '2023-11-05', 2200, '2023-11-01', '2023-08-22', 3, 'https://trustpilot.com/reviews/globex789',
 false, '2023-11-25', false, 'Need to focus on their success with our product', 0, ARRAY[]::text[]),

('3', 'Initech Software', 'new', 'smb', 'David Johnson', '2023-05-01', '2023-11-01', 10000,
 'New client, needs onboarding assistance', 25, NULL, 3, 1, 1800,
 3, 0, '2023-11-10', 1800, '2023-11-01', NULL, NULL, NULL,
 false, NULL, false, 'Too early for case study', 0, ARRAY[]::text[]),

('4', 'Massive Dynamic', 'active', 'enterprise', 'Sarah Williams', '2023-02-15', '2024-02-15', 75000,
 'Expansion opportunity in Q4', 92, 10, 12, 5, 6800,
 18, 22, '2023-11-12', 6800, '2023-11-01', '2023-10-05', 5, 'https://trustpilot.com/reviews/massivedynamic456',
 true, '2023-09-15', true, 'Excellent testimonial for marketing', 2, ARRAY['Hooli', 'Pied Piper']),

('5', 'Stark Industries', 'churned', 'mid-market', 'Michael Brown', '2022-08-01', '2023-08-01', 30000,
 'Churned due to budget constraints', 0, 4, 2, 0, 0,
 0, -100, '2023-07-25', 2800, '2023-07-01', '2023-06-12', 3, 'https://trustpilot.com/reviews/stark321',
 false, NULL, false, 'Not a candidate due to churn', 0, ARRAY[]::text[]),

('6', 'Wayne Enterprises', 'active', 'enterprise', 'John Smith', '2023-03-15', '2024-03-15', 65000,
 'Strategic partner with multiple departments using our platform', 75, 8, 6, 4, 5000,
 10, 10, '2023-11-10', 5000, '2023-11-01', '2023-09-10', 4, 'https://trustpilot.com/reviews/wayne123',
 true, '2023-08-15', true, 'Excellent case study with 50% increase in sales', 1, ARRAY['Globex Industries']),

('7', 'Umbrella Corporation', 'at-risk', 'enterprise', 'Sarah Williams', '2022-10-01', '2023-10-01', 55000,
 'Usage declining in last quarter, needs intervention', 50, 7, 4, 2, 4000,
 8, 5, '2023-11-05', 4000, '2023-11-01', '2023-07-10', 3, 'https://trustpilot.com/reviews/umbrella789',
 false, '2023-10-15', false, 'Need to improve customer service', 0, ARRAY[]::text[]),

('8', 'Cyberdyne Systems', 'new', 'mid-market', 'Jane Doe', '2023-06-01', '2024-06-01', 28000,
 'Recently migrated from competitor, needs extra support', 30, NULL, 2, 1, 2000,
 5, 0, '2023-11-01', 2000, '2023-11-01', NULL, NULL, NULL,
 false, NULL, false, 'Too early for case study', 0, ARRAY[]::text[]),

('9', 'Soylent Corp', 'active', 'smb', 'David Johnson', '2023-01-15', '2024-01-15', 12000,
 'Growing startup with expansion potential', 60, 7, 5, 3, 1500,
 4, 3, '2023-11-05', 1500, '2023-11-01', '2023-08-10', 4, 'https://trustpilot.com/reviews/soylent123',
 true, '2023-07-15', true, 'Excellent case study with 40% increase in sales', 2, ARRAY['Massive Dynamic', 'Wayne Enterprises']);

-- Enable realtime for clients table
ALTER TABLE public.clients REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.clients;