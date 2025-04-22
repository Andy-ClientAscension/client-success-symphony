
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignUp from '@/pages/SignUp';
import { MockAuthProvider } from '../utils/authTestUtils';

// Mock useToast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

// Mock react-router-dom navigate function
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual as any,
    useNavigate: () => vi.fn()
  };
});

describe('SignUp Page', () => {
  it('renders signup form correctly', () => {
    render(
      <MockAuthProvider>
        <SignUp />
      </MockAuthProvider>
    );
    
    expect(screen.getByText('Create an Account')).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/invitation code/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
  });
  
  it('validates form inputs', async () => {
    render(
      <MockAuthProvider>
        <SignUp />
      </MockAuthProvider>
    );
    
    const submitButton = screen.getByRole('button', { name: /sign up/i });
    fireEvent.click(submitButton);
    
    // Check validation messages
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      expect(screen.getByText(/please confirm your password/i)).toBeInTheDocument();
      expect(screen.getByText(/invitation code is required/i)).toBeInTheDocument();
    });
  });
  
  it('validates password match', async () => {
    const user = userEvent.setup();
    render(
      <MockAuthProvider>
        <SignUp />
      </MockAuthProvider>
    );
    
    // Fill out the form with mismatched passwords
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'password456');
    await user.type(screen.getByLabelText(/invitation code/i), 'INVITE123');
    
    const submitButton = screen.getByRole('button', { name: /sign up/i });
    await user.click(submitButton);
    
    // Check for password mismatch error
    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });
  
  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    
    // Create a properly mocked register function using vi.fn()
    const mockRegister = vi.fn().mockResolvedValue({ success: true, message: 'Success' });
    
    // Override the mock auth provider with our specific mock
    render(
      <MockAuthProvider>
        <SignUp />
      </MockAuthProvider>
    );
    
    // Access the register function from the AuthContext and override it with mockRegister
    // This part is handled through the MockAuthProvider which already contains mocked register function
    
    // Fill out the form with valid data
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'password123');
    await user.type(screen.getByLabelText(/invitation code/i), 'INVITE123');
    
    const submitButton = screen.getByRole('button', { name: /sign up/i });
    await user.click(submitButton);
    
    // Check loading state
    expect(screen.getByText(/creating your account/i)).toBeInTheDocument();
  });
});
