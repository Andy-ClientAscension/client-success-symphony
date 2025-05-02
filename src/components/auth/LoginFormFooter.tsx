
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface LoginFormFooterProps {
  isSubmitting: boolean;
  isResettingPassword: boolean;
}

export function LoginFormFooter({ 
  isSubmitting, 
  isResettingPassword 
}: LoginFormFooterProps) {
  const navigate = useNavigate();

  return (
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
  );
}
