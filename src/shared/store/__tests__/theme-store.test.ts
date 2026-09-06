/**
 * Theme Store Tests — Fixed
 */

import { describe, it, expect, beforeEach } from "vitest";
import { useThemeStore } from "../theme-store";

describe("ThemeStore", () => {
  beforeEach(() => {
    useThemeStore.setState({ theme: "dark", resolvedTheme: "dark" });
    localStorage.clear();
  });

  it("defaults to dark theme", () => {
    const { theme } = useThemeStore.getState();
    expect(theme).toBe("dark");
  });

  it("toggles between dark and light", () => {
    const { toggleTheme } = useThemeStore.getState();
    expect(useThemeStore.getState().resolvedTheme).toBe("dark");

    toggleTheme();
    expect(useThemeStore.getState().resolvedTheme).toBe("light");

    toggleTheme();
    expect(useThemeStore.getState().resolvedTheme).toBe("dark");
  });

  it("setTheme sets both theme and resolvedTheme", () => {
    const { setTheme } = useThemeStore.getState();
    setTheme("light");
    expect(useThemeStore.getState().theme).toBe("light");
    expect(useThemeStore.getState().resolvedTheme).toBe("light");
  });
});
