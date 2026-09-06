/**
 * Confidence Bar — BRUTALIST
 * Reference: Design Spec §B.10, Brutalism × Neo-Maximalism restyle
 *
 * Thick-bordered track, sharp fill, monospace percentage,
 * harsh shadow on hover, raw structural honesty.
 */

import { useEffect, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/shared/utils/cn";
import { getConfidenceLevel, getConfidenceColor } from "@/shared/utils/confidence";
import { formatPercent } from "@/shared/utils/format";

interface ConfidenceBarProps {
  score: number;
  evidenceCount?: number;
  labelPosition?: "inline" | "above";
  height?: number;
  className?: string;
}

export function ConfidenceBar({
  score,
  evidenceCount,
  labelPosition = "inline",
  height = 10,
  className,
}: ConfidenceBarProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(timer);
  }, []);

  const level = getConfidenceLevel(score);
  const fillColor = getConfidenceColor(level);

  const bar = (
    <div className={cn("flex items-center gap-3", className)}>
      {labelPosition === "above" && (
        <span className="font-mono text-overline font-bold uppercase tracking-widest text-text-tertiary">
          {formatPercent(score)}
        </span>
      )}
      <div
        className="relative flex-1 overflow-hidden border-2 border-border-strong bg-bg-surface-alt"
        style={{
          height: `${height}px`,
          borderRadius: "var(--radius-sm)",
        }}
      >
        <div
          className="absolute inset-y-0 left-0 border-r-2 border-r-bg-base"
          style={{
            width: mounted ? `${score}%` : "0%",
            backgroundColor: fillColor,
            transition: "width 500ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        />
      </div>
      {labelPosition === "inline" && (
        <span className="w-12 text-right font-mono text-caption font-bold text-text-secondary">
          {formatPercent(score)}
        </span>
      )}
    </div>
  );

  if (evidenceCount !== undefined) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{bar}</TooltipTrigger>
        <TooltipContent className="border-2 border-border-strong bg-bg-surface font-mono text-caption">
          {evidenceCount} evidence point{evidenceCount !== 1 ? "s" : ""}
        </TooltipContent>
      </Tooltip>
    );
  }

  return bar;
}
