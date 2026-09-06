/**
 * Learning Roadmap — BRUTALIST × NEO-MAXIMALIST
 * Reference: Design Spec Part C, Screen 18
 *
 * Visual timeline of learning steps with:
 * - Vertical timeline with connected nodes
 * - Step cards with descriptions, estimated duration, skill gaps
 * - Status badges (not_started, in_progress, completed, skipped)
 * - Progress indicator
 * - Link to recommendations
 */

import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Map,
  Clock,
  CheckCircle,
  Circle,
  ArrowRight,
  Play,
  Target,
  SkipForward,
} from "lucide-react";
import { fetchLearningRoadmap } from "@/shared/services";
import { EmptyState } from "@/shared/components/empty-state";
import { ErrorState } from "@/shared/components/error-state";
import { Button } from "@/components/ui/button";
import { cn } from "@/shared/utils/cn";
import type { RoadmapStepStatus, LearningRoadmapStep } from "@/shared/types";

// ============================================================
// Status metadata
// ============================================================

const STATUS_META: Record<
  RoadmapStepStatus,
  { label: string; icon: typeof Circle; color: string; bg: string; border: string }
> = {
  not_started: {
    label: "Not Started",
    icon: Circle,
    color: "text-text-tertiary",
    bg: "bg-bg-surface-alt",
    border: "border-border-strong",
  },
  in_progress: {
    label: "In Progress",
    icon: Play,
    color: "text-brand-primary",
    bg: "bg-brand-primary/10",
    border: "border-brand-primary",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle,
    color: "text-success",
    bg: "bg-success/10",
    border: "border-success",
  },
  skipped: {
    label: "Skipped",
    icon: SkipForward,
    color: "text-text-tertiary",
    bg: "bg-bg-surface-alt",
    border: "border-border-subtle",
  },
};

// ============================================================
// Main Component
// ============================================================

export default function LearningRoadmap() {
  const navigate = useNavigate();

  const {
    data: roadmap,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["roadmap"],
    queryFn: fetchLearningRoadmap,
  });

  if (error) {
    return (
      <ErrorState
        title="Failed to load roadmap"
        message="Something went wrong while fetching your learning roadmap."
        onRetry={() => refetch()}
      />
    );
  }

  if (isLoading) return <PageSkeleton />;

  if (!roadmap || roadmap.steps.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <span className="brutal-overline text-text-tertiary">Path</span>
          <h1 className="mt-1 font-display text-heading-xl font-black uppercase tracking-tight text-text-primary">
            Learning Roadmap
          </h1>
        </div>
        <div className="border-2 border-border-strong bg-bg-surface p-8">
          <EmptyState
            icon={<Map className="h-10 w-10 text-text-tertiary" />}
            title="No roadmap yet"
            description="Complete an analysis to get your personalized learning roadmap."
          />
        </div>
      </div>
    );
  }

  const completedCount = roadmap.steps.filter(
    (s) => s.status === "completed",
  ).length;
  const progressPct = Math.round(
    (completedCount / roadmap.steps.length) * 100,
  );

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <span className="brutal-overline text-text-tertiary">Path</span>
          <h1 className="mt-1 font-display text-heading-xl font-black uppercase tracking-tight text-text-primary">
            Learning Roadmap
          </h1>
        </div>
        <div className="text-right">
          <span className="font-mono text-heading-lg font-black text-brand-primary">
            {roadmap.totalEstimatedDuration}
          </span>
          <p className="font-mono text-overline font-bold uppercase tracking-widest text-text-tertiary">
            Total Duration
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="border-2 border-border-strong bg-bg-surface p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-caption font-bold uppercase tracking-wider text-text-secondary">
            Progress
          </span>
          <span className="font-mono text-body-md font-black text-brand-primary">
            {completedCount}/{roadmap.steps.length} steps
          </span>
        </div>
        <div className="h-3 border-2 border-border-strong bg-bg-surface-alt">
          <div
            className="h-full bg-brand-primary transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* ============================================================ */}
      {/* TIMELINE */}
      {/* ============================================================ */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[23px] top-0 bottom-0 w-0.5 bg-border-strong" />

        <div className="flex flex-col gap-0">
          {roadmap.steps.map((step, i) => {
            const meta = STATUS_META[step.status];
            const StatusIcon = meta.icon;

            return (
              <div key={step.order} className="relative flex gap-5">
                {/* Timeline Node */}
                <div className="relative z-10 flex shrink-0 items-start pt-5">
                  <div
                    className={cn(
                      "flex h-[46px] w-[46px] items-center justify-center border-2 bg-bg-surface",
                      meta.border,
                    )}
                  >
                    <StatusIcon className={cn("h-5 w-5", meta.color)} />
                  </div>
                </div>

                {/* Step Card */}
                <div
                  className={cn(
                    "mb-5 flex-1 border-2 bg-bg-surface transition-all",
                    meta.border,
                    step.status === "in_progress" && "shadow-brutal-accent",
                  )}
                >
                  {/* Step header */}
                  <div className="flex items-center gap-3 px-5 py-4">
                    <span className="font-mono text-heading-lg font-black text-text-tertiary">
                      {String(step.order).padStart(2, "0")}
                    </span>
                    <div className="flex-1">
                      <h3 className="font-mono text-body-md font-bold text-text-primary">
                        {step.title}
                      </h3>
                    </div>
                    <span
                      className={cn(
                        "border-2 px-2.5 py-0.5 font-mono text-overline font-bold uppercase tracking-wider",
                        meta.border,
                        meta.color,
                        meta.bg,
                      )}
                    >
                      {meta.label}
                    </span>
                  </div>

                  {/* Description */}
                  <div className="border-t-2 border-border-subtle px-5 py-4">
                    <p className="font-mono text-body-sm text-text-secondary leading-relaxed">
                      {step.description}
                    </p>

                    {/* Meta row */}
                    <div className="mt-4 flex items-center gap-4">
                      <span className="flex items-center gap-1.5 font-mono text-caption text-text-tertiary">
                        <Clock className="h-3.5 w-3.5" />
                        {step.estimatedDuration}
                      </span>
                    </div>

                    {/* Skill gaps */}
                    {step.linkedSkillGaps.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {step.linkedSkillGaps.map((gap) => (
                          <button
                            key={gap}
                            onClick={() =>
                              navigate(`/dashboard/skills/${gap.toLowerCase()}`)
                            }
                            className="border-2 border-brand-tertiary bg-brand-tertiary/10 px-3 py-1 font-mono text-caption font-bold uppercase tracking-wider text-brand-tertiary transition-all hover:shadow-[2px_2px_0px_0px_var(--color-brand-tertiary)] hover:-translate-y-0.5"
                          >
                            {gap}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA to Recommendations */}
      <div className="border-2 border-brand-primary bg-brand-primary/6 p-6 shadow-brutal-accent">
        <div className="flex items-center gap-4">
          <div className="border-2 border-brand-primary bg-brand-primary/16 p-3">
            <Target className="h-5 w-5 text-brand-primary" />
          </div>
          <div className="flex-1">
            <p className="font-mono text-body-md font-bold text-text-primary uppercase">
              See all recommendations
            </p>
            <p className="font-mono text-body-sm text-text-secondary">
              View detailed skill gap analysis with evidence.
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={() => navigate("/dashboard/recommendations")}
            className="font-bold uppercase tracking-wider"
          >
            View
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
      <div className="h-16 border-2 border-border-strong bg-bg-surface-alt" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-32 border-2 border-border-strong bg-bg-surface-alt ml-16" />
      ))}
    </div>
  );
}
