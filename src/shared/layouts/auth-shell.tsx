/**
 * AuthShell — BRUTALIST
 * Reference: Design Spec Part C, Screens 2-3, Brutalism × Neo-Maximalism restyle
 */

import { Outlet } from "react-router-dom";

export function AuthShell() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-base p-4">
      {/* Diagonal stripe background accent */}
      <div className="fixed inset-0 brutal-dots opacity-30 pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Brand */}
        <div className="mb-8 flex flex-col items-start gap-3">
          <div className="flex h-14 w-14 items-center justify-center bg-brand-primary text-text-inverse shadow-brutal-accent">
            <span className="font-mono text-xl font-black">S+</span>
          </div>
          <div>
            <h1 className="font-mono text-heading-xl font-black uppercase tracking-tight text-text-primary">
              Skill<span className="text-brand-primary">+</span>
            </h1>
            <p className="font-mono text-overline font-bold uppercase tracking-widest text-text-tertiary">
              Engineering intelligence, explained.
            </p>
          </div>
        </div>

        <Outlet />
      </div>
    </div>
  );
}
