/**
 * Integration Test Examples
 * End-to-end user flow testing
 */

import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderWithProviders, screen, waitFor } from '../setup/test-utils';
import { testFormData, testClients } from '../fixtures/test-data';

// Mock entire user flow from login to dashboard operations
describe('User Flow Integration Tests', () => {
  describe('Complete Authentication Flow', () => {
    it('should complete login to dashboard flow', async () => {
      const mockAuthFlow = {
        login: vi.fn().mockResolvedValue(true),
        getUser: vi.fn().mockResolvedValue(testFormData.validLogin),
        redirectToDashboard: vi.fn(),
      };

      const AuthFlowApp = () => {
        const [isAuthenticated, setIsAuthenticated] = React.useState(false);
        const [isLoading, setIsLoading] = React.useState(false);
        
        const handleLogin = async (email: string, password: string) => {
          setIsLoading(true);
          try {
            const success = await mockAuthFlow.login(email, password);
            if (success) {
              setIsAuthenticated(true);
              mockAuthFlow.redirectToDashboard();
            }
          } finally {
            setIsLoading(false);
          }
        };

        if (isAuthenticated) {
          return (
            <div data-testid="dashboard">
              <h1>Dashboard</h1>
              <p>Welcome back!</p>
            </div>
          );
        }

        return (
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              handleLogin(
                formData.get('email') as string,
                formData.get('password') as string
              );
            }}
          >
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required />
            
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" required />
            
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        );
      };

      const { user } = renderWithProviders(<AuthFlowApp />);

      // Fill in login form
      await user.type(screen.getByLabelText(/email/i), testFormData.validLogin.email);
      await user.type(screen.getByLabelText(/password/i), testFormData.validLogin.password);
      
      // Submit form
      await user.click(screen.getByRole('button', { name: /login/i }));

      // Verify login was called with correct credentials
      expect(mockAuthFlow.login).toHaveBeenCalledWith(
        testFormData.validLogin.email,
        testFormData.validLogin.password
      );

      // Wait for dashboard to appear
      await waitFor(() => {
        expect(screen.getByTestId('dashboard')).toBeInTheDocument();
        expect(screen.getByText('Welcome back!')).toBeInTheDocument();
      });

      // Verify redirect was called
      expect(mockAuthFlow.redirectToDashboard).toHaveBeenCalled();
    });
  });

  describe('Client Management Workflow', () => {
    it('should handle complete client lifecycle', async () => {
      const mockClientApi = {
        getClients: vi.fn().mockResolvedValue(testClients),
        createClient: vi.fn().mockImplementation((clientData) => 
          Promise.resolve({ id: 'new-client', ...clientData })
        ),
        updateClient: vi.fn().mockResolvedValue({ ...testClients[0], status: 'Prospect' }),
        deleteClient: vi.fn().mockResolvedValue({ message: 'Client deleted' }),
      };

      const ClientManagementApp = () => {
        const [clients, setClients] = React.useState(testClients);
        const [showForm, setShowForm] = React.useState(false);
        const [isLoading, setIsLoading] = React.useState(false);

        const handleCreateClient = async (clientData: any) => {
          setIsLoading(true);
          try {
            const newClient = await mockClientApi.createClient(clientData);
            setClients(prev => [...prev, newClient]);
            setShowForm(false);
          } finally {
            setIsLoading(false);
          }
        };

        const handleUpdateStatus = async (clientId: string, newStatus: string) => {
          const updatedClient = await mockClientApi.updateClient(clientId, { status: newStatus });
          setClients(prev => prev.map(client => 
            client.id === clientId ? { ...client, status: newStatus } : client
          ));
        };

        const handleDeleteClient = async (clientId: string) => {
          await mockClientApi.deleteClient(clientId);
          setClients(prev => prev.filter(client => client.id !== clientId));
        };

        return (
          <div>
            <h1>Client Management</h1>
            
            <button onClick={() => setShowForm(true)}>Add New Client</button>
            
            <div data-testid="client-list">
              {clients.map(client => (
                <div key={client.id} data-testid={`client-${client.id}`}>
                  <h3>{client.name}</h3>
                  <p>Status: <span data-testid="client-status">{client.status}</span></p>
                  <select 
                    value={client.status}
                    onChange={(e) => handleUpdateStatus(client.id, e.target.value)}
                  >
                    <option value="Lead">Lead</option>
                    <option value="Prospect">Prospect</option>
                    <option value="Closed Won">Closed Won</option>
                  </select>
                  <button onClick={() => handleDeleteClient(client.id)}>Delete</button>
                </div>
              ))}
            </div>

            {showForm && (
              <form 
                data-testid="client-form"
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target as HTMLFormElement);
                  handleCreateClient({
                    name: formData.get('name'),
                    email: formData.get('email'),
                    company: formData.get('company'),
                    status: 'Lead'
                  });
                }}
              >
                <h3>Add New Client</h3>
                <label htmlFor="name">Name</label>
                <input id="name" name="name" required />
                
                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="email" required />
                
                <label htmlFor="company">Company</label>
                <input id="company" name="company" required />
                
                <button type="submit" disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create Client'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
              </form>
            )}
          </div>
        );
      };

      const { user } = renderWithProviders(<ClientManagementApp />);

      // Verify initial client list
      expect(screen.getByText('Client Management')).toBeInTheDocument();
      expect(screen.getAllByTestId(/^client-/)).toHaveLength(testClients.length);

      // Test adding a new client
      await user.click(screen.getByRole('button', { name: /add new client/i }));
      
      expect(screen.getByTestId('client-form')).toBeInTheDocument();
      
      await user.type(screen.getByLabelText(/name/i), 'New Test Client');
      await user.type(screen.getByLabelText(/email/i), 'newtest@example.com');
      await user.type(screen.getByLabelText(/company/i), 'Test Company');
      
      await user.click(screen.getByRole('button', { name: /create client/i }));

      // Verify API was called and client was added
      expect(mockClientApi.createClient).toHaveBeenCalledWith({
        name: 'New Test Client',
        email: 'newtest@example.com',
        company: 'Test Company',
        status: 'Lead'
      });

      // Test updating client status
      const firstClientSelect = screen.getAllByRole('combobox')[0];
      await user.selectOptions(firstClientSelect, 'Prospect');

      expect(mockClientApi.updateClient).toHaveBeenCalledWith(testClients[0].id, { status: 'Prospect' });

      // Test deleting a client
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      await user.click(deleteButtons[0]);

      expect(mockClientApi.deleteClient).toHaveBeenCalledWith(testClients[0].id);
    });
  });

  describe('Error Handling Integration', () => {
    it('should gracefully handle API errors', async () => {
      const mockFailingApi = {
        createClient: vi.fn().mockRejectedValue(new Error('Server error')),
      };

      const ErrorHandlingApp = () => {
        const [error, setError] = React.useState('');
        const [isLoading, setIsLoading] = React.useState(false);

        const handleSubmit = async (clientData: any) => {
          setIsLoading(true);
          setError('');
          try {
            await mockFailingApi.createClient(clientData);
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
          } finally {
            setIsLoading(false);
          }
        };

        return (
          <div>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleSubmit({ name: 'Test Client' });
            }}>
              <button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Client'}
              </button>
            </form>
            {error && (
              <div role="alert" data-testid="error-message">
                {error}
              </div>
            )}
          </div>
        );
      };

      const { user } = renderWithProviders(<ErrorHandlingApp />);

      await user.click(screen.getByRole('button', { name: /create client/i }));

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toHaveTextContent('Server error');
      });

      expect(mockFailingApi.createClient).toHaveBeenCalled();
    });
  });

  describe('Performance and Loading States', () => {
    it('should show appropriate loading states during async operations', async () => {
      const mockSlowApi = {
        getClients: vi.fn().mockImplementation(() => 
          new Promise(resolve => setTimeout(() => resolve(testClients), 100))
        ),
      };

      const LoadingStateApp = () => {
        const [clients, setClients] = React.useState<any[]>([]);
        const [isLoading, setIsLoading] = React.useState(false);

        const loadClients = async () => {
          setIsLoading(true);
          try {
            const data = await mockSlowApi.getClients();
            setClients(data);
          } finally {
            setIsLoading(false);
          }
        };

        React.useEffect(() => {
          loadClients();
        }, []);

        if (isLoading) {
          return <div data-testid="loading">Loading clients...</div>;
        }

        return (
          <div data-testid="client-list">
            <h1>Clients ({clients.length})</h1>
            {clients.map(client => (
              <div key={client.id}>{client.name}</div>
            ))}
          </div>
        );
      };

      renderWithProviders(<LoadingStateApp />);

      // Should show loading state initially
      expect(screen.getByTestId('loading')).toBeInTheDocument();
      expect(screen.getByText('Loading clients...')).toBeInTheDocument();

      // Wait for data to load
      await waitFor(() => {
        expect(screen.getByTestId('client-list')).toBeInTheDocument();
        expect(screen.getByText(`Clients (${testClients.length})`)).toBeInTheDocument();
      });

      expect(mockSlowApi.getClients).toHaveBeenCalled();
    });
  });
});