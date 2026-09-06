/**
 * OnboardingShell — BRUTALIST
 * Reference: Design Spec Part C, Screens 4-7, Brutalism × Neo-Maximalism restyle
 */

import { Outlet, useLocation } from "react-router-dom";
import { Check } from "lucide-react";
import { cn } from "@/shared/utils/cn";

const steps = [
  { label: "Welcome", path: "/onboarding/welcome", alsoMatches: "/onboarding/profile-type" },
  { label: "Career Profile", path: "/onboarding/career-profile" },
  { label: "Add Sources", path: "/onboarding/add-sources" },
  { label: "Verify Sources", path: "/onboarding/verify-sources" },
];

export function OnboardingShell() {
  const location = useLocation();
  const currentIndex = steps.findIndex((s) =>
    location.pathname.startsWith(s.path) ||
    ("alsoMatches" in s && location.pathname.startsWith((s as { alsoMatches: string }).alsoMatches)),
  );

  return (
    <div className="flex min-h-screen flex-col bg-bg-base">
      {/* Brutalist progress bar */}
      <div className="border-b-2 border-border-strong bg-bg-surface px-6 py-5">
        <div className="mx-auto max-w-2xl">
          {/* Step indicators */}
          <div className="flex gap-1">
            {steps.map((step, i) => (
              <div
                key={step.path}
                className={cn(
                  "flex h-10 flex-1 items-center justify-center gap-2 border-2 font-mono text-caption font-bold uppercase tracking-wider transition-all",
                  i < currentIndex
                    ? "border-success bg-success/16 text-success"
                    : i === currentIndex
                      ? "border-brand-primary bg-brand-primary/16 text-brand-primary shadow-brutal-accent"
                      : "border-border-strong bg-bg-surface-alt text-text-tertiary",
                )}
              >
                {i < currentIndex ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span className="font-mono text-overline font-black">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                )}
                <span className="hidden sm:inline">{step.label}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 font-mono text-overline font-bold uppercase tracking-widest text-text-tertiary">
            Step {String(currentIndex + 1).padStart(2, "0")} / {String(steps.length).padStart(2, "0")} —{" "}
            {steps[currentIndex]?.label ?? "Onboarding"}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
