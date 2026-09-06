/**
 * DashboardShell — Interactive Brutalist Sidebar
 * Reference: Design Spec Part C, Screen 9
 *
 * Features:
 * - Framer Motion animated collapse/expand
 * - Active route indicator with animated pill
 * - Responsive mobile drawer with overlay
 * - Brutalist hover states with shadow transitions
 * - Keyboard shortcut hints
 */

import { Outlet, NavLink, useLocation } from "react-router-dom";
import {
  Home, Box, Puzzle, GitBranch, ShieldCheck, FileText, Target, Map,
  Sparkles, BookOpen, Download, Settings, Clock, Menu, X, Bell,
  LogOut, ChevronLeft, Search,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/shared/utils/cn";
import { useSidebarStore, useAuthStore, useThemeStore } from "@/shared/store";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  home: Home, box: Box, puzzle: Puzzle, "git-branch": GitBranch,
  "shield-check": ShieldCheck, "file-text": FileText, target: Target,
  map: Map, sparkles: Sparkles, "book-open": BookOpen, download: Download,
  settings: Settings, clock: Clock,
};

interface NavEntry {
  label: string;
  icon: string;
  path: string;
  badge?: number;
}

const mainNav: NavEntry[] = [
  { label: "Overview", icon: "home", path: "/dashboard" },
  { label: "Repositories", icon: "box", path: "/dashboard/repositories" },
  { label: "Skills", icon: "puzzle", path: "/dashboard/skills" },
  { label: "Architecture", icon: "git-branch", path: "/dashboard/architecture" },
  { label: "Quality", icon: "shield-check", path: "/dashboard/quality" },
  { label: "Report", icon: "file-text", path: "/dashboard/report" },
  { label: "Recommendations", icon: "target", path: "/dashboard/recommendations", badge: 3 },
  { label: "Roadmap", icon: "map", path: "/dashboard/roadmap" },
  { label: "AI Mentor", icon: "sparkles", path: "/dashboard/mentor" },
  { label: "Workspace", icon: "book-open", path: "/dashboard/workspace" },
  { label: "Export", icon: "download", path: "/dashboard/export" },
];

const secondaryNav: NavEntry[] = [
  { label: "Settings", icon: "settings", path: "/dashboard/settings" },
  { label: "History", icon: "clock", path: "/dashboard/history" },
];

function SidebarNavItem({ item, collapsed, isActive, onClick }: {
  item: NavEntry;
  collapsed: boolean;
  isActive: boolean;
  onClick?: () => void;
}) {
  const Icon = iconMap[item.icon] ?? Home;

  return (
    <li>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <NavLink
            to={item.path}
            onClick={onClick}
            className={cn(
              "group relative flex items-center gap-3 border-2 border-transparent px-3 py-2.5 font-mono text-body-sm font-medium uppercase tracking-wide transition-all duration-150",
              isActive
                ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
                : "text-text-secondary hover:border-border-strong hover:bg-bg-surface-alt hover:text-text-primary",
              collapsed && "justify-center px-2",
            )}
          >
            {/* Active indicator pill */}
            {isActive && (
              <motion.div
                layoutId="sidebar-active"
                className="absolute left-0 top-1 bottom-1 w-[3px] bg-brand-primary"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}

            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="shrink-0"
            >
              <Icon className="h-5 w-5" />
            </motion.div>

            <AnimatePresence mode="wait">
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.15 }}
                  className="overflow-hidden whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>

            {/* Badge */}
            {item.badge && !collapsed && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="ml-auto flex h-5 min-w-[20px] items-center justify-center bg-brand-tertiary px-1 font-mono text-overline font-bold text-text-inverse"
              >
                {item.badge}
              </motion.span>
            )}
          </NavLink>
        </TooltipTrigger>
        {collapsed && (
          <TooltipContent side="right" className="border-2 border-border-strong font-mono text-caption shadow-dropdown">
            {item.label}
            {item.badge ? ` (${item.badge})` : ""}
          </TooltipContent>
        )}
      </Tooltip>
    </li>
  );
}

export function DashboardShell() {
  const { collapsed, toggle } = useSidebarStore();
  const { user, logout } = useAuthStore();
  const { resolvedTheme, toggleTheme } = useThemeStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) =>
    path === "/dashboard"
      ? location.pathname === "/dashboard"
      : location.pathname.startsWith(path);

  return (
    <div className="flex min-h-screen bg-bg-base">
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
        className={cn(
          "fixed left-0 top-0 z-40 flex h-screen flex-col border-r-2 border-border-strong bg-bg-surface",
          "hidden lg:flex",
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b-2 border-border-strong px-4">
          <motion.div
            whileHover={{ rotate: 10 }}
            className="flex h-10 w-10 shrink-0 items-center justify-center bg-brand-primary text-text-inverse"
          >
            <span className="font-mono text-sm font-black">S+</span>
          </motion.div>
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="font-mono text-heading-md font-black uppercase tracking-tight text-text-primary"
              >
                Skill+
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Main Nav */}
        <nav className="flex-1 overflow-y-auto px-2 py-3">
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mb-2 px-2"
              >
                <span className="brutal-overline">Navigation</span>
              </motion.div>
            )}
          </AnimatePresence>

          <ul className="flex flex-col gap-0.5">
            {mainNav.map((item) => (
              <SidebarNavItem
                key={item.path}
                item={item}
                collapsed={collapsed}
                isActive={isActive(item.path)}
              />
            ))}
          </ul>

          <div className="my-3 mx-2 border-t-2 border-border-strong" />

          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mb-2 px-2"
              >
                <span className="brutal-overline">System</span>
              </motion.div>
            )}
          </AnimatePresence>

          <ul className="flex flex-col gap-0.5">
            {secondaryNav.map((item) => (
              <SidebarNavItem
                key={item.path}
                item={item}
                collapsed={collapsed}
                isActive={isActive(item.path)}
              />
            ))}
          </ul>
        </nav>

        {/* Collapse toggle */}
        <div className="border-t-2 border-border-strong p-2">
          <motion.button
            whileHover={{ x: collapsed ? 2 : -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={toggle}
            className={cn(
              "flex w-full items-center gap-3 border-2 border-transparent px-3 py-2.5 font-mono text-body-sm font-medium uppercase text-text-tertiary transition-all hover:border-border-strong hover:bg-bg-surface-alt hover:text-text-secondary",
              collapsed && "justify-center px-2",
            )}
          >
            <motion.div
              animate={{ rotate: collapsed ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronLeft className="h-5 w-5 shrink-0" />
            </motion.div>
            <AnimatePresence mode="wait">
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="overflow-hidden whitespace-nowrap"
                >
                  Collapse
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Sidebar Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed left-0 top-0 z-50 flex h-screen w-[280px] flex-col border-r-2 border-border-strong bg-bg-surface lg:hidden"
          >
            <div className="flex h-16 items-center justify-between border-b-2 border-border-strong px-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center bg-brand-primary text-text-inverse">
                  <span className="font-mono text-sm font-black">S+</span>
                </div>
                <span className="font-mono text-heading-md font-black uppercase tracking-tight text-text-primary">
                  Skill+
                </span>
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setMobileOpen(false)}
                className="text-text-tertiary hover:text-text-primary"
              >
                <X className="h-5 w-5" />
              </motion.button>
            </div>

            <nav className="flex-1 overflow-y-auto px-2 py-3">
              <ul className="flex flex-col gap-0.5">
                {[...mainNav, ...secondaryNav].map((item) => (
                  <SidebarNavItem
                    key={item.path}
                    item={item}
                    collapsed={false}
                    isActive={isActive(item.path)}
                    onClick={() => setMobileOpen(false)}
                  />
                ))}
              </ul>
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <motion.div
        animate={{ marginLeft: collapsed ? 72 : 260 }}
        transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
        className="hidden lg:flex flex-1 flex-col"
      >
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b-2 border-border-strong bg-bg-surface px-4 md:px-6">
          <button
            onClick={() => setMobileOpen(true)}
            className="text-text-secondary hover:text-text-primary lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Search */}
          <div className="flex flex-1 items-center gap-2 border-2 border-border-strong bg-bg-surface-alt px-3 py-2 hover:border-text-tertiary transition-colors">
            <Search className="h-4 w-4 text-text-tertiary" />
            <span className="font-mono text-body-sm text-text-tertiary">
              search...
            </span>
            <kbd className="ml-auto hidden border border-border-strong bg-bg-surface px-1.5 py-0.5 font-mono text-overline font-bold text-text-tertiary md:inline">
              ⌘K
            </kbd>
          </div>

          <div className="flex items-center gap-2">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-text-secondary">
                {resolvedTheme === "dark" ? "☀️" : "🌙"}
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Button variant="ghost" size="icon" className="text-text-secondary relative">
                <Bell className="h-5 w-5" />
                <motion.span
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute right-1 top-1 h-2 w-2 bg-brand-tertiary"
                />
              </Button>
            </motion.div>

            <div className="flex items-center gap-2">
              <motion.div whileHover={{ scale: 1.05 }} className="h-9 w-9 overflow-hidden border-2 border-border-strong bg-bg-surface-alt">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-mono text-body-sm font-bold text-text-secondary">
                    {user?.name?.[0] ?? "?"}
                  </div>
                )}
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Button variant="ghost" size="icon" onClick={logout} className="text-text-tertiary hover:text-danger">
                  <LogOut className="h-4 w-4" />
                </Button>
              </motion.div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </motion.div>

      {/* Mobile content (no sidebar offset) */}
      <div className="flex flex-1 flex-col lg:hidden">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b-2 border-border-strong bg-bg-surface px-4">
          <button onClick={() => setMobileOpen(true)} className="text-text-secondary hover:text-text-primary">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center bg-brand-primary text-text-inverse">
              <span className="font-mono text-xs font-black">S+</span>
            </div>
            <span className="font-mono text-body-sm font-black uppercase text-text-primary">Skill+</span>
          </div>
        </header>
        <main className="flex-1 p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
