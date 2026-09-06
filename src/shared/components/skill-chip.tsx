/**
 * Skill Chip — BRUTALIST
 * Reference: Design Spec §B.13, Brutalism × Neo-Maximalism restyle
 *
 * Thick-bordered pill, monospace text, raw confidence indicator.
 */

import { cn } from "@/shared/utils/cn";
import { getConfidenceLevel, getConfidenceColor } from "@/shared/utils/confidence";

interface SkillChipProps {
  name: string;
  confidence: number;
  className?: string;
  onClick?: () => void;
}

export function SkillChip({
  name,
  confidence,
  className,
  onClick,
}: SkillChipProps) {
  const level = getConfidenceLevel(confidence);
  const color = getConfidenceColor(level);

  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex flex-col items-center gap-1.5 border-2 border-border-strong bg-bg-surface px-4 py-3 transition-all",
        "hover:border-brand-primary hover:shadow-brutal-accent hover:-translate-y-0.5",
        onClick && "cursor-pointer",
        className,
      )}
    >
      <span className="font-mono text-body-sm font-bold uppercase tracking-wide text-text-primary">
        {name}
      </span>
      <div className="h-1.5 w-full bg-bg-surface-alt border border-border-subtle">
        <div
          className="h-full"
          style={{
            width: `${confidence}%`,
            backgroundColor: color,
          }}
        />
      </div>
      <span className="font-mono text-overline font-bold text-text-tertiary">
        {confidence}%
      </span>
    </button>
  );
}
