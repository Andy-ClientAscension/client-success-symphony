
import React, { useState, useEffect } from 'react';
import { Layout } from "@/components/Layout/Layout";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate, useLocation } from 'react-router-dom';
import { LoginForm } from "@/components/auth/LoginForm";
import { useToast } from "@/hooks/use-toast";
import { announceToScreenReader, setFocusToElement } from "@/lib/accessibility";

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
      announceToScreenReader(`Authentication error: ${state.authError}`, "assertive");
      
      // Clear the state so error doesn't persist on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    // Announce login page loaded
    announceToScreenReader("Login page loaded", "polite");
    
    // Set focus to main content or email input when page loads
    setTimeout(() => {
      const emailInput = document.getElementById('email');
      if (emailInput) {
        emailInput.focus();
      } else {
        setFocusToElement('main-content');
      }
    }, 100);
    
    // Redirect to dashboard if already authenticated
    if (isAuthenticated) {
      announceToScreenReader("Already authenticated, redirecting to dashboard", "polite");
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    announceToScreenReader("Attempting to log in, please wait", "polite");

    try {
      const success = await login(email, password);
      if (success) {
        announceToScreenReader("Login successful, redirecting to dashboard", "polite");
        const from = location.state?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      } else {
        const errorMessage = 'Login failed. Please check your credentials.';
        setError({ message: errorMessage });
        announceToScreenReader(errorMessage, "assertive");
        
        // Focus on error message
        setTimeout(() => {
          const errorElement = document.querySelector('[role="alert"]');
          if (errorElement) {
            (errorElement as HTMLElement).focus();
          } else {
            setFocusToElement('email');
          }
        }, 100);
      }
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError({ 
        message: errorMessage,
        type: 'auth'
      });
      announceToScreenReader(`Login error: ${errorMessage}`, "assertive");
      
      // Focus on error message
      setTimeout(() => {
        const errorElement = document.querySelector('[role="alert"]');
        if (errorElement) {
          (errorElement as HTMLElement).focus();
        }
      }, 100);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create a custom login layout component that doesn't show the sidebar
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <div className="flex items-center justify-center min-h-screen">
        <div id="main-content" tabIndex={-1} className="w-full max-w-md p-8 space-y-8 bg-card rounded-xl shadow-lg">
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
          
          <div aria-live="polite" className="sr-only">
            {isSubmitting ? "Logging in..." : error ? `Error: ${error.message}` : ""}
          </div>
        </div>
      </div>
    </div>
  );
}
