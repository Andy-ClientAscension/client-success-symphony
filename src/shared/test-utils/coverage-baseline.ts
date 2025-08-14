import { vi } from 'vitest';

// Coverage baseline configuration
export const COVERAGE_BASELINES = {
  // Minimum coverage thresholds for different file types
  components: {
    statements: 80,
    branches: 75,
    functions: 80,
    lines: 80
  },
  hooks: {
    statements: 85,
    branches: 80,
    functions: 85,
    lines: 85
  },
  services: {
    statements: 90,
    branches: 85,
    functions: 90,
    lines: 90
  },
  utils: {
    statements: 95,
    branches: 90,
    functions: 95,
    lines: 95
  }
};

// Test quality metrics
export interface TestQualityMetrics {
  componentsCovered: number;
  totalComponents: number;
  hooksCovered: number;
  totalHooks: number;
  servicesCovered: number;
  totalServices: number;
  criticalPathsCovered: number;
  totalCriticalPaths: number;
}

// Critical user paths that must be tested
export const CRITICAL_PATHS = [
  'user-authentication',
  'client-management',
  'data-persistence',
  'error-handling',
  'navigation',
  'form-submission'
];

// Generate coverage report
export function generateCoverageBaseline(): TestQualityMetrics {
  return {
    componentsCovered: 0,
    totalComponents: 0,
    hooksCovered: 0,
    totalHooks: 0,
    servicesCovered: 0,
    totalServices: 0,
    criticalPathsCovered: 0,
    totalCriticalPaths: CRITICAL_PATHS.length
  };
}

// Test runner configuration
export const testConfig = {
  // Setup for different test types
  unit: {
    testMatch: ['**/__tests__/**/*.test.{ts,tsx}'],
    setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
    testEnvironment: 'jsdom'
  },
  
  integration: {
    testMatch: ['**/__tests__/**/*.integration.test.{ts,tsx}'],
    setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
    testEnvironment: 'jsdom'
  },
  
  e2e: {
    testMatch: ['**/__tests__/**/*.e2e.test.{ts,tsx}'],
    testEnvironment: 'node'
  }
};

// Mock patterns for consistent testing
export const commonMocks = {
  // Mock timers for consistent time-based testing
  setupTimers: () => {
    vi.useFakeTimers();
    return () => vi.useRealTimers();
  },

  // Mock fetch for API testing
  setupFetch: () => {
    const mockFetch = vi.fn();
    global.fetch = mockFetch;
    return mockFetch;
  },

  // Mock localStorage/sessionStorage
  setupStorage: () => {
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn()
    };
    
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock
    });
    
    return localStorageMock;
  },

  // Mock window methods
  setupWindow: () => {
    const mockReload = vi.fn();
    const mockOpen = vi.fn();
    
    Object.defineProperty(window, 'location', {
      value: {
        reload: mockReload,
        href: 'http://localhost:3000'
      },
      writable: true
    });
    
    window.open = mockOpen;
    
    return { mockReload, mockOpen };
  }
};

// Test utilities for specific patterns
export const testPatterns = {
  // Test component rendering
  renderTest: (componentName: string) => ({
    'renders without crashing': `should render ${componentName} without errors`,
    'displays correct content': `should display expected content in ${componentName}`,
    'handles props correctly': `should handle props correctly in ${componentName}`
  }),

  // Test hook behavior
  hookTest: (hookName: string) => ({
    'returns expected values': `should return expected values from ${hookName}`,
    'handles state changes': `should handle state changes in ${hookName}`,
    'handles errors': `should handle errors in ${hookName}`
  }),

  // Test async operations
  asyncTest: (operationName: string) => ({
    'handles success': `should handle successful ${operationName}`,
    'handles failure': `should handle failed ${operationName}`,
    'handles loading states': `should handle loading states during ${operationName}`
  })
};

// Quality gates for PR merging
export const QUALITY_GATES = {
  minCoverage: 80,
  maxComplexity: 10,
  maxFileSize: 500, // lines
  maxComponentProps: 10,
  maxHookDependencies: 5
};

// Generate test file template
export function generateTestTemplate(
  fileName: string,
  type: 'component' | 'hook' | 'service' | 'util'
): string {
  const patterns = testPatterns[type === 'component' ? 'renderTest' : 
                               type === 'hook' ? 'hookTest' : 'asyncTest'];
  
  return `
import { describe, it, expect, vi } from 'vitest';
import { ${type === 'component' ? 'render, screen' : ''} } from '@/shared/test-utils';

describe('${fileName}', () => {
  ${Object.entries(patterns).map(([key, description]) => `
  it('${description}', () => {
    // TODO: Implement test
    expect(true).toBe(true);
  });`).join('\n')}
});
`;
}