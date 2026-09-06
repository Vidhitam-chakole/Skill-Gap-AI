/**
 * Repository Detail — BRUTALIST × NEO-MAXIMALIST
 * Reference: Design Spec Part C, Screen 11
 *
 * Full repository detail view with:
 * - Header: repo name, description, language, stars, quality ring
 * - Quality sub-scores panel (documentation, testing, CI/CD, structure)
 * - Architecture patterns panel with confidence + evidence
 * - Dependencies panel with category badges
 * - Tech stack chips
 * - README summary
 * - Back navigation
 */

import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Star,
  GitBranch,
  ExternalLink,
  Lock,
  FileText,
  Layers,
  Package,
  Cpu,
  Shield,
  CheckCircle,
  AlertTriangle,
  Circle,
} from "lucide-react";
import { fetchRepositoryDetail } from "@/shared/services";
import { QualityRing } from "@/shared/components/quality-ring";
import { ConfidenceBar } from "@/shared/components/confidence-bar";
import { EmptyState } from "@/shared/components/empty-state";
import { ErrorState } from "@/shared/components/error-state";
import { formatNumber, formatRelativeDate, formatDate } from "@/shared/utils/format";
import { getConfidenceColor, getQualityLevel, getQualityColor } from "@/shared/utils/confidence";
import { cn } from "@/shared/utils/cn";
import type { QualitySubScores, ArchitecturePattern, Dependency } from "@/shared/types";
import { Button } from "@/components/ui/button";

// ============================================================
// Quality sub-score metadata
// ============================================================

const SUB_SCORE_META: {
  key: keyof QualitySubScores;
  label: string;
  icon: typeof FileText;
}[] = [
  { key: "documentation", label: "Documentation", icon: FileText },
  { key: "testing", label: "Testing", icon: Shield },
  { key: "cicd", label: "CI/CD", icon: GitBranch },
  { key: "structure", label: "Structure", icon: Layers },
];

// ============================================================
// Category color map for dependencies
// ============================================================

const CATEGORY_STYLES: Record<string, { border: string; text: string; bg: string }> = {
  language: { border: "border-brand-primary", text: "text-brand-primary", bg: "bg-brand-primary/10" },
  framework: { border: "border-brand-secondary", text: "text-brand-secondary", bg: "bg-brand-secondary/10" },
  library: { border: "border-brand-tertiary", text: "text-brand-tertiary", bg: "bg-brand-tertiary/10" },
  database: { border: "border-brand-quaternary", text: "text-brand-quaternary", bg: "bg-brand-quaternary/10" },
  devops: { border: "border-chart-5", text: "text-chart-5", bg: "bg-chart-5/10" },
  testing: { border: "border-success", text: "text-success", bg: "bg-success/10" },
};

// ============================================================
// Main Component
// ============================================================

export default function RepositoryDetail() {
  const { repoId } = useParams<{ repoId: string }>();
  const navigate = useNavigate();

  const {
    data: repo,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["repository", repoId],
    queryFn: () => fetchRepositoryDetail(repoId!),
    enabled: !!repoId,
  });

  if (error) {
    return (
      <ErrorState
        title="Failed to load repository"
        message="Something went wrong while fetching repository details."
        onRetry={() => refetch()}
      />
    );
  }

  if (isLoading) return <DetailSkeleton />;

  if (!repo) {
    return (
      <div className="flex flex-col gap-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/dashboard/repositories")}
          className="mb-3 w-fit font-mono text-caption font-bold uppercase"
        >
          <ArrowLeft className="mr-1 h-3 w-3" />
          Back to Repos
        </Button>
        <div className="border-2 border-border-strong bg-bg-surface p-8">
          <EmptyState
            title="Repository not found"
            description="This repository may have been removed or is not accessible."
          />
        </div>
      </div>
    );
  }

  const overallQuality = Math.round(
    (repo.qualitySubScores.documentation +
      repo.qualitySubScores.testing +
      repo.qualitySubScores.cicd +
      repo.qualitySubScores.structure) /
      4,
  );

  return (
    <div className="flex flex-col gap-5">
      {/* Back Navigation */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/dashboard/repositories")}
        className="w-fit font-mono text-caption font-bold uppercase"
      >
        <ArrowLeft className="mr-1 h-3 w-3" />
        Back to Repos
      </Button>

      {/* ============================================================ */}
      {/* HEADER CARD */}
      {/* ============================================================ */}
      <div className="border-2 border-border-strong bg-bg-surface p-6">
        <div className="flex items-start gap-6">
          {/* Quality Ring */}
          <QualityRing
            score={repo.qualityScore}
            subScores={repo.qualitySubScores}
            size={80}
            className="shrink-0"
          />

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="font-display text-heading-xl font-black uppercase tracking-tight text-text-primary">
                {repo.name}
              </h1>
              {repo.isPrivate && (
                <span className="flex items-center gap-1 border-2 border-warning bg-warning/10 px-2 py-0.5 font-mono text-overline font-bold text-warning">
                  <Lock className="h-2.5 w-2.5" />
                  Private
                </span>
              )}
            </div>
            <p className="mt-2 font-mono text-body-md text-text-secondary leading-relaxed">
              {repo.description}
            </p>

            {/* Meta Row */}
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1.5 font-mono text-caption font-bold uppercase text-brand-secondary">
                <GitBranch className="h-3.5 w-3.5" />
                {repo.primaryLanguage}
              </span>
              <span className="flex items-center gap-1 font-mono text-caption text-text-tertiary">
                <Star className="h-3.5 w-3.5" />
                {formatNumber(repo.stars)} stars
              </span>
              <span className="font-mono text-caption text-text-tertiary">
                Updated {formatRelativeDate(repo.lastUpdated)}
              </span>
              <a
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 font-mono text-caption font-bold text-brand-primary hover:underline"
              >
                View on GitHub
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* TWO-COLUMN LAYOUT */}
      {/* ============================================================ */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* LEFT: Quality Sub-Scores */}
        <div className="border-2 border-border-strong bg-bg-surface">
          <div className="flex items-center gap-3 border-b-2 border-border-strong px-5 py-4">
            <span className="brutal-tag border-brand-primary text-brand-primary">
              Scores
            </span>
            <h2 className="font-mono text-heading-md font-black uppercase tracking-wide text-text-primary">
              Quality Breakdown
            </h2>
          </div>
          <div className="p-5">
            <div className="flex flex-col gap-4">
              {SUB_SCORE_META.map(({ key, label, icon: Icon }) => {
                const value = repo.qualitySubScores[key];
                const level = getQualityLevel(value);
                const color = getQualityColor(level);
                return (
                  <div key={key}>
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-text-tertiary" />
                        <span className="font-mono text-body-sm font-bold uppercase tracking-wide text-text-primary">
                          {label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className="font-mono text-body-md font-black"
                          style={{ color }}
                        >
                          {value}
                        </span>
                        <StatusDot level={level} />
                      </div>
                    </div>
                    <ConfidenceBar score={value} height={12} />
                  </div>
                );
              })}
            </div>

            {/* Overall Score */}
            <div className="mt-5 border-t-2 border-border-strong pt-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-body-md font-black uppercase tracking-wide text-text-primary">
                  Overall
                </span>
                <span className="font-display text-heading-lg font-black text-brand-primary">
                  {overallQuality}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Architecture Patterns */}
        <div className="border-2 border-border-strong bg-bg-surface">
          <div className="flex items-center gap-3 border-b-2 border-border-strong px-5 py-4">
            <span className="brutal-tag border-brand-secondary text-brand-secondary">
              Arch
            </span>
            <h2 className="font-mono text-heading-md font-black uppercase tracking-wide text-text-primary">
              Architecture Patterns
            </h2>
          </div>
          <div className="p-5">
            {repo.architecturePatterns.length === 0 ? (
              <EmptyState
                title="No patterns detected"
                description="Not enough data to identify architecture patterns."
              />
            ) : (
              <div className="flex flex-col gap-4">
                {repo.architecturePatterns.map((pattern) => (
                  <ArchitecturePatternCard
                    key={pattern.name}
                    pattern={pattern}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* FULL-WIDTH: Tech Stack + Dependencies */}
      {/* ============================================================ */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* Tech Stack Chips */}
        <div className="border-2 border-border-strong bg-bg-surface">
          <div className="flex items-center gap-3 border-b-2 border-border-strong px-5 py-4">
            <span className="brutal-tag border-brand-tertiary text-brand-tertiary">
              Stack
            </span>
            <h2 className="font-mono text-heading-md font-black uppercase tracking-wide text-text-primary">
              Tech Stack
            </h2>
          </div>
          <div className="flex flex-wrap gap-2 p-5">
            {repo.techChips.map((tech) => (
              <span
                key={tech}
                className="border-2 border-border-strong bg-bg-surface-alt px-3 py-1.5 font-mono text-body-sm font-bold uppercase tracking-wide text-text-primary transition-all hover:border-brand-primary hover:text-brand-primary"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Dependencies */}
        <div className="border-2 border-border-strong bg-bg-surface">
          <div className="flex items-center gap-3 border-b-2 border-border-strong px-5 py-4">
            <span className="brutal-tag border-brand-quaternary text-brand-quaternary">
              Deps
            </span>
            <h2 className="font-mono text-heading-md font-black uppercase tracking-wide text-text-primary">
              Dependencies
            </h2>
            <span className="ml-auto font-mono text-caption font-bold text-text-tertiary">
              {repo.dependencies.length}
            </span>
          </div>
          <div className="flex flex-col gap-0">
            {repo.dependencies.map((dep, i) => (
              <DependencyRow key={dep.name} dep={dep} isFirst={i === 0} />
            ))}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* README Summary */}
      {/* ============================================================ */}
      <div className="border-2 border-border-strong bg-bg-surface">
        <div className="flex items-center gap-3 border-b-2 border-border-strong px-5 py-4">
          <span className="brutal-tag border-success text-success">
            Readme
          </span>
          <h2 className="font-mono text-heading-md font-black uppercase tracking-wide text-text-primary">
            Summary
          </h2>
        </div>
        <div className="p-5">
          <p className="font-mono text-body-md text-text-secondary leading-relaxed">
            {repo.readmeSummary}
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Sub-components
// ============================================================

function ArchitecturePatternCard({ pattern }: { pattern: ArchitecturePattern }) {
  const color = getConfidenceColor(
    pattern.confidence >= 80 ? "high" : pattern.confidence >= 50 ? "medium" : "low",
  );

  return (
    <div className="border-2 border-border-strong bg-bg-surface-alt p-4 transition-all hover:shadow-brutal">
      <div className="flex items-start justify-between">
        <h3 className="font-mono text-body-md font-bold text-text-primary">
          {pattern.name}
        </h3>
        <span
          className="font-mono text-body-md font-black"
          style={{ color }}
        >
          {pattern.confidence}%
        </span>
      </div>

      <ConfidenceBar
        score={pattern.confidence}
        height={8}
        className="mt-2"
      />

      <p className="mt-3 font-mono text-body-sm text-text-secondary leading-relaxed">
        {pattern.whyDetected}
      </p>

      {/* Detected files */}
      {pattern.detectedFiles.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {pattern.detectedFiles.map((file) => (
            <span
              key={file}
              className="border border-border-subtle bg-bg-surface px-2 py-0.5 font-mono text-caption text-text-tertiary"
            >
              {file}
            </span>
          ))}
        </div>
      )}

      {/* Folder relationships */}
      {pattern.folderModuleRelationships.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {pattern.folderModuleRelationships.map((rel) => (
            <span
              key={rel}
              className="flex items-center gap-1 border border-brand-secondary/30 bg-brand-secondary/5 px-2 py-0.5 font-mono text-caption text-brand-secondary"
            >
              <Layers className="h-2.5 w-2.5" />
              {rel}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function DependencyRow({
  dep,
  isFirst,
}: {
  dep: Dependency;
  isFirst: boolean;
}) {
  const style = CATEGORY_STYLES[dep.category] ?? CATEGORY_STYLES.library;

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-5 py-3 transition-colors hover:bg-bg-surface-alt",
        !isFirst && "border-t border-border-subtle",
      )}
    >
      <Package className="h-4 w-4 shrink-0 text-text-tertiary" />
      <span className="flex-1 font-mono text-body-sm font-bold text-text-primary">
        {dep.name}
      </span>
      <span className="font-mono text-caption text-text-tertiary">
        {dep.version}
      </span>
      <span
        className={cn(
          "border-2 px-2 py-0.5 font-mono text-overline font-bold uppercase tracking-wider",
          style.border,
          style.text,
          style.bg,
        )}
      >
        {dep.category}
      </span>
    </div>
  );
}

function StatusDot({ level }: { level: "poor" | "fair" | "strong" }) {
  const colors = {
    poor: "bg-danger",
    fair: "bg-warning",
    strong: "bg-success",
  };
  return (
    <span
      className={cn("inline-block h-2 w-2 rounded-full", colors[level])}
    />
  );
}

// ============================================================
// Skeleton
// ============================================================

function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-5 animate-pulse">
      <div className="h-8 w-32 bg-bg-surface-alt" />
      <div className="h-40 border-2 border-border-strong bg-bg-surface" />
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="h-72 border-2 border-border-strong bg-bg-surface" />
        <div className="h-72 border-2 border-border-strong bg-bg-surface" />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="h-48 border-2 border-border-strong bg-bg-surface" />
        <div className="h-48 border-2 border-border-strong bg-bg-surface" />
      </div>
      <div className="h-32 border-2 border-border-strong bg-bg-surface" />
    </div>
  );
}
