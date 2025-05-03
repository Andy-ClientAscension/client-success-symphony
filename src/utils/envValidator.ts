
/**
 * Validates that required environment variables are present
 * @returns Array of missing environment variables
 */
export function validateEnvironmentVariables(): string[] {
  const requiredEnvVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_KEY'
  ];
  
  const missingEnvVars = requiredEnvVars.filter(
    envVar => !import.meta.env[envVar]
  );
  
  return missingEnvVars;
}

/**
 * Checks if Supabase environment variables are configured
 * @returns Boolean indicating if Supabase is properly configured
 */
export function isSupabaseConfigured(): boolean {
  return !!import.meta.env.VITE_SUPABASE_URL && 
         !!import.meta.env.VITE_SUPABASE_KEY;
}

/**
 * Gets development fallbacks for environment variables when not set
 * Only use this in development, never in production!
 */
export function getDevelopmentFallbacks() {
  if (import.meta.env.MODE === 'production') {
    console.warn('Attempting to use development fallbacks in production!');
    return {};
  }
  
  return {
    VITE_SUPABASE_URL: 'https://bajfdvphpoopkmpgzyeo.supabase.co',
    VITE_SUPABASE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhamZkdnBocG9vcGttcGd6eWVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3MTM5NTYsImV4cCI6MjA2MDI4OTk1Nn0.QJ7M2iBALcCy_bvJXAIbwFZ8JDh0G3O-t_IgBfDTikE'
  };
}
