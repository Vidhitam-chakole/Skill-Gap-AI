/**
 * usePageTransition — Page Transition Hook
 * Provides consistent animation props for page enter/exit transitions.
 */

import { useEffect } from "react";

export function usePageTransition() {
  // Scroll to top on mount (simulates page transition)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);
}
