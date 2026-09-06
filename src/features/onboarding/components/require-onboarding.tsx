import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/shared/store";
import type { ReactNode } from "react";

/**
 * RequireOnboarding
 * Reference: Part IV §IV.3 - Onboarding-gated routes check
 * onboardingComplete flag; re-visits redirect to /dashboard.
 */
export function RequireOnboarding({ children }: { children: ReactNode }) {
  const onboardingComplete = useAuthStore((s) => s.onboardingComplete);

  if (!onboardingComplete) {
    return <Navigate to="/onboarding/welcome" replace />;
  }

  return <>{children}</>;
}
