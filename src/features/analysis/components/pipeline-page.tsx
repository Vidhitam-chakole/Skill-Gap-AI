/**
 * Live Analysis Pipeline — BRUTALIST × NEO-MAXIMALIST
 * Reference: Design Spec Part C, Screen 8
 *
 * Full animated pipeline with:
 * - Realistic per-stage timing (different durations per stage)
 * - Sub-step progress within each stage
 * - Estimated time remaining with live countdown
 * - Error state with retry per-stage
 * - Stage-specific detail messages
 * - Smooth progress bar with gradient
 * - Animated completion state
 */

import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Loader2,
  Circle,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  GitBranch,
  Code2,
  Sparkles,
  Download,
  Clock,
  Zap,
} from "lucide-react";
import { cn } from "@/shared/utils/cn";
import type { PipelineStage } from "@/shared/types";

// ============================================================
// Stage Configuration
// ============================================================

interface StageConfig {
  key: PipelineStage;
  label: string;
  icon: typeof GitBranch;
  duration: number; // ms
  subSteps: string[];
  detail: string;
}

const STAGES: StageConfig[] = [
  {
    key: "queued",
    label: "Queued",
    icon: Clock,
    duration: 1500,
    subSteps: ["Initializing analysis engine", "Preparing workspace"],
    detail: "Waiting to begin analysis...",
  },
  {
    key: "cloning",
    label: "Cloning Repositories",
    icon: Download,
    duration: 4000,
    subSteps: [
      "Fetching repository list",
      "Cloning skill-plus-web",
      "Cloning portfolio-v3",
      "Cloning rust-web-server",
      "Resolving dependencies",
    ],
    detail: "Downloading your repositories for analysis...",
  },
  {
    key: "analyzing",
    label: "Analyzing Code",
    icon: Code2,
    duration: 6000,
    subSteps: [
      "Detecting languages & frameworks",
      "Extracting import graphs",
      "Scanning for architecture patterns",
      "Computing dependency trees",
      "Running quality heuristics",
      "Building skill confidence scores",
    ],
    detail: "Deep-scanning code for skills, patterns, and quality...",
  },
  {
    key: "synthesizing",
    label: "Synthesizing Insights",
    icon: Sparkles,
    duration: 3500,
    subSteps: [
      "Merging evidence across repos",
      "Generating quality scores",
      "Building recommendation engine",
      "Preparing dashboard data",
    ],
    detail: "Turning raw analysis into actionable insights...",
  },
  {
    key: "complete",
    label: "Analysis Complete",
    icon: Zap,
    duration: 0,
    subSteps: [],
    detail: "Your engineering profile is ready.",
  },
];

// ============================================================
// Simulated failure config (for demo)
// ============================================================

const SIMULATED_FAILURE = {
  stageIndex: -1, // Set to 1-3 to simulate failure at that stage (-1 = no failure)
  subStepIndex: 2, // Fail at which sub-step
};

// ============================================================
// Helpers
// ============================================================

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

function getTotalDuration(): number {
  return STAGES.reduce((sum, s) => sum + s.duration, 0);
}

function getElapsedDuration(completedStages: number): number {
  let elapsed = 0;
  for (let i = 0; i < completedStages && i < STAGES.length; i++) {
    elapsed += STAGES[i].duration;
  }
  return elapsed;
}

// ============================================================
// Main Component
// ============================================================

export default function PipelinePage() {
  const navigate = useNavigate();

  // Pipeline state
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [currentSubStep, setCurrentSubStep] = useState(0);
  const [stageProgress, setStageProgress] = useState(0); // 0-100 within current stage
  const [elapsed, setElapsed] = useState(0); // total elapsed ms
  const [failed, setFailed] = useState(false);
  const [failedStage, setFailedStage] = useState(-1);
  const [failedSubStep, setFailedSubStep] = useState(0);

  const startTimeRef = useRef(Date.now());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalDuration = getTotalDuration();
  const isComplete = currentStageIndex >= STAGES.length - 1;
  const isFailed = failed;

  // Overall progress percentage
  const overallProgress = Math.min(
    100,
    Math.round(
      (getElapsedDuration(currentStageIndex) + (STAGES[currentStageIndex]?.duration ?? 0) * (stageProgress / 100)) /
        totalDuration *
        100,
    ),
  );

  // Estimated time remaining
  const remainingMs = Math.max(
    0,
    totalDuration - (getElapsedDuration(currentStageIndex) + (STAGES[currentStageIndex]?.duration ?? 0) * (stageProgress / 100)),
  );
  const remainingSeconds = Math.ceil(remainingMs / 1000);

  // ============================================================
  // Stage progression logic
  // ============================================================

  const advanceToStage = useCallback((stageIndex: number) => {
    setCurrentStageIndex(stageIndex);
    setCurrentSubStep(0);
    setStageProgress(0);

    if (stageIndex >= STAGES.length - 1) {
      // Complete
      setStageProgress(100);
      return;
    }

    const stage = STAGES[stageIndex];
    const subStepDuration = stage.duration / stage.subSteps.length;
    let subStep = 0;

    const subInterval = setInterval(() => {
      subStep++;
      if (subStep >= stage.subSteps.length) {
        clearInterval(subInterval);
        setCurrentSubStep(stage.subSteps.length - 1);
        setStageProgress(100);

        // Check for simulated failure
        if (
          SIMULATED_FAILURE.stageIndex === stageIndex &&
          SIMULATED_FAILURE.subStepIndex >= 0
        ) {
          setTimeout(() => {
            setFailed(true);
            setFailedStage(stageIndex);
            setFailedSubStep(subStep);
            clearInterval(subInterval);
          }, 300);
          return;
        }

        // Advance to next stage
        setTimeout(() => {
          advanceToStage(stageIndex + 1);
        }, 400);
        return;
      }

      setCurrentSubStep(subStep);
      setStageProgress(Math.round((subStep / stage.subSteps.length) * 100));
    }, subStepDuration);

    intervalRef.current = subInterval;
  }, []);

  // Start pipeline
  useEffect(() => {
    startTimeRef.current = Date.now();
    advanceToStage(0);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [advanceToStage]);

  // Elapsed timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(Date.now() - startTimeRef.current);
    }, 100);
    return () => clearInterval(timer);
  }, []);

  // Retry handler
  const handleRetry = () => {
    setFailed(false);
    setCurrentSubStep(0);
    setStageProgress(0);
    advanceToStage(failedStage);
  };

  // Navigate to dashboard
  const handleViewDashboard = () => {
    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-base p-6">
      <div className="w-full max-w-2xl">
        {/* ============================================================ */}
        {/* HEADER */}
        {/* ============================================================ */}
        <div className="mb-6 text-center">
          <span className="brutal-overline text-text-tertiary">
            Skill+ Analysis
          </span>
          <h1 className="mt-2 font-display text-heading-xl font-black uppercase tracking-tight text-text-primary">
            {isFailed
              ? "Analysis Failed"
              : isComplete
                ? "Analysis Complete"
                : "Analyzing Profile"}
          </h1>
          {!isFailed && !isComplete && (
            <p className="mt-2 font-mono text-body-sm text-text-secondary">
              Usually takes 1–2 minutes. Do not close this page.
            </p>
          )}
        </div>

        {/* ============================================================ */}
        {/* PROGRESS SECTION */}
        {/* ============================================================ */}

        {/* Big Percentage + Time */}
        <div className="mb-4 flex items-end justify-between">
          <div className="flex items-center gap-3">
            {!isFailed && !isComplete && (
              <Loader2 className="h-5 w-5 animate-spin text-brand-primary" />
            )}
            {isComplete && (
              <CheckCircle className="h-6 w-6 text-success" />
            )}
            {isFailed && (
              <AlertTriangle className="h-6 w-6 text-danger" />
            )}
            <span className="font-mono text-body-sm font-bold uppercase tracking-wider text-text-secondary">
              {isFailed
                ? `Failed at ${STAGES[failedStage]?.label ?? "unknown"}`
                : isComplete
                  ? "All stages completed"
                  : `Stage ${currentStageIndex + 1} of ${STAGES.length}`}
            </span>
          </div>

          <div className="text-right">
            <span
              className={cn(
                "font-mono text-[56px] font-black leading-none",
                isFailed
                  ? "text-danger"
                  : isComplete
                    ? "text-success"
                    : "text-brand-primary",
              )}
            >
              {overallProgress}%
            </span>
          </div>
        </div>

        {/* Main Progress Bar */}
        <div className="mb-2 h-4 border-2 border-border-strong bg-bg-surface-alt">
          <div
            className={cn(
              "h-full transition-all duration-300 ease-out",
              isFailed
                ? "bg-danger"
                : isComplete
                  ? "bg-success"
                  : "bg-brand-primary",
            )}
            style={{ width: `${overallProgress}%` }}
          />
        </div>

        {/* Time remaining */}
        <div className="mb-6 flex items-center justify-between">
          <span className="font-mono text-caption text-text-tertiary">
            {formatTime(Math.floor(elapsed / 1000))} elapsed
          </span>
          <span className="font-mono text-caption text-text-tertiary">
            {isFailed
              ? "—"
              : isComplete
                ? "Done"
                : `~${formatTime(remainingSeconds)} remaining`}
          </span>
        </div>

        {/* ============================================================ */}
        {/* STAGE PIPELINE CARD */}
        {/* ============================================================ */}
        <div className="border-2 border-border-strong bg-bg-surface shadow-card">
          {/* Card header */}
          <div className="border-b-2 border-border-strong px-6 py-4">
            <span className="brutal-overline text-text-tertiary">Pipeline</span>
            <p className="mt-1 font-mono text-body-sm text-text-secondary">
              {isFailed
                ? STAGES[failedStage]?.detail ?? "An error occurred."
                : STAGES[currentStageIndex]?.detail ?? ""}
            </p>
          </div>

          {/* Stage list */}
          <div className="flex flex-col gap-0">
            {STAGES.map((stage, i) => {
              const isDone = i < currentStageIndex || (isComplete && i <= currentStageIndex);
              const isCurrent = i === currentStageIndex && !isComplete && !isFailed;
              const isFailedStage_ = isFailed && i === failedStage;
              const Icon = stage.icon;

              return (
                <div
                  key={stage.key}
                  className={cn(
                    "border-b-2 border-border-strong last:border-b-0 transition-all",
                    isDone && !isFailedStage_ && "bg-success/4",
                    isCurrent && "bg-brand-primary/4",
                    isFailedStage_ && "bg-danger/4",
                  )}
                >
                  {/* Stage header row */}
                  <div
                    className={cn(
                      "flex items-center gap-4 px-6 py-4",
                    )}
                  >
                    {/* Icon */}
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center border-2",
                        isDone && !isFailedStage_
                          ? "border-success bg-success/10 text-success"
                          : isFailedStage_
                            ? "border-danger bg-danger/10 text-danger"
                            : isCurrent
                              ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
                              : "border-border-subtle bg-bg-surface-alt text-text-tertiary",
                      )}
                    >
                      {isDone && !isFailedStage_ ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : isFailedStage_ ? (
                        <AlertTriangle className="h-5 w-5" />
                      ) : isCurrent ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </div>

                    {/* Label */}
                    <div className="flex-1">
                      <span
                        className={cn(
                          "font-mono text-body-md font-bold uppercase tracking-wide",
                          isDone && !isFailedStage_
                            ? "text-success"
                            : isFailedStage_
                              ? "text-danger"
                              : isCurrent
                                ? "text-brand-primary"
                                : "text-text-tertiary",
                        )}
                      >
                        {stage.label}
                      </span>
                    </div>

                    {/* Status badge */}
                    {isDone && !isFailedStage_ && (
                      <span className="font-mono text-overline font-bold uppercase tracking-widest text-success">
                        Done
                      </span>
                    )}
                    {isFailedStage_ && (
                      <button
                        onClick={handleRetry}
                        className="flex items-center gap-1.5 border-2 border-danger bg-danger/10 px-3 py-1 font-mono text-caption font-bold uppercase tracking-wider text-danger transition-all hover:bg-danger/20"
                      >
                        <RefreshCw className="h-3 w-3" />
                        Retry
                      </button>
                    )}
                    {isCurrent && (
                      <span className="font-mono text-overline font-bold uppercase tracking-widest text-brand-primary">
                        Active
                      </span>
                    )}
                    {!isDone && !isFailedStage_ && !isCurrent && (
                      <span className="font-mono text-overline font-bold uppercase tracking-widest text-text-tertiary">
                        Pending
                      </span>
                    )}
                  </div>

                  {/* Sub-steps (only for current stage) */}
                  {isCurrent && stage.subSteps.length > 0 && (
                    <div className="border-t-2 border-border-subtle px-6 py-3">
                      <div className="flex flex-col gap-2">
                        {stage.subSteps.map((sub, j) => {
                          const isSubDone = j < currentSubStep;
                          const isSubCurrent = j === currentSubStep;

                          return (
                            <div
                              key={j}
                              className="flex items-center gap-3"
                            >
                              {isSubDone ? (
                                <CheckCircle className="h-3.5 w-3.5 shrink-0 text-success" />
                              ) : isSubCurrent ? (
                                <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-brand-primary" />
                              ) : (
                                <Circle className="h-3.5 w-3.5 shrink-0 text-text-tertiary" />
                              )}
                              <span
                                className={cn(
                                  "font-mono text-caption",
                                  isSubDone
                                    ? "text-success"
                                    : isSubCurrent
                                      ? "text-brand-primary font-bold"
                                      : "text-text-tertiary",
                                )}
                              >
                                {sub}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Stage mini progress bar */}
                      <div className="mt-3 h-1.5 bg-bg-surface-alt border border-border-subtle">
                        <div
                          className="h-full bg-brand-primary transition-all duration-200"
                          style={{ width: `${stageProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Failed stage detail */}
                  {isFailedStage_ && (
                    <div className="border-t-2 border-danger/30 px-6 py-3">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="h-4 w-4 shrink-0 text-danger" />
                        <span className="font-mono text-caption text-danger">
                          Connection timed out while cloning repository. Check your network and try again.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ============================================================ */}
          {/* COMPLETION / ACTION SECTION */}
          {/* ============================================================ */}
          {isComplete && (
            <div className="border-t-2 border-border-strong px-6 py-6">
              {/* Summary stats */}
              <div className="mb-5 grid grid-cols-3 gap-0">
                {[
                  { label: "Repos", value: "12", accent: "text-brand-primary" },
                  { label: "Skills", value: "47", accent: "text-brand-secondary" },
                  { label: "Patterns", value: "8", accent: "text-brand-tertiary" },
                ].map((stat, i) => (
                  <div
                    key={stat.label}
                    className={cn(
                      "flex flex-col items-center border-2 border-border-strong bg-bg-surface-alt py-4",
                      i > 0 && "-ml-0.5",
                    )}
                  >
                    <span className={cn("font-mono text-heading-lg font-black", stat.accent)}>
                      {stat.value}
                    </span>
                    <span className="font-mono text-overline font-bold uppercase tracking-widest text-text-tertiary">
                      {stat.label}
                    </span>
                  </div>
                ))}
              </div>

              <Button
                onClick={handleViewDashboard}
                className="w-full text-base font-bold uppercase tracking-wider"
                size="lg"
              >
                View Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* ELAPSED TIMER FOOTER */}
        {/* ============================================================ */}
        {!isComplete && !isFailed && (
          <div className="mt-4 text-center">
            <span className="font-mono text-overline text-text-tertiary">
              Total elapsed: {formatTime(Math.floor(elapsed / 1000))}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
