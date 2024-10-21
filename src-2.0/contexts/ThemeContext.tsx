import React, { createContext, useState, useContext, useEffect } from 'react';
import { h } from "preact";

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    // Function to set theme based on system preference
    const setThemeFromSystemPreference = (e?: MediaQueryListEvent) => {
      const darkModeOn = e ? e.matches : window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(darkModeOn ? 'dark' : 'light');
    };

    // Set initial theme
    setThemeFromSystemPreference();

    // Listen for changes in system theme
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', setThemeFromSystemPreference);

    // Cleanup listener
    return () => mediaQuery.removeEventListener('change', setThemeFromSystemPreference);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
