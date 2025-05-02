
import { Button } from "@/components/ui/button";
import { 
  AlertCircle, 
  Github, 
  Mail, 
  AlertTriangle 
} from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SocialLoginButtonsProps {
  onlyIcons?: boolean;
  className?: string;
  disabled?: boolean;
}

export function SocialLoginButtons({ 
  onlyIcons = false,
  className = "", 
  disabled = false
}: SocialLoginButtonsProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSocialLogin = async (provider: "github" | "google") => {
    try {
      setIsLoading(provider);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        throw error;
      }

      // The user will be redirected to the provider's authentication page
      // and then back to the redirectTo URL
    } catch (error) {
      console.error(`${provider} login error:`, error);
      toast({
        title: "Login Failed",
        description: error instanceof Error 
          ? error.message 
          : `Failed to login with ${provider}. Please try again.`,
        variant: "destructive"
      });
      setIsLoading(null);
    }
  };

  // All of the social login buttons for the supported providers
  const socialLoginButtons = {
    github: (
      <Button
        key="github"
        variant="outline"
        className={`flex items-center gap-2 ${onlyIcons ? "px-3" : "px-5"} ${isLoading === "github" ? "opacity-70" : ""}`}
        onClick={() => handleSocialLogin("github")}
        disabled={disabled || !!isLoading}
      >
        <Github className="h-5 w-5" />
        {!onlyIcons && <span>GitHub</span>}
      </Button>
    ),
    google: (
      <Button
        key="google"
        variant="outline"
        className={`flex items-center gap-2 ${onlyIcons ? "px-3" : "px-5"} ${isLoading === "google" ? "opacity-70" : ""}`}
        onClick={() => handleSocialLogin("google")}
        disabled={disabled || !!isLoading}
      >
        <Mail className="h-5 w-5" />
        {!onlyIcons && <span>Google</span>}
      </Button>
    )
  };

  // Currently showing these as disabled until configuration
  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      <div className="w-full">
        <div className="flex items-center gap-2 mb-2 text-xs text-amber-600">
          <AlertTriangle className="h-3 w-3" />
          <span>Social login requires admin configuration</span>
        </div>
      </div>
      {Object.values(socialLoginButtons).map((button, index) => (
        <div key={index} className="opacity-50 cursor-not-allowed">
          {button}
        </div>
      ))}
    </div>
  );
}
