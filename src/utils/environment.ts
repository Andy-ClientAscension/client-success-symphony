/**
 * Environment configuration and validation utilities
 * Handles production vs development environment setup
 */

export interface EnvironmentConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  sentryDsn?: string;
  environment: 'development' | 'staging' | 'production';
  enableAnalytics: boolean;
  enableErrorTracking: boolean;
  apiBaseUrl: string;
}

/**
 * Get environment configuration with proper fallbacks
 */
export function getEnvironmentConfig(): EnvironmentConfig {
  const isDevelopment = import.meta.env.MODE === 'development';
  const isProduction = import.meta.env.MODE === 'production';
  
  return {
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'https://bajfdvphpoopkmpgzyeo.supabase.co',
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhamZkdnBocG9vcGttcGd6eWVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3MTM5NTYsImV4cCI6MjA2MDI4OTk1Nn0.QJ7M2iBALcCy_bvJXAIbwFZ8JDh0G3O-t_IgBfDTikE',
    sentryDsn: import.meta.env.VITE_SENTRY_DSN,
    environment: isProduction ? 'production' : isDevelopment ? 'development' : 'staging',
    enableAnalytics: isProduction || import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    enableErrorTracking: isProduction || import.meta.env.VITE_ENABLE_ERROR_TRACKING === 'true',
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || window.location.origin,
  };
}

/**
 * Validate that all required environment variables are present
 */
export function validateEnvironment(): { isValid: boolean; missingVars: string[] } {
  const config = getEnvironmentConfig();
  const missingVars: string[] = [];
  
  if (!config.supabaseUrl) {
    missingVars.push('VITE_SUPABASE_URL');
  }
  
  if (!config.supabaseAnonKey) {
    missingVars.push('VITE_SUPABASE_ANON_KEY');
  }
  
  // Only require Sentry DSN in production
  if (config.environment === 'production' && !config.sentryDsn) {
    console.warn('VITE_SENTRY_DSN not set - error tracking will be disabled in production');
  }
  
  return {
    isValid: missingVars.length === 0,
    missingVars
  };
}

/**
 * Get feature flags based on environment
 */
export function getFeatureFlags() {
  const config = getEnvironmentConfig();
  
  return {
    enableDebugMode: config.environment === 'development',
    enablePerformanceMonitoring: config.environment === 'production',
    enableDetailedLogging: config.environment !== 'production',
    enableExperimentalFeatures: config.environment === 'development',
    enableServiceWorker: config.environment === 'production',
  };
}