/**
 * Provider Composition
 * Reference: Skill+ Master Product Blueprint v1.0, Part IV §IV.2a
 *
 * Composition order (outer → inner):
 * ErrorBoundary → QueryClientProvider → ThemeProvider → AuthProvider
 *   → NotificationProvider → RouterProvider
 *
 * Ordering rationale:
 * - Error Boundary outermost catches provider-init failures
 * - Theme must be available before Auth UI renders
 * - Auth must resolve before Router evaluates protected routes
 */

import { type ReactNode } from "react";
import { ErrorBoundary } from "./error-boundary";
import { QueryProvider } from "./query-provider";
import { ThemeProvider } from "./theme-provider";
import { AuthProvider } from "./auth-provider";
import { NotificationProvider } from "./notification-provider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <ThemeProvider>
          <AuthProvider>
            <NotificationProvider>{children}</NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
}
