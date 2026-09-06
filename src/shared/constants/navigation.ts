/**
 * Navigation Constants
 * Reference: Skill+ Master Product Blueprint v1.0
 * Part I §2.4 (Navigation) + Part II §A.4 (Iconography)
 */

import type { NavItem } from "@/shared/types";

/**
 * Primary Nav items (persistent left sidebar, Linear/Notion style)
 * Icons per Design Spec §A.4 fixed category-icon mapping
 */
export const MAIN_NAV_ITEMS: NavItem[] = [
  { label: "Overview", icon: "home", path: "/dashboard" },
  { label: "Repositories", icon: "box", path: "/dashboard/repositories" },
  { label: "Skills", icon: "puzzle", path: "/dashboard/skills" },
  { label: "Architecture", icon: "git-branch", path: "/dashboard/architecture" },
  { label: "Quality", icon: "shield-check", path: "/dashboard/quality" },
  { label: "Report", icon: "file-text", path: "/dashboard/report" },
  { label: "Recommendations", icon: "target", path: "/dashboard/recommendations" },
  { label: "Roadmap", icon: "map", path: "/dashboard/roadmap" },
  { label: "AI Mentor", icon: "sparkles", path: "/dashboard/mentor" },
  { label: "Workspace", icon: "book-open", path: "/dashboard/workspace" },
  { label: "Export", icon: "download", path: "/dashboard/export" },
];

export const SECONDARY_NAV_ITEMS: NavItem[] = [
  { label: "Settings", icon: "settings", path: "/dashboard/settings" },
  { label: "History", icon: "clock", path: "/dashboard/history" },
];

/**
 * Sidebar dimensions per Design Spec §A.8
 */
export const SIDEBAR = {
  expandedWidth: 260,
  collapsedWidth: 72,
  breakpoint: "tablet", // 768px
} as const;

/**
 * Grid breakpoints per Design Spec §A.8
 */
export const BREAKPOINTS = {
  mobile: 360,
  tablet: 768,
  laptop: 1024,
  desktop: 1280,
} as const;

export const GRID = {
  desktop: { columns: 12, margin: 64, gutter: 24 },
  laptop: { columns: 12, margin: 40, gutter: 20 },
  tablet: { columns: 8, margin: 32, gutter: 16 },
  mobile: { columns: 4, margin: 16, gutter: 12 },
} as const;

/**
 * Skill category icon mapping per Design Spec §A.4
 */
export const SKILL_CATEGORY_ICONS: Record<string, string> = {
  language: "code-2",
  framework: "layers",
  library: "package",
  database: "database",
  devops: "container",
  testing: "flask-conical",
};

/**
 * Onboarding steps per Part I §2.3 (User Journey)
 */
export const ONBOARDING_STEPS = [
  "Welcome",
  "Career Profile",
  "Add Sources",
  "Verify Sources",
] as const;
