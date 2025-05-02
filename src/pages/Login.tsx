
import React, { useState, useEffect } from 'react';
import { Layout } from "@/components/Layout/Layout";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate, useLocation } from 'react-router-dom';
import { LoginForm } from "@/components/auth/LoginForm";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<{ message: string; type?: string } | null>(null);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Check for auth error passed from Index page
  useEffect(() => {
    const state = location.state as { authError?: string } | undefined;
    if (state?.authError) {
      setError({ message: state.authError });
      
      // Clear the state so error doesn't persist on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    // Redirect to dashboard if already authenticated
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const success = await login(email, password);
      if (success) {
        navigate('/dashboard', { replace: true });
      } else {
        setError({ message: 'Login failed. Please check your credentials.' });
      }
    } catch (err) {
      console.error('Login error:', err);
      setError({ 
        message: err instanceof Error ? err.message : 'An unexpected error occurred',
        type: 'auth'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-xl shadow-lg">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Login</h1>
            <p className="text-muted-foreground">Welcome back! Please sign in to your account.</p>
          </div>

          <LoginForm
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
            error={error}
          />
        </div>
      </div>
    </Layout>
  );
}
