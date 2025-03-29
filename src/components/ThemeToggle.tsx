
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  // Log current theme on component mount and when theme changes
  useEffect(() => {
    console.log("Current theme:", theme);
    
    // Apply a data attribute to the body for additional CSS targeting if needed
    document.documentElement.setAttribute('data-theme', theme);
    
    // Check text visibility in current theme
    const bgColor = getComputedStyle(document.documentElement).backgroundColor;
    const textColor = getComputedStyle(document.documentElement).color;
    console.log(`Theme colors - Background: ${bgColor}, Text: ${textColor}`);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    console.log(`Toggling theme to: ${newTheme}`);
    
    toast({
      title: `Theme Changed`,
      description: `Switched to ${newTheme} mode. Refresh the page if you notice any display issues.`,
      duration: 5000,
    });
  };

  return (
    <Button 
      variant="outline" 
      size="icon" 
      onClick={toggleTheme} 
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
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
