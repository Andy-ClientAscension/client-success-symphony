-- Configure secure OTP settings and enable password protection
-- These settings will help secure the authentication system

-- Set OTP expiry to recommended threshold (1 hour = 3600 seconds)
UPDATE auth.config 
SET otp_expiry = 3600 
WHERE true;

-- Note: Leaked password protection must be enabled in Supabase dashboard
-- under Authentication > Settings > Password Protection
-- This cannot be configured via SQL migration