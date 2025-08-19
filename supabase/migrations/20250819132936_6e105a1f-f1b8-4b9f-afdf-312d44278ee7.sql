-- Insert sample client data for testing
INSERT INTO public.clients (
  name, email, phone, status, team, assigned_ssc, csm, service,
  start_date, end_date, contract_value, contract_type, contract_duration_months,
  mrr, progress, health_score, nps_score, calls_booked, deals_closed,
  backend_students, growth, last_payment_amount, last_payment_date,
  trustpilot_rating, trustpilot_date, notes
) VALUES 
-- Active clients
('TechCorp Solutions', 'contact@techcorp.com', '+1-555-0101', 'active', 'Enterprise', 'sarah.johnson@company.com', 'John Smith', 'Full-Stack Development',
 '2024-01-15', '2024-12-15', 120000, 'annual', 12, 10000, 85, 92, 8, 15, 3, 25, 15.5, 10000, '2024-07-15', 4, '2024-06-20', 'Excellent client, very responsive'),

('InnovateLabs', 'hello@innovatelabs.io', '+1-555-0102', 'active', 'Growth', 'mike.davis@company.com', 'Jane Doe', 'Mobile Development',
 '2024-02-01', '2025-01-31', 80000, 'annual', 12, 6667, 78, 88, 7, 12, 2, 18, 12.3, 6667, '2024-07-01', 5, '2024-05-15', 'Great potential for upselling'),

('DataFlow Inc', 'team@dataflow.com', '+1-555-0103', 'active', 'Enterprise', 'sarah.johnson@company.com', 'John Smith', 'Data Analytics',
 '2024-03-10', '2025-03-09', 150000, 'annual', 12, 12500, 92, 95, 9, 20, 4, 30, 18.7, 12500, '2024-07-10', 4, '2024-06-30', 'High-value client, expansion opportunities'),

-- At-risk clients
('StartupXYZ', 'founder@startupxyz.com', '+1-555-0104', 'at-risk', 'Startup', 'lisa.wilson@company.com', 'Bob Johnson', 'MVP Development',
 '2024-04-01', '2024-10-01', 40000, 'semi-annual', 6, 6667, 45, 65, 6, 8, 1, 12, 8.2, 6667, '2024-07-01', 3, '2024-04-15', 'Struggling with budget, needs attention'),

('CloudVentures', 'info@cloudventures.net', '+1-555-0105', 'at-risk', 'Growth', 'mike.davis@company.com', 'Jane Doe', 'Cloud Migration',
 '2024-01-20', '2024-07-20', 60000, 'semi-annual', 6, 10000, 60, 70, 5, 6, 1, 15, 10.5, 10000, '2024-06-20', 3, '2024-03-10', 'Behind on deliverables, communication issues'),

-- New clients
('NextGen Systems', 'contact@nextgen.tech', '+1-555-0106', 'new', 'Enterprise', 'sarah.johnson@company.com', 'John Smith', 'AI Integration',
 '2024-07-01', '2025-06-30', 200000, 'annual', 12, 16667, 15, 80, NULL, 5, 0, 8, 5.2, 16667, '2024-07-01', NULL, NULL, 'New enterprise client, high expectations'),

('AgileStart', 'team@agilestart.io', '+1-555-0107', 'new', 'Startup', 'lisa.wilson@company.com', 'Bob Johnson', 'Product Development',
 '2024-07-15', '2025-01-15', 30000, 'semi-annual', 6, 5000, 25, 75, NULL, 3, 0, 5, 2.8, 5000, '2024-07-15', NULL, NULL, 'Promising startup, needs guidance'),

-- Churned client
('OldTech Legacy', 'admin@oldtech.com', '+1-555-0108', 'churned', 'Enterprise', NULL, 'John Smith', 'Legacy Modernization',
 '2023-08-01', '2024-02-01', 90000, 'semi-annual', 6, 0, 100, 45, 4, 18, 2, 22, 0, 0, '2024-02-01', 2, '2023-12-15', 'Contract ended, dissatisfied with results');

-- Insert some notifications
INSERT INTO public.notifications (user_id, title, message, type, related_table, related_id)
SELECT 
  (SELECT id FROM auth.users LIMIT 1),
  'Client Health Alert',
  'StartupXYZ health score has dropped to 65%',
  'warning',
  'clients',
  id
FROM public.clients WHERE name = 'StartupXYZ'
LIMIT 1;

INSERT INTO public.notifications (user_id, title, message, type, related_table, related_id)
SELECT 
  (SELECT id FROM auth.users LIMIT 1),
  'New Client Onboarded',
  'NextGen Systems has been successfully onboarded',
  'success',
  'clients',
  id
FROM public.clients WHERE name = 'NextGen Systems'
LIMIT 1;