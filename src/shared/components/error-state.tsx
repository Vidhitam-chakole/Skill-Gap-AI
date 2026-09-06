/**
 * Error State — BRUTALIST
 * Reference: Design Spec §B.22, Brutalism × Neo-Maximalism restyle
 */

import { AlertTriangle, RefreshCw } from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Failed to load",
  message = "Something went wrong while fetching data. Please try again.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center border-2 border-danger/40 bg-danger/4 py-16 text-center",
        className,
      )}
    >
      <div className="mb-4 text-danger">
        <AlertTriangle className="h-12 w-12" strokeWidth={1.5} />
      </div>
      <h3 className="font-mono text-heading-md font-bold uppercase tracking-wide text-text-primary">
        {title}
      </h3>
      <p className="mt-2 max-w-sm text-body-sm text-text-secondary">
        {message}
      </p>
      {onRetry && (
        <Button onClick={onRetry} variant="secondary" className="mt-6">
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      )}
    </div>
  );
}
