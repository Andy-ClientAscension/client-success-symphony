
import { getAllClients } from '@/lib/data';
import { loadData, STORAGE_KEYS } from '@/utils/persistence';

export interface DiagnosticResult {
  category: string;
  status: 'passed' | 'warning' | 'critical';
  message: string;
  details?: string;
  remediation?: string;
}

export interface DiagnosticReport {
  timestamp: Date;
  results: DiagnosticResult[];
  summary: {
    passed: number;
    warnings: number;
    critical: number;
  };
  status: 'passed' | 'warning' | 'critical';
}

export async function runComprehensiveDiagnostic(): Promise<DiagnosticReport> {
  const results: DiagnosticResult[] = [];
  let clients = [];
  const report: DiagnosticReport = {
    timestamp: new Date(),
    results: [],
    summary: { passed: 0, warnings: 0, critical: 0 },
    status: 'passed'
  };

  // Try to safely get clients with error handling
  try {
    clients = getAllClients();
  } catch (error) {
    results.push({
      category: 'Data Access',
      status: 'critical',
      message: 'Failed to load client data',
      details: error instanceof Error ? error.message : 'Unknown error occurred when loading client data',
      remediation: 'Check network connectivity and API endpoints.'
    });
    // Continue with other checks
  }

  // 1. Data Integrity Checks
  if (clients.length === 0) {
    results.push({
      category: 'Data Integrity',
      status: 'warning',
      message: 'No clients found in the system',
      details: 'The client database appears to be empty, which may indicate a data loading issue.',
      remediation: 'Try importing client data or creating test clients to verify the system is working correctly.'
    });
  }

  // Check for incomplete client records
  const incompleteClients = clients.filter(client => 
    !client.name || !client.status || (client.progress !== undefined && client.progress < 10)
  );
  
  if (incompleteClients.length > 0) {
    results.push({
      category: 'Data Integrity',
      status: incompleteClients.length > 5 ? 'critical' : 'warning',
      message: `${incompleteClients.length} clients have incomplete profiles`,
      details: `Client IDs with incomplete data: ${incompleteClients.map(c => c.id).join(', ')}`,
      remediation: 'Update client records to include all required fields and information.'
    });
  }

  // 2. Configuration Checks
  const persistEnabled = localStorage.getItem("persistDashboard") === "true";
  if (!persistEnabled) {
    results.push({
      category: 'Configuration',
      status: 'warning',
      message: 'Data persistence is disabled',
      details: 'Changes to client data will not be saved between sessions.',
      remediation: 'Enable data persistence in the settings menu to ensure data is saved.'
    });
  }

  // 3. API Integration Checks
  const hasAPIKey = !!localStorage.getItem("openai_api_key");
  if (!hasAPIKey) {
    results.push({
      category: 'API Integration',
      status: 'warning',
      message: 'OpenAI API key not configured',
      details: 'AI assistant functionality will be limited without an API key.',
      remediation: 'Add your OpenAI API key in the AI Assistant settings.'
    });
  }

  // 4. Performance Checks
  const clientBatches = [];
  for (let i = 0; i < clients.length; i += 100) {
    clientBatches.push(clients.slice(i, i + 100));
  }
  
  if (clients.length > 500) {
    results.push({
      category: 'Performance',
      status: 'warning',
      message: 'Large client dataset may impact performance',
      details: `Current client count (${clients.length}) exceeds recommended limit for optimal performance.`,
      remediation: 'Consider filtering or paginating large datasets to improve dashboard responsiveness.'
    });
  }

  // 5. Error Monitoring Check - Removed Sentry-specific checks

  // 6. Network Connectivity Check
  try {
    const networkTest = await testNetworkConnectivity();
    if (!networkTest.success) {
      results.push({
        category: 'Network',
        status: 'critical',
        message: 'Network connectivity issues detected',
        details: networkTest.message,
        remediation: 'Check your internet connection and ensure API endpoints are accessible.'
      });
    } else {
      results.push({
        category: 'Network',
        status: 'passed',
        message: 'Network connectivity verified',
      });
    }
  } catch (error) {
    results.push({
      category: 'Network',
      status: 'warning',
      message: 'Could not test network connectivity',
      details: error instanceof Error ? error.message : 'Unknown error occurred during network test',
      remediation: 'Ensure your browser has network access.'
    });
  }

  // 7. Browser Compatibility
  const userAgent = navigator.userAgent;
  const isIE = /MSIE|Trident/.test(userAgent);
  if (isIE) {
    results.push({
      category: 'Browser Compatibility',
      status: 'critical',
      message: 'Internet Explorer detected',
      details: 'The dashboard is not fully compatible with Internet Explorer and may have rendering issues.',
      remediation: 'Switch to a modern browser like Chrome, Firefox, Edge, or Safari.'
    });
  }

  // 8. Storage Usage
  try {
    const storageEstimate = 'storage' in navigator && navigator.storage ? 
      await navigator.storage.estimate() : null;
    
    if (storageEstimate && storageEstimate.usage && storageEstimate.quota) {
      const usagePercentage = (storageEstimate.usage / storageEstimate.quota) * 100;
      if (usagePercentage > 80) {
        results.push({
          category: 'Storage',
          status: 'warning',
          message: 'Local storage nearing capacity',
          details: `Using ${usagePercentage.toFixed(1)}% of available storage quota.`,
          remediation: 'Clear browser cache or remove unused application data.'
        });
      }
    }
  } catch (error) {
    console.error('Error checking storage usage:', error);
  }

  // Calculate summary statistics
  report.results = results;
  report.summary.passed = results.filter(r => r.status === 'passed').length;
  report.summary.warnings = results.filter(r => r.status === 'warning').length;
  report.summary.critical = results.filter(r => r.status === 'critical').length;
  
  // Determine overall status
  if (report.summary.critical > 0) {
    report.status = 'critical';
  } else if (report.summary.warnings > 0) {
    report.status = 'warning';
  } else {
    report.status = 'passed';
  }

  return report;
}

// Helper functions for diagnostic checks
async function testNetworkConnectivity(): Promise<{success: boolean, message: string}> {
  try {
    // Just test if we can reach a common API endpoint
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch('https://httpbin.org/get', { 
      method: 'GET',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      return {
        success: false,
        message: `Network test failed with status: ${response.status}`
      };
    }
    
    return {
      success: true,
      message: 'Network connectivity test passed'
    };
  } catch (error) {
    if (error instanceof Error) {
      // Check for specific network error types
      if (error.name === 'AbortError') {
        return {
          success: false,
          message: 'Network request timed out'
        };
      }
      
      if (error.message.includes('CORS') || error.message.includes('cross-origin')) {
        return {
          success: false,
          message: 'CORS policy blocked network test'
        };
      }
      
      return {
        success: false,
        message: `Network error: ${error.message}`
      };
    }
    
    return {
      success: false,
      message: 'Unknown network error occurred'
    };
  }
}
