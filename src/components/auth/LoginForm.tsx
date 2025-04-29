
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { ValidationError } from "@/components/ValidationError";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface LoginFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  isSubmitting: boolean;
  isResettingPassword?: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  onPasswordReset?: () => Promise<void>;
  error?: { message: string; type?: string } | null;
}

export function LoginForm({
  email,
  setEmail,
  password,
  setPassword,
  isSubmitting,
  isResettingPassword = false,
  onSubmit,
  onPasswordReset,
  error
}: LoginFormProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive" className="text-sm py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error.message}</AlertDescription>
          {error.type === 'network' && (
            <div className="mt-2 text-xs">
              If this problem persists, please check your internet connection or try using a different browser.
            </div>
          )}
          {error.type === 'cors' && (
            <div className="mt-2 text-xs">
              Network request blocked. This could be due to a CORS policy issue. Please try refreshing the page or try again later.
            </div>
          )}
          {error.type === 'auth' && (
            <div className="mt-2 text-xs">
              Make sure you're using the correct credentials and try again.
            </div>
          )}
          {error.type === 'server' && (
            <div className="mt-2 text-xs">
              The server encountered an error. Please try again later.
            </div>
          )}
          {error.message.includes('Email not confirmed') && (
            <div className="mt-2 text-xs">
              You need to verify your email before logging in. Please check your inbox 
              (including spam folder) for a verification email.
            </div>
          )}
        </Alert>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="youremail@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          aria-invalid={!!error}
          disabled={isSubmitting || isResettingPassword}
          autoFocus
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Button 
            variant="link" 
            className="px-0 font-normal text-sm text-blue-500 hover:text-blue-700"
            onClick={(e) => {
              e.preventDefault();
              if (onPasswordReset) {
                onPasswordReset();
              } else {
                toast({
                  title: "Password Reset",
                  description: "Password reset functionality is not implemented in this demo.",
                });
              }
            }}
            disabled={isSubmitting || isResettingPassword}
            type="button"
          >
            {isResettingPassword ? "Sending..." : "Forgot password?"}
          </Button>
        </div>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          aria-invalid={!!error}
          disabled={isSubmitting || isResettingPassword}
        />
      </div>

      <Button 
        type="submit" 
        className="w-full" 
        disabled={isSubmitting || isResettingPassword}
      >
        {isSubmitting ? "Logging in..." : "Login"}
      </Button>

      <p className="text-center text-sm">
        Don't have an account?{" "}
        <Button
          variant="link"
          className="p-0 font-normal text-blue-500 hover:text-blue-700"
          onClick={() => navigate("/signup")}
          disabled={isSubmitting || isResettingPassword}
          type="button"
        >
          Sign up
        </Button>
      </p>
    </form>
  );
}
