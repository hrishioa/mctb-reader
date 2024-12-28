// src/components/ThemeToggle.tsx
import { useTheme } from "@/contexts/ThemeContext";
import { Sun, Moon, BookOpen, Coffee } from "react-feather"; // Install react-feather if not already

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const themeIcons = {
    light: <Sun size={18} />,
    dark: <Moon size={18} />,
    sepia: <BookOpen size={18} />,
    night: <Coffee size={18} />,
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="flex gap-2 bg-background border border-border rounded-lg p-1 shadow-lg">
        {Object.entries(themeIcons).map(([key, icon]) => (
          <button
            key={key}
            onClick={() => setTheme(key as any)}
            className={`p-2 rounded-md transition-colors ${
              theme === key
                ? "bg-link text-background"
                : "hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
            title={`Switch to ${key} theme`}
          >
            {icon}
          </button>
        ))}
      </div>
    </div>
  );
}
