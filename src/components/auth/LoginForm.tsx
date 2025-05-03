
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ValidationError } from "@/components/ValidationError";
import { AuthErrorDisplay } from "@/components/auth/AuthErrorDisplay";
import { NetworkStatusAlert } from "@/components/auth/NetworkStatusAlert";
import { ForgotPasswordButton } from "@/components/auth/ForgotPasswordButton";
import { LoginFormFooter } from "@/components/auth/LoginFormFooter";
import { Captcha } from "@/components/auth/Captcha";
import { useState, useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { Alert } from "@/components/ui/alert";

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
  isRateLimited?: boolean;
  rateLimitInfo?: { remainingMs?: number; attemptsLeft?: number };
  requireCaptcha?: boolean;
  captchaVerified?: boolean;
  onCaptchaVerify?: (verified: boolean) => void;
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
  onRetryConnection,
  isRateLimited = false,
  rateLimitInfo = {},
  requireCaptcha = false,
  captchaVerified = false,
  onCaptchaVerify
}: LoginFormProps) {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [remainingTimeText, setRemainingTimeText] = useState<string>("");
  
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

  // Calculate remaining time text
  useEffect(() => {
    if (isRateLimited && rateLimitInfo.remainingMs) {
      const updateRemainingTime = () => {
        const minutes = Math.floor(rateLimitInfo.remainingMs! / 60000);
        const seconds = Math.ceil((rateLimitInfo.remainingMs! % 60000) / 1000);
        
        if (minutes > 0) {
          setRemainingTimeText(`${minutes} minute${minutes !== 1 ? 's' : ''} ${seconds} second${seconds !== 1 ? 's' : ''}`);
        } else {
          setRemainingTimeText(`${seconds} second${seconds !== 1 ? 's' : ''}`);
        }
      };
      
      updateRemainingTime();
      const timer = setInterval(updateRemainingTime, 1000);
      
      return () => clearInterval(timer);
    } else {
      setRemainingTimeText("");
    }
  }, [isRateLimited, rateLimitInfo.remainingMs]);
  
  // Handle form submission with retry capability
  const handleSubmitWithRetry = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected || isRateLimited) {
      return;
    }
    
    try {
      await onSubmit(e);
    } catch (err) {
      if (retryCount < 2) {
        setRetryCount(prev => prev + 1);
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
  };

  const handleRunDiagnostic = () => {
    window.location.href = "/diagnostic";
  };
  
  return (
    <form onSubmit={handleSubmitWithRetry} className="space-y-4">
      {/* Network status indicator */}
      <NetworkStatusAlert
        isConnected={isConnected}
        onRetryConnection={handleNetworkRetry}
      />
      
      {/* Rate limit alert */}
      {isRateLimited && (
        <Alert variant="destructive" className="flex items-center space-x-2">
          <AlertCircle className="h-4 w-4" />
          <div className="flex-1">
            <p className="text-sm font-medium">Too many login attempts</p>
            <p className="text-xs">For security reasons, login has been temporarily locked. Please try again in {remainingTimeText}.</p>
          </div>
        </Alert>
      )}
      
      {/* Enhanced error display */}
      <AuthErrorDisplay 
        error={error as any}
        onRetry={() => setRetryCount(0)}
        onDiagnostic={handleRunDiagnostic}
      />
      
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
          disabled={isSubmitting || isResettingPassword || isRateLimited}
          autoFocus
          className={!isConnected ? "bg-gray-100" : ""}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <ForgotPasswordButton
            isSubmitting={isSubmitting}
            isResettingPassword={isResettingPassword}
            isConnected={isConnected}
            onPasswordReset={onPasswordReset}
          />
        </div>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          aria-invalid={!!error}
          disabled={isSubmitting || isResettingPassword || isRateLimited}
          className={!isConnected ? "bg-gray-100" : ""}
        />
      </div>

      {/* CAPTCHA when required */}
      {requireCaptcha && (
        <Captcha 
          onVerify={onCaptchaVerify || (() => {})} 
          disabled={isSubmitting || isResettingPassword || isRateLimited}
          required={true}
        />
      )}

      <Button 
        type="submit" 
        className="w-full" 
        disabled={isSubmitting || isResettingPassword || !isConnected || isRateLimited || (requireCaptcha && !captchaVerified)}
      >
        {isSubmitting ? "Logging in..." : "Login"}
      </Button>

      <LoginFormFooter
        isSubmitting={isSubmitting}
        isResettingPassword={isResettingPassword}
      />
    </form>
  );
}
