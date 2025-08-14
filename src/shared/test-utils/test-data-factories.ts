import { faker } from '@faker-js/faker';

// Client test data factory
export function createMockClient(overrides: Partial<any> = {}) {
  return {
    id: faker.string.uuid(),
    name: faker.company.name(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    status: faker.helpers.arrayElement(['active', 'inactive', 'pending']),
    created_at: faker.date.past().toISOString(),
    updated_at: faker.date.recent().toISOString(),
    ...overrides
  };
}

// User test data factory
export function createMockUser(overrides: Partial<any> = {}) {
  return {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    name: faker.person.fullName(),
    avatar_url: faker.image.avatar(),
    created_at: faker.date.past().toISOString(),
    last_sign_in_at: faker.date.recent().toISOString(),
    ...overrides
  };
}

// Error test data factory
export function createMockError(overrides: Partial<Error> = {}) {
  const error = new Error(overrides.message || faker.lorem.sentence());
  error.name = overrides.name || 'TestError';
  error.stack = overrides.stack || error.stack;
  return error;
}

// API Response factory
export function createMockApiResponse<T>(data: T, overrides: Partial<any> = {}) {
  return {
    data,
    error: null,
    status: 200,
    statusText: 'OK',
    ...overrides
  };
}

// API Error factory
export function createMockApiError(message = 'API Error', status = 500) {
  return {
    data: null,
    error: {
      message,
      status,
      code: `ERROR_${status}`
    }
  };
}

// Pagination data factory
export function createMockPaginatedResponse<T>(
  items: T[], 
  page = 1, 
  limit = 10,
  total?: number
) {
  const actualTotal = total || items.length;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedItems = items.slice(startIndex, endIndex);

  return {
    data: paginatedItems,
    pagination: {
      page,
      limit,
      total: actualTotal,
      totalPages: Math.ceil(actualTotal / limit),
      hasNext: endIndex < actualTotal,
      hasPrev: page > 1
    }
  };
}

// Form data factory
export function createMockFormData(overrides: Record<string, any> = {}) {
  return {
    name: faker.company.name(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    message: faker.lorem.paragraph(),
    ...overrides
  };
}

// Multiple items factory
export function createMockClients(count = 5, overrides: Partial<any> = {}) {
  return Array.from({ length: count }, () => createMockClient(overrides));
}

export function createMockUsers(count = 3, overrides: Partial<any> = {}) {
  return Array.from({ length: count }, () => createMockUser(overrides));
}

// State factories for different UI states
export const mockStates = {
  loading: {
    isLoading: true,
    error: null,
    data: null
  },
  
  error: (error = createMockError()) => ({
    isLoading: false,
    error,
    data: null
  }),
  
  success: <T>(data: T) => ({
    isLoading: false,
    error: null,
    data
  }),
  
  empty: {
    isLoading: false,
    error: null,
    data: []
  }
};