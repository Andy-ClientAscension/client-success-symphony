/**
 * Test Fixtures
 * Mock data for consistent testing
 */

import { Client, AutomationWebhook, DashboardMetrics } from '@/types/common';

// User fixtures
export const testUsers = {
  authenticated: {
    id: 'auth-user-1',
    email: 'authenticated@example.com',
    name: 'Authenticated User',
    avatar: null,
  },
  admin: {
    id: 'admin-user-1',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'admin',
  },
  regular: {
    id: 'regular-user-1',
    email: 'regular@example.com',
    name: 'Regular User',
    role: 'user',
  },
};

// Client fixtures
export const testClients: Client[] = [
  {
    id: 'client-1',
    name: 'Alice Johnson',
    email: 'alice@company.com',
    phone: '+1234567890',
    company: 'Tech Innovations Inc',
    status: 'Lead',
    team: 'Sales Team A',
    notes: 'Interested in enterprise package',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
    lastContact: new Date('2024-01-18'),
    value: 15000,
  },
  {
    id: 'client-2',
    name: 'Bob Smith',
    email: 'bob@startup.com',
    phone: '+1234567891',
    company: 'Startup Solutions',
    status: 'Prospect',
    team: 'Sales Team A',
    notes: 'Needs pricing for small team',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-22'),
    lastContact: new Date('2024-01-21'),
    value: 5000,
  },
  {
    id: 'client-3',
    name: 'Carol Davis',
    email: 'carol@enterprise.com',
    phone: '+1234567892',
    company: 'Enterprise Corp',
    status: 'Negotiation',
    team: 'Sales Team B',
    notes: 'Ready to close, waiting on legal approval',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-25'),
    lastContact: new Date('2024-01-24'),
    value: 50000,
  },
  {
    id: 'client-4',
    name: 'David Wilson',
    email: 'david@freelance.com',
    phone: '+1234567893',
    company: 'Freelance Design',
    status: 'Closed Won',
    team: 'Sales Team B',
    notes: 'Great experience, potential for referrals',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-30'),
    lastContact: new Date('2024-01-28'),
    value: 8000,
  },
];

// Webhook fixtures
export const testWebhooks: AutomationWebhook[] = [
  {
    id: 'webhook-1',
    name: 'Zapier Lead Notification',
    url: 'https://hooks.zapier.com/test/abc123',
    service: 'zapier',
    enabled: true,
    events: ['lead_created', 'status_changed'],
    status: 'active',
    lastTriggered: new Date('2024-01-25T10:30:00Z'),
    headers: {
      'Content-Type': 'application/json',
      'X-Custom-Header': 'test-value',
    },
  },
  {
    id: 'webhook-2',
    name: 'Make CRM Sync',
    url: 'https://hook.make.com/test/xyz789',
    service: 'make',
    enabled: false,
    events: ['client_updated'],
    status: 'inactive',
    lastTriggered: null,
  },
  {
    id: 'webhook-3',
    name: 'Slack Notifications',
    url: 'https://hooks.slack.com/test/def456',
    service: 'slack',
    enabled: true,
    events: ['deal_closed', 'milestone_reached'],
    status: 'active',
    lastTriggered: new Date('2024-01-24T15:45:00Z'),
  },
];

// Dashboard metrics fixtures
export const testMetrics: DashboardMetrics = {
  totalClients: 150,
  activeClients: 120,
  conversionRate: 0.28,
  revenue: 285000,
  growthRate: 0.15,
  averageDealSize: 12500,
  monthlyRecurring: 45000,
  churnRate: 0.05,
};

// Form data fixtures
export const testFormData = {
  validLogin: {
    email: 'test@example.com',
    password: 'ValidPassword123!',
  },
  invalidLogin: {
    email: 'invalid@example.com',
    password: 'wrong-password',
  },
  validRegistration: {
    email: 'newuser@example.com',
    password: 'SecurePass123!',
    confirmPassword: 'SecurePass123!',
    inviteCode: 'VALID_INVITE_CODE',
  },
  invalidRegistration: {
    email: 'invalid-email',
    password: '123',
    confirmPassword: '456',
    inviteCode: 'INVALID_CODE',
  },
  validClient: {
    name: 'New Client',
    email: 'newclient@company.com',
    phone: '+1555123456',
    company: 'New Company Ltd',
    status: 'Lead',
    notes: 'Interested in our services',
  },
  validWebhook: {
    name: 'Test Webhook',
    url: 'https://example.com/webhook',
    service: 'custom',
    events: ['test_event'],
  },
};

// Error scenarios
export const testErrors = {
  networkError: new Error('Network request failed'),
  authError: new Error('Authentication failed'),
  validationError: new Error('Validation failed: Invalid email format'),
  serverError: new Error('Internal server error'),
  timeoutError: new Error('Request timeout'),
};

// API responses
export const testApiResponses = {
  success: {
    data: { message: 'Operation successful' },
    status: 200,
    ok: true,
  },
  created: {
    data: { id: 'new-id', message: 'Resource created' },
    status: 201,
    ok: true,
  },
  notFound: {
    error: 'Resource not found',
    status: 404,
    ok: false,
  },
  unauthorized: {
    error: 'Unauthorized access',
    status: 401,
    ok: false,
  },
  serverError: {
    error: 'Internal server error',
    status: 500,
    ok: false,
  },
};

// Test scenarios
export const testScenarios = {
  authentication: {
    successfulLogin: {
      input: testFormData.validLogin,
      expectedResult: 'redirect to dashboard',
    },
    failedLogin: {
      input: testFormData.invalidLogin,
      expectedResult: 'show error message',
    },
    logout: {
      expectedResult: 'redirect to login',
    },
  },
  clientManagement: {
    createClient: {
      input: testFormData.validClient,
      expectedResult: 'client added to list',
    },
    updateClientStatus: {
      clientId: 'client-1',
      newStatus: 'Prospect',
      expectedResult: 'status updated in UI',
    },
    deleteClient: {
      clientId: 'client-2',
      expectedResult: 'client removed from list',
    },
  },
  webhookManagement: {
    createWebhook: {
      input: testFormData.validWebhook,
      expectedResult: 'webhook added to list',
    },
    triggerWebhook: {
      webhookId: 'webhook-1',
      expectedResult: 'success notification',
    },
    toggleWebhook: {
      webhookId: 'webhook-2',
      expectedResult: 'status toggled',
    },
  },
};

// Helper functions for test data
export function createTestClient(overrides: Partial<Client> = {}): Client {
  return {
    ...testClients[0],
    id: `test-client-${Date.now()}`,
    ...overrides,
  };
}

export function createTestWebhook(overrides: Partial<AutomationWebhook> = {}): AutomationWebhook {
  return {
    ...testWebhooks[0],
    id: `test-webhook-${Date.now()}`,
    ...overrides,
  };
}

export function createTestMetrics(overrides: Partial<DashboardMetrics> = {}): DashboardMetrics {
  return {
    ...testMetrics,
    ...overrides,
  };
}