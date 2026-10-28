"use client";
import type React from "react";
import { createContext, useState, useContext, useEffect } from "react";
import { readThemePreference } from "../utils/functions/themePreference";
type Theme = "light" | "dark";
type ThemeContextType = { theme: Theme; toggleTheme: () => void };
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    try { return readThemePreference(window.localStorage); } catch { return 'dark'; }
  });
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.style.colorScheme = theme;
    try { localStorage.setItem('theme', theme); } catch { /* Keep the theme usable when storage is unavailable. */ }
  }, [theme]);
  const toggleTheme = () => setTheme(previous => previous === 'light' ? 'dark' : 'light');
  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
};
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};
