import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "dark" | "light" | "system";

interface ThemeState {
  theme: Theme;
  resolvedTheme: "dark" | "light";
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

function getSystemTheme(): "dark" | "light" {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function resolveTheme(theme: Theme): "dark" | "light" {
  return theme === "system" ? getSystemTheme() : theme;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "dark",
      resolvedTheme: "dark",
      setTheme: (theme) => {
        const resolved = resolveTheme(theme);
        document.documentElement.classList.toggle("light", resolved === "light");
        set({ theme, resolvedTheme: resolved });
      },
      toggleTheme: () => {
        const current = get().resolvedTheme;
        const next = current === "dark" ? "light" : "dark";
        document.documentElement.classList.toggle("light", next === "light");
        set({ theme: next, resolvedTheme: next });
      },
    }),
    {
      name: "skill-plus-theme",
      onRehydrateStorage: () => (state) => {
        if (state) {
          const resolved = resolveTheme(state.theme);
          document.documentElement.classList.toggle(
            "light",
            resolved === "light",
          );
          state.resolvedTheme = resolved;
        }
      },
    },
  ),
);
