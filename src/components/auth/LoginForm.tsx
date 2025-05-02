import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Wifi, WifiOff, RefreshCw } from "lucide-react";
import { ValidationError } from "@/components/ValidationError";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

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
  networkStatus?: { online: boolean; latency?: number };
  onRetryConnection?: () => void;
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
  error,
  networkStatus,
  onRetryConnection
}: LoginFormProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [retryCount, setRetryCount] = useState<number>(0);
  
  // Use passed network status if available, otherwise use browser online status
  const isConnected = networkStatus ? networkStatus.online : isOnline;
  
  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Handle form submission with retry capability
  const handleSubmitWithRetry = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast({
        title: "Network Error",
        description: "You appear to be offline. Please check your internet connection and try again.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await onSubmit(e);
    } catch (err) {
      if (retryCount < 2) {
        setRetryCount(prev => prev + 1);
        toast({
          title: "Connection Issue",
          description: "Retrying your login request...",
          duration: 2000
        });
        // Wait briefly then retry
        setTimeout(() => handleSubmitWithRetry(e), 1000);
      } else {
        setRetryCount(0);
      }
    }
  };
  
  const handleNetworkRetry = () => {
    setRetryCount(0);
    if (onRetryConnection) {
      onRetryConnection();
    }
    toast({
      title: "Checking connection...",
      description: "Attempting to reconnect to authentication service.",
    });
  };

  const handlePasswordResetClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast({
        title: "Network Error",
        description: "You appear to be offline. Please check your internet connection and try again.",
        variant: "destructive"
      });
      return;
    }
    
    if (onPasswordReset) {
      await onPasswordReset();
    } else {
      // If onPasswordReset is not provided, navigate directly to reset page
      navigate('/reset-password');
    }
  };
  
  return (
    <form onSubmit={handleSubmitWithRetry} className="space-y-4">
      {/* Network status indicator */}
      {!isConnected && (
        <Alert variant="destructive" className="text-sm py-2 bg-amber-50 border-amber-300">
          <WifiOff className="h-4 w-4" />
          <AlertDescription className="flex justify-between items-center">
            <span>You appear to be offline. Please check your internet connection.</span>
            <Button 
              size="sm" 
              variant="outline"
              onClick={handleNetworkRetry}
              className="ml-2"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {error && (
        <Alert variant="destructive" className="text-sm py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error.message}</AlertDescription>
          {error.type === 'network' && (
            <div className="mt-2 text-xs">
              If this problem persists, please check your internet connection or try using a different browser.
              <div className="flex space-x-2 mt-1">
                <Button 
                  variant="link" 
                  size="sm" 
                  className="p-0 h-auto" 
                  onClick={handleNetworkRetry}
                >
                  Try Again
                </Button>
                <Button 
                  variant="link" 
                  size="sm" 
                  className="p-0 h-auto" 
                  onClick={() => navigate("/diagnostic")}
                >
                  Run Diagnostics
                </Button>
              </div>
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
          {error.message?.includes('Email not confirmed') && (
            <div className="mt-2 text-xs">
              You need to verify your email before logging in. Please check your inbox 
              (including spam folder) for a verification email.
              <Button 
                variant="link" 
                size="sm" 
                className="p-0 ml-2" 
                onClick={() => {
                  toast({
                    title: "Verification Email",
                    description: `A verification email was sent to ${email}. Please check your inbox (including spam folder).`,
                  });
                }}
              >
                Resend Verification Email
              </Button>
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
          className={!isConnected ? "bg-gray-100" : ""}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Button 
            variant="link" 
            className="px-0 font-normal text-sm text-blue-500 hover:text-blue-700"
            onClick={handlePasswordResetClick}
            disabled={isSubmitting || isResettingPassword || !isConnected}
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
          className={!isConnected ? "bg-gray-100" : ""}
        />
      </div>

      <Button 
        type="submit" 
        className="w-full" 
        disabled={isSubmitting || isResettingPassword || !isConnected}
      >
        {isSubmitting ? "Logging in..." : "Login"}
      </Button>

      <div className="text-center text-sm space-y-2">
        <p>
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
        <p className="text-xs text-gray-500">
          Having trouble logging in?{" "}
          <Button
            variant="link"
            className="p-0 h-auto text-xs font-normal text-gray-500 hover:text-gray-700"
            onClick={() => navigate("/diagnostic")}
            type="button"
          >
            Run diagnostics
          </Button>
        </p>
      </div>
    </form>
  );
}
