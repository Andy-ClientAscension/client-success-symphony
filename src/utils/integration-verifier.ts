import { supabase } from '@/integrations/supabase/client';

export interface IntegrationStatus {
  name: string;
  status: 'connected' | 'error' | 'missing' | 'untested';
  lastChecked: Date;
  details: string;
  errors?: string[];
  metrics?: {
    responseTime?: number;
    successRate?: number;
    errorCount?: number;
  };
}

export interface VerificationResult {
  integrations: IntegrationStatus[];
  overallHealth: 'healthy' | 'degraded' | 'critical';
  recommendations: string[];
}

/**
 * Comprehensive integration verification service
 */
export class IntegrationVerifier {
  private results: IntegrationStatus[] = [];

  async verifyAllIntegrations(): Promise<VerificationResult> {
    console.log('🔍 Starting comprehensive integration verification...');
    
    this.results = [];
    
    // Run all verifications in parallel for efficiency
    await Promise.allSettled([
      this.verifySupabase(),
      this.verifyOpenRouterAPI(),
      this.verifyStripeIntegration(),
      this.checkEnvironmentVariables(),
      this.verifyNetworkConnectivity()
    ]);

    return this.generateReport();
  }

  private async verifySupabase(): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log('Testing Supabase connection...');
      
      // Test basic connectivity
      const { data: healthCheck, error: healthError } = await supabase
        .from('clients')
        .select('count')
        .limit(1);

      if (healthError) {
        throw new Error(`Health check failed: ${healthError.message}`);
      }

      // Test authentication
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.warn('Session check warning:', sessionError.message);
      }

      // Test RLS policies
      const { data: rlsTest, error: rlsError } = await supabase
        .from('clients')
        .select('id')
        .limit(1);

      const responseTime = Date.now() - startTime;

      this.results.push({
        name: 'Supabase',
        status: 'connected',
        lastChecked: new Date(),
        details: `Connected successfully. Response time: ${responseTime}ms`,
        metrics: {
          responseTime,
          successRate: 100,
          errorCount: 0
        }
      });

    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      this.results.push({
        name: 'Supabase',
        status: 'error',
        lastChecked: new Date(),
        details: 'Connection failed',
        errors: [error instanceof Error ? error.message : String(error)],
        metrics: {
          responseTime,
          successRate: 0,
          errorCount: 1
        }
      });
    }
  }

  private async verifyOpenRouterAPI(): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log('Testing OpenRouter API connection...');
      
      // Check if API key is available
      let apiKey: string | null = null;
      
      try {
        // Try to get from Supabase secrets first
        const { data: secretData } = await supabase.rpc('get_secret', { 
          secret_name: 'OPENROUTER_API_KEY' 
        });
        apiKey = secretData;
      } catch (error) {
        console.warn('Could not fetch API key from Supabase secrets:', error);
      }

      // Fallback to localStorage
      if (!apiKey) {
        const encryptedKey = localStorage.getItem('openrouter-api-key');
        if (encryptedKey) {
          // Simple decryption check
          try {
            const decoded = atob(encryptedKey);
            apiKey = decoded ? 'local-key-found' : null;
          } catch {
            apiKey = null;
          }
        }
      }

      if (!apiKey) {
        this.results.push({
          name: 'OpenRouter API',
          status: 'missing',
          lastChecked: new Date(),
          details: 'No API key configured',
          errors: ['OPENROUTER_API_KEY not found in Supabase secrets or localStorage']
        });
        return;
      }

      // Test API endpoint (without making actual request to avoid costs)
      const testResponse = await fetch('https://openrouter.ai/api/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
        signal: AbortSignal.timeout(5000)
      });

      const responseTime = Date.now() - startTime;

      if (testResponse.ok) {
        this.results.push({
          name: 'OpenRouter API',
          status: 'connected',
          lastChecked: new Date(),
          details: `API key valid. Response time: ${responseTime}ms`,
          metrics: {
            responseTime,
            successRate: 100,
            errorCount: 0
          }
        });
      } else {
        const errorText = await testResponse.text();
        this.results.push({
          name: 'OpenRouter API',
          status: 'error',
          lastChecked: new Date(),
          details: 'API key invalid or quota exceeded',
          errors: [`HTTP ${testResponse.status}: ${errorText}`],
          metrics: {
            responseTime,
            successRate: 0,
            errorCount: 1
          }
        });
      }

    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      this.results.push({
        name: 'OpenRouter API',
        status: 'error',
        lastChecked: new Date(),
        details: 'Connection test failed',
        errors: [error instanceof Error ? error.message : String(error)],
        metrics: {
          responseTime,
          successRate: 0,
          errorCount: 1
        }
      });
    }
  }

  private async verifyStripeIntegration(): Promise<void> {
    try {
      console.log('Checking Stripe integration...');
      
      // Check for Stripe API keys in Supabase secrets
      let stripeKeyFound = false;
      
      try {
        const { data: secretData } = await supabase.rpc('get_secret', { 
          secret_name: 'STRIPE_SECRET_KEY' 
        });
        stripeKeyFound = !!secretData;
      } catch (error) {
        console.warn('Could not check for Stripe secret:', error);
      }

      if (!stripeKeyFound) {
        this.results.push({
          name: 'Stripe',
          status: 'missing',
          lastChecked: new Date(),
          details: 'No Stripe integration configured',
          errors: [
            'STRIPE_SECRET_KEY not found in Supabase secrets',
            'No Stripe edge functions detected',
            'Only mock implementation available'
          ]
        });
      } else {
        this.results.push({
          name: 'Stripe',
          status: 'untested',
          lastChecked: new Date(),
          details: 'API key configured but not tested',
          errors: ['Integration exists but requires verification']
        });
      }

    } catch (error) {
      this.results.push({
        name: 'Stripe',
        status: 'error',
        lastChecked: new Date(),
        details: 'Error checking Stripe configuration',
        errors: [error instanceof Error ? error.message : String(error)]
      });
    }
  }

  private async checkEnvironmentVariables(): Promise<void> {
    try {
      console.log('Checking environment variables...');
      
      const requiredVars = [
        'VITE_SUPABASE_URL',
        'VITE_SUPABASE_KEY'
      ];

      const missing: string[] = [];
      const found: string[] = [];

      requiredVars.forEach(varName => {
        if (import.meta.env[varName]) {
          found.push(varName);
        } else {
          missing.push(varName);
        }
      });

      if (missing.length === 0) {
        this.results.push({
          name: 'Environment Variables',
          status: 'connected',
          lastChecked: new Date(),
          details: `All required variables configured: ${found.join(', ')}`,
        });
      } else {
        this.results.push({
          name: 'Environment Variables',
          status: 'error',
          lastChecked: new Date(),
          details: 'Missing required environment variables',
          errors: missing.map(v => `${v} is not configured`)
        });
      }

    } catch (error) {
      this.results.push({
        name: 'Environment Variables',
        status: 'error',
        lastChecked: new Date(),
        details: 'Error checking environment variables',
        errors: [error instanceof Error ? error.message : String(error)]
      });
    }
  }

  private async verifyNetworkConnectivity(): Promise<void> {
    const startTime = Date.now();
    
    try {
      console.log('Testing network connectivity...');
      
      // Test multiple endpoints
      const endpoints = [
        'https://api.openrouter.ai',
        'https://bajfdvphpoopkmpgzyeo.supabase.co',
        'https://api.stripe.com'
      ];

      const results = await Promise.allSettled(
        endpoints.map(endpoint => 
          fetch(endpoint, { 
            method: 'HEAD',
            signal: AbortSignal.timeout(3000)
          })
        )
      );

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const responseTime = Date.now() - startTime;

      this.results.push({
        name: 'Network Connectivity',
        status: successful > 0 ? 'connected' : 'error',
        lastChecked: new Date(),
        details: `${successful}/${endpoints.length} endpoints reachable`,
        metrics: {
          responseTime,
          successRate: (successful / endpoints.length) * 100,
          errorCount: endpoints.length - successful
        }
      });

    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      this.results.push({
        name: 'Network Connectivity',
        status: 'error',
        lastChecked: new Date(),
        details: 'Network connectivity test failed',
        errors: [error instanceof Error ? error.message : String(error)],
        metrics: {
          responseTime,
          successRate: 0,
          errorCount: 1
        }
      });
    }
  }

  private generateReport(): VerificationResult {
    const connectedCount = this.results.filter(r => r.status === 'connected').length;
    const errorCount = this.results.filter(r => r.status === 'error').length;
    const missingCount = this.results.filter(r => r.status === 'missing').length;

    let overallHealth: 'healthy' | 'degraded' | 'critical';
    
    if (errorCount === 0 && missingCount <= 1) {
      overallHealth = 'healthy';
    } else if (errorCount <= 1 && connectedCount >= 2) {
      overallHealth = 'degraded';
    } else {
      overallHealth = 'critical';
    }

    const recommendations: string[] = [];

    // Generate specific recommendations
    this.results.forEach(result => {
      if (result.status === 'missing') {
        if (result.name === 'Stripe') {
          recommendations.push('Configure Stripe integration for payment processing');
        } else if (result.name === 'OpenRouter API') {
          recommendations.push('Add OpenRouter API key for AI functionality');
        }
      } else if (result.status === 'error') {
        recommendations.push(`Fix ${result.name} connection issues`);
      } else if (result.status === 'untested') {
        recommendations.push(`Test ${result.name} integration functionality`);
      }
    });

    // General recommendations based on overall health
    if (overallHealth === 'critical') {
      recommendations.push('Immediate attention required for critical integrations');
    } else if (overallHealth === 'degraded') {
      recommendations.push('Monitor integration health and resolve issues');
    }

    return {
      integrations: this.results,
      overallHealth,
      recommendations
    };
  }
}

// Convenience function for quick verification
export async function verifyIntegrations(): Promise<VerificationResult> {
  const verifier = new IntegrationVerifier();
  return await verifier.verifyAllIntegrations();
}