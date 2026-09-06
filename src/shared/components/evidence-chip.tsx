/**
 * Evidence Chip — BRUTALIST
 * Reference: Design Spec §B.11, Brutalism × Neo-Maximalism restyle
 */

import { FileCode, GitCommit } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import type { EvidenceDetectionMethod } from "@/shared/types";

interface EvidenceChipProps {
  label: string;
  method?: EvidenceDetectionMethod;
  onClick?: () => void;
  className?: string;
}

export function EvidenceChip({
  label,
  method = "file",
  onClick,
  className,
}: EvidenceChipProps) {
  const Icon = method === "import" || method === "manifest" ? GitCommit : FileCode;

  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 border border-border-strong bg-bg-surface-alt px-2.5 py-1 font-mono text-caption text-brand-secondary transition-all",
        "hover:border-brand-secondary hover:shadow-[2px_2px_0px_0px_var(--color-brand-secondary)]",
        onClick && "cursor-pointer",
        className,
      )}
    >
      <Icon className="h-3 w-3 shrink-0" />
      <span className="truncate max-w-[200px]">{label}</span>
    </button>
  );
}
