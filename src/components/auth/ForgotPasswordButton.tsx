
import React from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface ForgotPasswordButtonProps {
  isSubmitting: boolean;
  isResettingPassword: boolean;
  isConnected: boolean;
  onPasswordReset?: () => Promise<void>;
}

export function ForgotPasswordButton({ 
  isSubmitting, 
  isResettingPassword, 
  isConnected,
  onPasswordReset
}: ForgotPasswordButtonProps) {
  const { toast } = useToast();
  const navigate = useNavigate();

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
    <Button 
      variant="link" 
      className="px-0 font-normal text-sm text-blue-500 hover:text-blue-700"
      onClick={handlePasswordResetClick}
      disabled={isSubmitting || isResettingPassword || !isConnected}
      type="button"
    >
      {isResettingPassword ? "Sending..." : "Forgot password?"}
    </Button>
  );
}
