import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders } from '../render-helpers';
import { createTestQueryClient } from '../mock-providers';
import { createMockClient, createMockUser, mockStates } from '../test-data-factories';

describe('Test Utils', () => {
  describe('renderWithProviders', () => {
    it('renders component with providers', () => {
      const TestComponent = () => <div data-testid="test">Test Component</div>;
      
      const { getByTestId } = renderWithProviders(<TestComponent />);
      
      expect(getByTestId('test')).toBeInTheDocument();
    });

    it('provides QueryClient', () => {
      const TestComponent = () => {
        const queryClient = createTestQueryClient();
        return <div data-testid="query-client">{queryClient ? 'Provided' : 'Missing'}</div>;
      };
      
      const { getByTestId } = renderWithProviders(<TestComponent />);
      
      expect(getByTestId('query-client')).toHaveTextContent('Provided');
    });
  });

  describe('Test Data Factories', () => {
    it('creates mock client with default values', () => {
      const client = createMockClient();
      
      expect(client).toHaveProperty('id');
      expect(client).toHaveProperty('name');
      expect(client).toHaveProperty('email');
      expect(client).toHaveProperty('status');
      expect(typeof client.name).toBe('string');
    });

    it('creates mock client with overrides', () => {
      const client = createMockClient({ 
        name: 'Custom Client',
        status: 'active'
      });
      
      expect(client.name).toBe('Custom Client');
      expect(client.status).toBe('active');
    });

    it('creates mock user', () => {
      const user = createMockUser();
      
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('name');
    });
  });

  describe('Mock States', () => {
    it('creates loading state', () => {
      const state = mockStates.loading;
      
      expect(state.isLoading).toBe(true);
      expect(state.error).toBe(null);
      expect(state.data).toBe(null);
    });

    it('creates error state', () => {
      const error = new Error('Test error');
      const state = mockStates.error(error);
      
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(error);
      expect(state.data).toBe(null);
    });

    it('creates success state', () => {
      const data = { id: 1, name: 'Test' };
      const state = mockStates.success(data);
      
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe(null);
      expect(state.data).toBe(data);
    });
  });
});