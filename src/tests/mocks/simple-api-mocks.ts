/**
 * Simplified API Mock Handlers  
 * Basic mocking without MSW dependency
 */

// Mock data
export const mockClients = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    company: 'Acme Corp',
    status: 'Lead',
    team: 'Sales Team A',
    notes: 'Interested in premium package',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    value: 5000,
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+1234567891',
    company: 'Tech Solutions',
    status: 'Prospect',
    team: 'Sales Team B',
    notes: 'Follow up next week',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
    value: 7500,
  },
];

export const mockWebhooks = [
  {
    id: '1',
    name: 'Zapier Webhook',
    url: 'https://hooks.zapier.com/test1',
    service: 'zapier',
    enabled: true,
    events: ['trigger'],
    status: 'active',
    lastTriggered: '2024-01-01T12:00:00Z',
  },
  {
    id: '2',
    name: 'Make Webhook',
    url: 'https://hook.make.com/test2',
    service: 'make',
    enabled: false,
    events: ['trigger'],
    status: 'inactive',
    lastTriggered: null,
  },
];

export const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  avatar: null,
};

// Simple mock functions for testing
export const mockApiMethods = {
  // Auth endpoints
  login: vi.fn().mockResolvedValue({
    user: mockUser,
    session: {
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      expires_at: Date.now() + 3600000,
    },
  }),

  register: vi.fn().mockResolvedValue({
    user: mockUser,
    message: 'Registration successful',
  }),

  logout: vi.fn().mockResolvedValue({
    message: 'Logged out successfully',
  }),

  // Client endpoints
  getClients: vi.fn().mockResolvedValue(mockClients),
  createClient: vi.fn().mockImplementation((clientData) => 
    Promise.resolve({
      id: String(Date.now()),
      ...clientData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  ),
  updateClient: vi.fn().mockImplementation((id, updates) =>
    Promise.resolve({
      ...mockClients.find(c => c.id === id),
      ...updates,
      updatedAt: new Date().toISOString(),
    })
  ),
  deleteClient: vi.fn().mockResolvedValue({
    message: 'Client deleted successfully',
  }),

  // Webhook endpoints
  getWebhooks: vi.fn().mockResolvedValue(mockWebhooks),
  createWebhook: vi.fn().mockImplementation((webhookData) =>
    Promise.resolve({
      id: String(Date.now()),
      ...webhookData,
      status: 'active',
      lastTriggered: null,
    })
  ),
  triggerWebhook: vi.fn().mockResolvedValue({
    message: 'Webhook triggered successfully',
    triggeredAt: new Date().toISOString(),
  }),

  // Analytics endpoints
  getMetrics: vi.fn().mockResolvedValue({
    totalClients: 150,
    activeClients: 120,
    conversionRate: 0.25,
    revenue: 125000,
    growthRate: 0.15,
  }),
};

// Handler utilities
export function createMockResponse<T>(data: T, delay = 0) {
  return vi.fn().mockImplementation(() =>
    new Promise((resolve) => {
      setTimeout(() => resolve(data), delay);
    })
  );
}

export function createMockError(message = 'API Error', delay = 0) {
  return vi.fn().mockImplementation(() =>
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(message)), delay);
    })
  );
}

// Export empty handlers array for compatibility
export const apiHandlers: any[] = [];