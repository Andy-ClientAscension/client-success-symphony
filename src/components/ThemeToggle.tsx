
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  // Apply theme data attribute when theme changes
  useEffect(() => {
    // Check if document is available (for SSR)
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    
    toast({
      title: `Theme Changed`,
      description: `Switched to ${newTheme} mode.`,
      duration: 3000,
    });
  };

  return (
    <Button 
      variant="outline" 
      size="icon" 
      onClick={toggleTheme} 
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className="transition-colors"
    >
      {theme === "dark" ? (
        <Sun className="h-[1.2rem] w-[1.2rem] transition-transform text-yellow-400" aria-hidden="true" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem] transition-transform text-primary" aria-hidden="true" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
