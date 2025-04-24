import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { ValidationError } from "@/components/ValidationError";

interface LoginFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  error?: { message: string; type?: string } | null;
}

export function LoginForm({
  email,
  setEmail,
  password,
  setPassword,
  isSubmitting,
  onSubmit,
  error
}: LoginFormProps) {
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
          {error.type === 'auth' && (
            <div className="mt-2 text-xs">
              Make sure you're using the correct credentials and try again.
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
          disabled={isSubmitting}
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
              // We'll keep the toast for now since it's just a demo message
              toast({
                title: "Password Reset",
                description: "Password reset functionality is not implemented in this demo.",
              });
            }}
          >
            Forgot password?
          </Button>
        </div>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          aria-invalid={!!error}
          disabled={isSubmitting}
        />
      </div>

      <Button 
        type="submit" 
        className="w-full" 
        disabled={isSubmitting}
      >
        {isSubmitting ? "Logging in..." : "Login"}
      </Button>

      <p className="text-center text-sm">
        Don't have an account?{" "}
        <Button
          variant="link"
          className="p-0 font-normal text-blue-500 hover:text-blue-700"
          onClick={() => navigate("/signup")}
        >
          Sign up
        </Button>
      </p>
    </form>
  );
}
