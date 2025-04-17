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
  const clients = getAllClients();
  const report: DiagnosticReport = {
    timestamp: new Date(),
    results: [],
    summary: { passed: 0, warnings: 0, critical: 0 },
    status: 'passed'
  };

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

  // 5. Risk Assessment
  const atRiskClients = clients.filter(client => 
    client.status === 'at-risk' || (client.npsScore !== undefined && client.npsScore < 6)
  );
  
  if (atRiskClients.length > 0) {
    results.push({
      category: 'Client Health',
      status: atRiskClients.length > clients.length * 0.2 ? 'critical' : 'warning',
      message: `${atRiskClients.length} clients at risk of churning`,
      details: `${((atRiskClients.length / clients.length) * 100).toFixed(1)}% of clients show risk indicators.`,
      remediation: 'Review at-risk clients and develop retention strategies.'
    });
  }

  // 6. Browser Compatibility
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

  // 7. Storage Usage
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
