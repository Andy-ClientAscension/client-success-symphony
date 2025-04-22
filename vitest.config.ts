
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/tests/setup.ts',
        '**/*.d.ts',
        '**/*.config.*',
        '**/*.test.*',
        '**/index.ts'
      ],
    },
    typecheck: {
      tsconfig: './tsconfig.json',
      include: ['src/**/*.{test,spec}.{ts,tsx}']
    },
    deps: {
      inline: ['jest-axe']
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
