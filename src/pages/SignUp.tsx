
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { BarChart2, Lock, Mail, Key, ArrowLeft } from "lucide-react";
import { LoadingState } from "@/components/LoadingState";
import { ValidationError } from "@/components/ValidationError";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";
import { AuthErrorDisplay } from "@/components/auth/AuthErrorDisplay";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [inviteCodeError, setInviteCodeError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [formError, setFormError] = useState<{message: string; type?: string} | null>(null);
  
  // Try to use the auth context, but with error handling
  let register, validateInviteCode;
  try {
    const auth = useAuth();
    register = auth.register;
    validateInviteCode = auth.validateInviteCode;
  } catch (error) {
    console.error("Failed to initialize auth:", error);
    throw new Error("Authentication is unavailable. Please refresh the page or try again later.");
  }
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const validateForm = () => {
    let isValid = true;
    
    // Email validation
    if (!email) {
      setEmailError("Email is required");
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Please enter a valid email address");
      isValid = false;
    } else {
      setEmailError("");
    }
    
    // Password validation
    if (!password) {
      setPasswordError("Password is required");
      isValid = false;
    } else if (passwordStrength < 60) {
      setPasswordError("Please create a stronger password");
      isValid = false;
    } else {
      setPasswordError("");
    }
    
    // Confirm password validation
    if (!confirmPassword) {
      setConfirmPasswordError("Please confirm your password");
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      isValid = false;
    } else {
      setConfirmPasswordError("");
    }
    
    // Invite code validation
    if (!inviteCode) {
      setInviteCodeError("Invitation code is required");
      isValid = false;
    } else {
      setInviteCodeError("");
    }
    
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    if (!validateForm()) {
      setFormError({
        message: "Please fix the errors in the form",
        type: "validation"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Verify invite code first
      const isValidCode = await validateInviteCode(inviteCode);
      if (!isValidCode) {
        setInviteCodeError("Invalid invitation code");
        setFormError({
          message: "Invalid invitation code. Please check and try again.",
          type: "validation"
        });
        setIsLoading(false);
        return;
      }
      
      // Proceed with registration
      const result = await register(email, password, inviteCode);
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Your account has been created successfully",
        });
        navigate("/");
      } else {
        setFormError({
          message: result.message,
          type: result.message.includes("already registered") ? "auth" : "server"
        });
      }
    } catch (error) {
      setFormError({
        message: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        type: "server"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ErrorBoundary customMessage="There was a problem loading the sign up form. Please try refreshing the page.">
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-black p-3 flex items-center justify-center">
                <BarChart2 className="h-10 w-10 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center">Create an Account</CardTitle>
            <CardDescription className="text-center">
              Enter your details to register
            </CardDescription>
          </CardHeader>
          <CardContent>
            {formError && (
              <AuthErrorDisplay error={formError} />
            )}
            
            {isLoading ? (
              <div className="py-8">
                <LoadingState 
                  message="Creating your account..." 
                  size="md" 
                  showProgress={true}
                />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`pl-10 ${emailError ? "border-destructive" : ""}`}
                      required
                    />
                  </div>
                  {emailError && <ValidationError message={emailError} />}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`pl-10 ${passwordError ? "border-destructive" : ""}`}
                      required
                    />
                  </div>
                  <PasswordStrengthMeter 
                    password={password} 
                    onStrengthChange={setPasswordStrength} 
                  />
                  {passwordError && <ValidationError message={passwordError} />}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`pl-10 ${confirmPasswordError ? "border-destructive" : ""}`}
                      required
                    />
                  </div>
                  {confirmPasswordError && <ValidationError message={confirmPasswordError} />}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inviteCode">Invitation Code</Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="inviteCode"
                      type="text"
                      placeholder="Enter your invitation code"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value)}
                      className={`pl-10 ${inviteCodeError ? "border-destructive" : ""}`}
                      required
                    />
                  </div>
                  {inviteCodeError && <ValidationError message={inviteCodeError} />}
                </div>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? "Creating account..." : "Sign Up"}
                </Button>
              </form>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center">
              Already have an account?{" "}
              <Link to="/login" className="text-primary hover:underline">
                Log in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </ErrorBoundary>
  );
}
