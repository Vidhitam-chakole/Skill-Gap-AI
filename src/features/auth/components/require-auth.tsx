import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/shared/store";
import type { ReactNode } from "react";

/**
 * RequireAuth
 * Reference: Part IV §IV.3 - Protected routes check Auth Store;
 * redirects to /login with ?redirect= preserving intent.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <>{children}</>;
}
