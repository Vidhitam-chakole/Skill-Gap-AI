/**
 * Empty State — BRUTALIST
 * Reference: Design Spec §B.21, Brutalism × Neo-Maximalism restyle
 */

import type { ReactNode } from "react";
import { FileSearch } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center border-2 border-dashed border-border-strong bg-bg-surface-alt py-16 text-center",
        className,
      )}
    >
      <div className="mb-4 text-text-tertiary">
        {icon ?? <FileSearch className="h-12 w-12" strokeWidth={1.5} />}
      </div>
      <h3 className="font-mono text-heading-md font-bold uppercase tracking-wide text-text-primary">
        {title}
      </h3>
      <p className="mt-2 max-w-sm text-body-sm text-text-secondary">
        {description}
      </p>
      {action && (
        <Button onClick={action.onClick} variant="secondary" className="mt-6">
          {action.label}
        </Button>
      )}
    </div>
  );
}
