
import '@testing-library/jest-dom';
import { vi, afterEach, expect } from 'vitest';
import { cleanup } from '@testing-library/react';

// Add vi to the global scope
global.vi = vi;

// Explicitly declare vi as a global type
declare global {
  // eslint-disable-next-line no-var
  var vi: typeof import('vitest')['vi'];
}

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Clean up after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Add custom matchers if needed
expect.extend({
  // Add any custom matchers here
});

export {}; // Ensures the file is treated as a module
