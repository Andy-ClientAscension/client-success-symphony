
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  // Log current theme on component mount to help with debugging
  useEffect(() => {
    console.log("Current theme:", theme);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    console.log(`Toggling theme to: ${newTheme}`);
    
    toast({
      title: `Theme Changed`,
      description: `Switched to ${newTheme} mode. If text appears invisible, please toggle again.`,
      duration: 3000,
    });
  };

  return (
    <Button 
      variant="outline" 
      size="icon" 
      onClick={toggleTheme} 
      aria-label="Toggle theme"
      className="transition-colors"
    >
      {theme === "dark" ? (
        <Sun className="h-[1.2rem] w-[1.2rem] transition-transform text-yellow-400" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem] transition-transform text-slate-700" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
