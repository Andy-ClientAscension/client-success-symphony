
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { BarChart2, Lock, Mail, AlertCircle } from "lucide-react";
import { ValidationError } from "@/components/ValidationError";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [showAlert, setShowAlert] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Validate password when it changes
  useEffect(() => {
    if (password && password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
    } else {
      setPasswordError("");
    }
  }, [password]);

  // Reset login attempts after 5 minutes
  useEffect(() => {
    if (loginAttempts > 0) {
      const timer = setTimeout(() => {
        setLoginAttempts(0);
        setShowAlert(false);
      }, 5 * 60 * 1000); // 5 minutes
      
      return () => clearTimeout(timer);
    }
  }, [loginAttempts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await login(email, password);
      
      if (success) {
        toast({
          title: "Success",
          description: "You have successfully logged in",
        });
        setLoginAttempts(0);
        navigate("/");
      } else {
        setLoginAttempts(prevAttempts => prevAttempts + 1);
        
        // Different messages based on number of attempts
        let errorMessage = "Invalid email or password. Please try again.";
        
        if (loginAttempts >= 2) {
          setShowAlert(true);
          errorMessage = "Multiple login failures detected. Please check your credentials carefully.";
        }
        
        toast({
          title: "Login Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-black p-3 flex items-center justify-center">
              <BarChart2 className="h-10 w-10 text-red-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">SSC Dashboard</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access the dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showAlert && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Multiple login failures detected. If you've forgotten your password, please contact the administrator.
              </AlertDescription>
            </Alert>
          )}
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
                  className="pl-10"
                  required
                />
              </div>
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
              {passwordError && <ValidationError message={passwordError} />}
            </div>
            <Button type="submit" className="w-full" disabled={isLoading || !!passwordError && password.length > 0}>
              {isLoading ? "Logging in..." : "Log in"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary hover:underline">
              Sign up with invitation code
            </Link>
          </div>
          <p className="text-xs text-center text-muted-foreground">
            <span className="font-medium">Note:</span> This is an invite-only application
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
