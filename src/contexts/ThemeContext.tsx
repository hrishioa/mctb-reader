// src/contexts/ThemeContext.tsx
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "sepia" | "night";
type ColorScheme = {
  name: string;
  background: string;
  text: string;
  link: string;
  linkHover: string;
  border: string;
};

const colorSchemes: Record<Theme, ColorScheme> = {
  light: {
    name: "Light",
    background: "#f8f9fa",
    text: "#1f2937",
    link: "#2563eb",
    linkHover: "#1d4ed8",
    border: "#e5e7eb",
  },
  dark: {
    name: "Dark",
    background: "#111827",
    text: "#e5e7eb",
    link: "#60a5fa",
    linkHover: "#93c5fd",
    border: "#374151",
  },
  sepia: {
    name: "Sepia",
    background: "#f8f4e9",
    text: "#433422",
    link: "#9c4b00",
    linkHover: "#723600",
    border: "#d3cbc1",
  },
  night: {
    name: "Night",
    background: "#0a0a0a",
    text: "#c4c4c4",
    link: "#bb86fc",
    linkHover: "#9965f4",
    border: "#2d2d2d",
  },
};

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  colorScheme: ColorScheme;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme;
    if (savedTheme && colorSchemes[savedTheme]) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.style.setProperty(
      "--color-background",
      colorSchemes[theme].background
    );
    document.documentElement.style.setProperty(
      "--color-text",
      colorSchemes[theme].text
    );
    document.documentElement.style.setProperty(
      "--color-link",
      colorSchemes[theme].link
    );
    document.documentElement.style.setProperty(
      "--color-link-hover",
      colorSchemes[theme].linkHover
    );
    document.documentElement.style.setProperty(
      "--color-border",
      colorSchemes[theme].border
    );
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{ theme, setTheme, colorScheme: colorSchemes[theme] }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
