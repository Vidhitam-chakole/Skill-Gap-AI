import { useEffect, type ReactNode } from "react";
import { useThemeStore } from "@/shared/store";

/**
 * ThemeProvider syncs the Zustand theme store with the document
 * and listens for system theme changes.
 * Reference: Part IV §IV.2a (providers composition order)
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const { theme, setTheme } = useThemeStore();

  useEffect(() => {
    // Apply initial theme
    const resolved = theme === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : theme;
    document.documentElement.classList.toggle("light", resolved === "light");

    // Listen for system theme changes
    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = (e: MediaQueryListEvent) => {
        document.documentElement.classList.toggle("light", !e.matches);
      };
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
    }
  }, [theme, setTheme]);

  return <>{children}</>;
}
