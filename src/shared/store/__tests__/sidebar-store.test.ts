/**
 * Sidebar Store Tests — Fixed
 */

import { describe, it, expect, beforeEach } from "vitest";
import { useSidebarStore } from "../sidebar-store";

describe("SidebarStore", () => {
  beforeEach(() => {
    useSidebarStore.setState({ collapsed: false });
    localStorage.clear();
  });

  it("defaults to expanded", () => {
    expect(useSidebarStore.getState().collapsed).toBe(false);
  });

  it("toggles collapsed state", () => {
    const { toggle } = useSidebarStore.getState();

    toggle();
    expect(useSidebarStore.getState().collapsed).toBe(true);

    toggle();
    expect(useSidebarStore.getState().collapsed).toBe(false);
  });

  it("setCollapsed sets directly", () => {
    const { setCollapsed } = useSidebarStore.getState();
    setCollapsed(true);
    expect(useSidebarStore.getState().collapsed).toBe(true);
    setCollapsed(false);
    expect(useSidebarStore.getState().collapsed).toBe(false);
  });
});
