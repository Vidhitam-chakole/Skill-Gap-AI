/**
 * Recommendations — BRUTALIST × NEO-MAXIMALIST
 * Reference: Design Spec Part C, Screen 17
 *
 * Displays skill gap recommendations sorted by severity,
 * with rationale, evidence, related skill gaps, and suggested next steps.
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Target,
  AlertTriangle,
  AlertCircle,
  Info,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Lightbulb,
} from "lucide-react";
import { fetchRecommendations } from "@/shared/services";
import { EmptyState } from "@/shared/components/empty-state";
import { ErrorState } from "@/shared/components/error-state";
import { Button } from "@/components/ui/button";
import { cn } from "@/shared/utils/cn";
import type { Recommendation, Severity } from "@/shared/types";

// ============================================================
// Severity metadata
// ============================================================

const SEVERITY_META: Record<
  Severity,
  { label: string; icon: typeof AlertTriangle; border: string; text: string; bg: string }
> = {
  critical: {
    label: "Critical",
    icon: AlertTriangle,
    border: "border-danger",
    text: "text-danger",
    bg: "bg-danger/10",
  },
  high: {
    label: "High",
    icon: AlertCircle,
    border: "border-warning",
    text: "text-warning",
    bg: "bg-warning/10",
  },
  medium: {
    label: "Medium",
    icon: Info,
    border: "border-info",
    text: "text-info",
    bg: "bg-info/10",
  },
  low: {
    label: "Low",
    icon: Target,
    border: "border-success",
    text: "text-success",
    bg: "bg-success/10",
  },
};

// ============================================================
// Main Component
// ============================================================

export default function RecommendationsPage() {
  const navigate = useNavigate();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const {
    data: recommendations,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["recommendations"],
    queryFn: fetchRecommendations,
  });

  if (error) {
    return (
      <ErrorState
        title="Failed to load recommendations"
        message="Something went wrong while fetching recommendations."
        onRetry={() => refetch()}
      />
    );
  }

  if (isLoading) return <PageSkeleton />;

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <span className="brutal-overline text-text-tertiary">Gaps</span>
          <h1 className="mt-1 font-display text-heading-xl font-black uppercase tracking-tight text-text-primary">
            Recommendations
          </h1>
        </div>
        <div className="border-2 border-border-strong bg-bg-surface p-8">
          <EmptyState
            icon={<Target className="h-10 w-10 text-text-tertiary" />}
            title="No recommendations yet"
            description="Complete an analysis to get personalized skill gap recommendations."
          />
        </div>
      </div>
    );
  }

  // Sort by severity priority
  const severityOrder: Record<Severity, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  };
  const sorted = [...recommendations].sort(
    (a, b) => severityOrder[a.severity] - severityOrder[b.severity],
  );

  const severityCounts = sorted.reduce(
    (acc, r) => {
      acc[r.severity]++;
      return acc;
    },
    { critical: 0, high: 0, medium: 0, low: 0 } as Record<Severity, number>,
  );

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div>
        <span className="brutal-overline text-text-tertiary">Gaps</span>
        <h1 className="mt-1 font-display text-heading-xl font-black uppercase tracking-tight text-text-primary">
          Recommendations
        </h1>
      </div>

      {/* Severity Summary Bar */}
      <div className="flex gap-0 border-2 border-border-strong">
        {(["critical", "high", "medium", "low"] as Severity[]).map(
          (sev, i) => {
            const meta = SEVERITY_META[sev];
            const count = severityCounts[sev];
            return (
              <div
                key={sev}
                className={cn(
                  "flex items-center gap-2 border-r-2 border-border-strong px-4 py-3 last:border-r-0",
                  count > 0 ? meta.bg : "bg-bg-surface",
                )}
              >
                <meta.icon
                  className={cn("h-4 w-4", count > 0 ? meta.text : "text-text-tertiary")}
                />
                <span
                  className={cn(
                    "font-mono text-caption font-bold uppercase",
                    count > 0 ? meta.text : "text-text-tertiary",
                  )}
                >
                  {count} {meta.label}
                </span>
              </div>
            );
          },
        )}
      </div>

      {/* Recommendation Cards */}
      <div className="flex flex-col gap-0">
        {sorted.map((rec, i) => {
          const meta = SEVERITY_META[rec.severity];
          const isExpanded = expandedIndex === i;

          return (
            <div
              key={i}
              className={cn(
                "border-2 border-border-strong bg-bg-surface transition-all",
                i > 0 && "-mt-0.5",
                isExpanded && "shadow-brutal-accent",
              )}
            >
              {/* Header */}
              <button
                onClick={() => setExpandedIndex(isExpanded ? null : i)}
                className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-bg-surface-alt"
              >
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center border-2",
                    meta.border,
                    meta.bg,
                  )}
                >
                  <meta.icon className={cn("h-5 w-5", meta.text)} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "border-2 px-2 py-0.5 font-mono text-overline font-bold uppercase tracking-wider",
                        meta.border,
                        meta.text,
                        meta.bg,
                      )}
                    >
                      {meta.label}
                    </span>
                  </div>
                  <h3 className="mt-1 font-mono text-body-md font-bold text-text-primary">
                    {rec.title}
                  </h3>
                </div>

                {isExpanded ? (
                  <ChevronUp className="h-5 w-5 shrink-0 text-text-tertiary" />
                ) : (
                  <ChevronDown className="h-5 w-5 shrink-0 text-text-tertiary" />
                )}
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t-2 border-border-subtle px-5 py-5">
                  {/* Rationale */}
                  <p className="font-mono text-body-sm text-text-secondary leading-relaxed">
                    {rec.rationale}
                  </p>

                  {/* Related Skill Gaps */}
                  {rec.relatedSkillGaps.length > 0 && (
                    <div className="mt-4">
                      <span className="brutal-overline text-text-tertiary">
                        Related Skills
                      </span>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {rec.relatedSkillGaps.map((gap) => (
                          <button
                            key={gap}
                            onClick={() =>
                              navigate(`/dashboard/skills/${gap.toLowerCase()}`)
                            }
                            className="border-2 border-brand-secondary bg-brand-secondary/10 px-3 py-1 font-mono text-caption font-bold uppercase tracking-wider text-brand-secondary transition-all hover:shadow-[2px_2px_0px_0px_var(--color-brand-secondary)] hover:-translate-y-0.5"
                          >
                            {gap}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggested Next Step */}
                  <div className="mt-4 flex items-start gap-3 border-2 border-brand-primary bg-brand-primary/6 p-4">
                    <Lightbulb className="h-5 w-5 shrink-0 text-brand-primary" />
                    <div>
                      <span className="font-mono text-overline font-bold uppercase tracking-widest text-brand-primary">
                        Next Step
                      </span>
                      <p className="mt-1 font-mono text-body-sm text-text-secondary leading-relaxed">
                        {rec.suggestedNextStep}
                      </p>
                    </div>
                  </div>

                  {/* Evidence */}
                  {rec.linkedEvidence.length > 0 && (
                    <div className="mt-4">
                      <span className="brutal-overline text-text-tertiary">
                        Evidence
                      </span>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {rec.linkedEvidence.map((ev, j) => (
                          <span
                            key={j}
                            className="border border-border-subtle bg-bg-surface-alt px-2.5 py-1 font-mono text-caption text-text-tertiary"
                          >
                            {ev.sourceFile}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* CTA to Roadmap */}
      <div className="border-2 border-brand-primary bg-brand-primary/6 p-6 shadow-brutal-accent">
        <div className="flex items-center gap-4">
          <div className="border-2 border-brand-primary bg-brand-primary/16 p-3">
            <Target className="h-5 w-5 text-brand-primary" />
          </div>
          <div className="flex-1">
            <p className="font-mono text-body-md font-bold text-text-primary uppercase">
              Ready to level up?
            </p>
            <p className="font-mono text-body-sm text-text-secondary">
              View your personalized learning roadmap to close these gaps.
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={() => navigate("/dashboard/roadmap")}
            className="font-bold uppercase tracking-wider"
          >
            Roadmap
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Skeleton
// ============================================================

function PageSkeleton() {
  return (
    <div className="flex flex-col gap-5 animate-pulse">
      <div className="h-8 w-48 bg-bg-surface-alt" />
      <div className="h-12 border-2 border-border-strong bg-bg-surface-alt" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="h-20 border-2 border-border-strong bg-bg-surface-alt" />
      ))}
    </div>
  );
}
