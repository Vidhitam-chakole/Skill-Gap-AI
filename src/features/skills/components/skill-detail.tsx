/**
 * Skill Detail — BRUTALIST × NEO-MAXIMALIST
 * Reference: Design Spec Part C, Screen 13
 *
 * Full skill detail with:
 * - Header with name, category, confidence score
 * - Repo cross-references (which repos use this skill)
 * - Evidence groups (manifest, import, file, config)
 * - Detection method breakdown
 * - Confidence bar with contributing signals
 */

import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  GitBranch,
  FileCode,
  Settings,
  Package,
  Import,
  ExternalLink,
  Shield,
} from "lucide-react";
import { fetchSkillDetail } from "@/shared/services";
import { ConfidenceBar } from "@/shared/components/confidence-bar";
import { EmptyState } from "@/shared/components/empty-state";
import { ErrorState } from "@/shared/components/error-state";
import { Button } from "@/components/ui/button";
import { getConfidenceColor } from "@/shared/utils/confidence";
import { cn } from "@/shared/utils/cn";
import type {
  SkillDetail as SkillDetailType,
  EvidenceGroup,
  EvidenceDetectionMethod,
} from "@/shared/types";

// ============================================================
// Detection method metadata
// ============================================================

const METHOD_META: Record<
  EvidenceDetectionMethod,
  { label: string; icon: typeof FileCode; color: string }
> = {
  manifest: { label: "Manifest", icon: Package, color: "text-brand-primary" },
  import: { label: "Imports", icon: Import, color: "text-brand-secondary" },
  file: { label: "File Patterns", icon: FileCode, color: "text-brand-tertiary" },
  config: { label: "Configuration", icon: Settings, color: "text-brand-quaternary" },
  dependency: { label: "Dependencies", icon: Package, color: "text-chart-5" },
};

// ============================================================
// Category color map
// ============================================================

const CATEGORY_STYLE: Record<string, { border: string; text: string; bg: string }> = {
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

export default function SkillDetail() {
  const { skillId } = useParams<{ skillId: string }>();
  const navigate = useNavigate();

  const {
    data: skill,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["skill", skillId],
    queryFn: () => fetchSkillDetail(skillId!),
    enabled: !!skillId,
  });

  if (error) {
    return (
      <ErrorState
        title="Failed to load skill"
        message="Something went wrong while fetching skill details."
        onRetry={() => refetch()}
      />
    );
  }

  if (isLoading) return <DetailSkeleton />;

  if (!skill) {
    return (
      <div className="flex flex-col gap-6">
        <BackButton />
        <div className="border-2 border-border-strong bg-bg-surface p-8">
          <EmptyState
            title="Skill not found"
            description="This skill may not exist or hasn't been detected yet."
          />
        </div>
      </div>
    );
  }

  const catStyle = CATEGORY_STYLE[skill.category] ?? CATEGORY_STYLE.library;
  const confidenceColor = getConfidenceColor(
    skill.confidence >= 80 ? "high" : skill.confidence >= 50 ? "medium" : "low",
  );

  const totalEvidence = skill.evidenceGroups.reduce(
    (sum, g) => sum + g.evidence.length,
    0,
  );

  return (
    <div className="flex flex-col gap-5">
      <BackButton />

      {/* ============================================================ */}
      {/* HEADER */}
      {/* ============================================================ */}
      <div className="border-2 border-border-strong bg-bg-surface p-6">
        <div className="flex items-start gap-6">
          {/* Confidence Score Block */}
          <div className="flex flex-col items-center shrink-0">
            <span
              className="font-display text-[56px] font-black leading-none"
              style={{ color: confidenceColor }}
            >
              {skill.confidence}
            </span>
            <span className="font-mono text-overline font-bold uppercase tracking-widest text-text-tertiary">
              Confidence
            </span>
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="font-display text-heading-xl font-black uppercase tracking-tight text-text-primary">
                {skill.name}
              </h1>
              <span
                className={cn(
                  "border-2 px-3 py-0.5 font-mono text-overline font-bold uppercase tracking-wider",
                  catStyle.border,
                  catStyle.text,
                  catStyle.bg,
                )}
              >
                {skill.category}
              </span>
            </div>

            {/* Confidence Bar */}
            <div className="mt-4 max-w-lg">
              <ConfidenceBar
                score={skill.confidence}
                evidenceCount={totalEvidence}
                height={12}
              />
            </div>

            {/* Stats */}
            <div className="mt-4 flex items-center gap-6">
              <span className="font-mono text-caption text-text-tertiary">
                <span className="font-bold text-text-primary">{skill.repoCount}</span> repositories
              </span>
              <span className="font-mono text-caption text-text-tertiary">
                <span className="font-bold text-text-primary">{skill.evidenceGroups.length}</span> evidence sources
              </span>
              <span className="font-mono text-caption text-text-tertiary">
                <span className="font-bold text-text-primary">{totalEvidence}</span> evidence points
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* REPO CROSS-REFERENCES */}
      {/* ============================================================ */}
      <div className="border-2 border-border-strong bg-bg-surface">
        <div className="flex items-center gap-3 border-b-2 border-border-strong px-5 py-4">
          <span className="brutal-tag border-brand-secondary text-brand-secondary">
            Repos
          </span>
          <h2 className="font-mono text-heading-md font-black uppercase tracking-wide text-text-primary">
            Repositories Using {skill.name}
          </h2>
        </div>
        <div className="flex flex-col gap-0">
          {skill.repos
            .sort((a, b) => b.confidence - a.confidence)
            .map((repo, i) => (
              <div
                key={repo.repoName}
                className={cn(
                  "flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-bg-surface-alt cursor-pointer",
                  i > 0 && "border-t border-border-subtle",
                )}
                onClick={() =>
                  navigate(`/dashboard/repositories/${repo.repoName}`)
                }
                role="button"
                tabIndex={0}
              >
                <GitBranch className="h-4 w-4 shrink-0 text-text-tertiary" />
                <span className="flex-1 font-mono text-body-sm font-bold text-text-primary">
                  {repo.repoName}
                </span>
                <span className="font-mono text-caption text-text-tertiary">
                  {repo.confidence}% confidence
                </span>
                <div className="w-24">
                  <ConfidenceBar score={repo.confidence} height={6} />
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-text-tertiary" />
              </div>
            ))}
        </div>
      </div>

      {/* ============================================================ */}
      {/* EVIDENCE GROUPS */}
      {/* ============================================================ */}
      <div className="border-2 border-border-strong bg-bg-surface">
        <div className="flex items-center gap-3 border-b-2 border-border-strong px-5 py-4">
          <span className="brutal-tag border-brand-primary text-brand-primary">
            Evidence
          </span>
          <h2 className="font-mono text-heading-md font-black uppercase tracking-wide text-text-primary">
            Detection Evidence
          </h2>
          <span className="ml-auto font-mono text-caption font-bold text-text-tertiary">
            {totalEvidence} points
          </span>
        </div>

        {skill.evidenceGroups.length === 0 ? (
          <div className="p-5">
            <EmptyState
              title="No evidence found"
              description="No detection evidence available for this skill."
            />
          </div>
        ) : (
          <div className="flex flex-col gap-0">
            {skill.evidenceGroups.map((group) => (
              <EvidenceGroupCard key={group.method} group={group} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Sub-components
// ============================================================

function BackButton() {
  const navigate = useNavigate();
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => navigate("/dashboard/skills")}
      className="w-fit font-mono text-caption font-bold uppercase"
    >
      <ArrowLeft className="mr-1 h-3 w-3" />
      Back to Skills
    </Button>
  );
}

function EvidenceGroupCard({ group }: { group: EvidenceGroup }) {
  const meta = METHOD_META[group.method];

  return (
    <div className="border-t-2 border-border-subtle first:border-t-0">
      {/* Method header */}
      <div className="flex items-center gap-3 px-5 py-4">
        <div className={cn("p-2 border-2 border-border-subtle bg-bg-surface-alt", meta.color)}>
          <meta.icon className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <span className="font-mono text-body-sm font-bold uppercase tracking-wide text-text-primary">
            {meta.label}
          </span>
          <span className="ml-2 font-mono text-caption text-text-tertiary">
            {group.evidence.length} evidence point{group.evidence.length !== 1 ? "s" : ""}
          </span>
        </div>
        {/* Linked repos */}
        <div className="flex gap-1.5">
          {group.linkedRepos.map((repo) => (
            <span
              key={repo}
              className="border border-border-subtle bg-bg-surface-alt px-2 py-0.5 font-mono text-overline text-text-tertiary"
            >
              {repo}
            </span>
          ))}
        </div>
      </div>

      {/* Evidence items */}
      <div className="flex flex-col gap-0 border-t border-border-subtle">
        {group.evidence.map((ev, i) => (
          <div
            key={i}
            className="flex items-start gap-4 px-5 py-3 hover:bg-bg-surface-alt transition-colors"
          >
            {/* File path */}
            <div className="flex items-center gap-2 shrink-0">
              <Shield className="h-3 w-3 text-text-tertiary" />
              <span className="font-mono text-caption font-bold text-brand-secondary">
                {ev.sourceFile}
              </span>
              {ev.line && (
                <span className="font-mono text-overline text-text-tertiary">
                  L{ev.line}
                </span>
              )}
            </div>

            {/* Snippet */}
            {ev.snippet && (
              <code className="flex-1 truncate border-l-2 border-border-strong pl-3 font-mono text-caption text-text-secondary">
                {ev.snippet}
              </code>
            )}
          </div>
        ))}
      </div>
    </div>
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
      <div className="h-48 border-2 border-border-strong bg-bg-surface" />
      <div className="h-64 border-2 border-border-strong bg-bg-surface" />
    </div>
  );
}
