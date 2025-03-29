
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "dark" | "light" | "system";

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

interface ThemeProviderState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      
      console.log(`System theme detected: ${systemTheme}`);
      root.classList.add(systemTheme);
      
      // Debug output of applied CSS variables
      const bgColor = getComputedStyle(root).getPropertyValue('--background');
      const textColor = getComputedStyle(root).getPropertyValue('--foreground');
      console.log(`System theme CSS variables - Background: ${bgColor}, Text: ${textColor}`);
      
      return;
    }

    console.log(`Manually setting theme to: ${theme}`);
    root.classList.add(theme);
    
    // Debug output of applied CSS variables
    const bgColor = getComputedStyle(root).getPropertyValue('--background');
    const textColor = getComputedStyle(root).getPropertyValue('--foreground');
    console.log(`Applied theme CSS variables - Background: ${bgColor}, Text: ${textColor}`);
    
    // Additional debugging for dark mode text colors
    if (theme === 'dark') {
      const cardTextColor = getComputedStyle(root).getPropertyValue('--card-foreground');
      const secondaryTextColor = getComputedStyle(root).getPropertyValue('--secondary-foreground');
      const mutedTextColor = getComputedStyle(root).getPropertyValue('--muted-foreground');
      console.log(`Dark mode text colors - Card: ${cardTextColor}, Secondary: ${secondaryTextColor}, Muted: ${mutedTextColor}`);
    }
  }, [theme]);

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      localStorage.setItem(storageKey, newTheme);
      setTheme(newTheme);
    },
  };

  return (
    <ThemeProviderContext.Provider value={value} {...props}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = (): ThemeProviderState => {
  const context = useContext(ThemeProviderContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
