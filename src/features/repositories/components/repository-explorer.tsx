/**
 * Repository Explorer — BRUTALIST × NEO-MAXIMALIST
 * Reference: Design Spec Part C, Screen 10
 *
 * Full grid of Repository Cards with:
 * - Real-time search (name + description)
 * - Language filter dropdown
 * - Sort by name / quality / stars / last updated
 * - Toggle sort direction
 * - Quality ring, language badge, star count on each card
 * - Click-through to /dashboard/repositories/:repoId
 */

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Search,
  GitBranch,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Star,
  Lock,
  Filter,
} from "lucide-react";
import {
  fetchRepositories,
  fetchRepoLanguages,
  type RepoFilters,
  type RepoSortKey,
  type RepoSortDir,
} from "@/shared/services";
import { MiniQualityRing } from "@/shared/components/quality-ring";
import { EmptyState } from "@/shared/components/empty-state";
import { ErrorState } from "@/shared/components/error-state";
import { formatNumber, formatRelativeDate } from "@/shared/utils/format";
import { cn } from "@/shared/utils/cn";

const SORT_OPTIONS: { key: RepoSortKey; label: string }[] = [
  { key: "name", label: "Name" },
  { key: "quality", label: "Quality" },
  { key: "stars", label: "Stars" },
  { key: "updated", label: "Updated" },
];

export default function RepositoryExplorer() {
  const navigate = useNavigate();

  // Filter state
  const [search, setSearch] = useState("");
  const [language, setLanguage] = useState<string>("all");
  const [sortBy, setSortBy] = useState<RepoSortKey>("updated");
  const [sortDir, setSortDir] = useState<RepoSortDir>("desc");
  const [showFilters, setShowFilters] = useState(false);

  const filters: RepoFilters = useMemo(
    () => ({ search, language, sortBy, sortDir }),
    [search, language, sortBy, sortDir],
  );

  // Data fetching
  const {
    data: repos,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["repositories", filters],
    queryFn: () => fetchRepositories(filters),
  });

  const { data: languages } = useQuery({
    queryKey: ["repo-languages"],
    queryFn: fetchRepoLanguages,
  });

  // Handlers
  const toggleSort = (key: RepoSortKey) => {
    if (sortBy === key) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    } else {
      setSortBy(key);
      setSortDir("desc");
    }
  };

  if (error) {
    return (
      <ErrorState
        title="Failed to load repositories"
        message="Something went wrong while fetching your repositories."
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div>
        <span className="brutal-overline text-text-tertiary">Explore</span>
        <h1 className="mt-1 font-display text-heading-xl font-black uppercase tracking-tight text-text-primary">
          Repositories
        </h1>
      </div>

      {/* Search + Filter Bar */}
      <div className="flex flex-col gap-3 border-2 border-border-strong bg-bg-surface p-4">
        <div className="flex items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
            <input
              type="text"
              placeholder="Search repositories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border-2 border-border-strong bg-bg-surface-alt py-2.5 pl-10 pr-4 font-mono text-body-sm text-text-primary placeholder:text-text-tertiary placeholder:italic focus:border-brand-primary focus:shadow-brutal-accent focus:outline-none"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={cn(
              "flex items-center gap-2 border-2 px-4 py-2.5 font-mono text-caption font-bold uppercase tracking-wider transition-all",
              showFilters
                ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
                : "border-border-strong bg-bg-surface-alt text-text-secondary hover:border-brand-primary",
            )}
          >
            <Filter className="h-3.5 w-3.5" />
            Filters
          </button>

          {/* Sort Buttons */}
          <div className="flex border-2 border-border-strong">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => toggleSort(opt.key)}
                className={cn(
                  "flex items-center gap-1 border-r border-border-strong px-3 py-2.5 font-mono text-caption font-bold uppercase tracking-wider transition-all last:border-r-0",
                  sortBy === opt.key
                    ? "bg-brand-primary/10 text-brand-primary"
                    : "text-text-tertiary hover:text-text-secondary",
                )}
              >
                {opt.label}
                {sortBy === opt.key && (
                  sortDir === "desc" ? (
                    <ArrowDown className="h-3 w-3" />
                  ) : (
                    <ArrowUp className="h-3 w-3" />
                  )
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Expanded Filters */}
        {showFilters && languages && (
          <div className="flex items-center gap-3 border-t-2 border-border-subtle pt-3">
            <span className="font-mono text-overline font-bold uppercase tracking-widest text-text-tertiary">
              Language
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setLanguage("all")}
                className={cn(
                  "border-2 px-3 py-1 font-mono text-caption font-bold uppercase tracking-wider transition-all",
                  language === "all"
                    ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
                    : "border-border-strong text-text-tertiary hover:border-brand-primary hover:text-text-secondary",
                )}
              >
                All
              </button>
              {languages.map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={cn(
                    "border-2 px-3 py-1 font-mono text-caption font-bold uppercase tracking-wider transition-all",
                    language === lang
                      ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
                      : "border-border-strong text-text-tertiary hover:border-brand-primary hover:text-text-secondary",
                  )}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Active filter summary */}
        {(search || language !== "all") && (
          <div className="flex items-center gap-2 border-t-2 border-border-subtle pt-3">
            <span className="font-mono text-overline font-bold text-text-tertiary">
              Active:
            </span>
            {search && (
              <span className="brutal-tag border-brand-secondary text-brand-secondary">
                "{search}"
              </span>
            )}
            {language !== "all" && (
              <span className="brutal-tag border-brand-tertiary text-brand-tertiary">
                {language}
              </span>
            )}
            <button
              onClick={() => {
                setSearch("");
                setLanguage("all");
              }}
              className="ml-2 font-mono text-caption font-bold text-danger hover:underline"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-caption font-bold uppercase tracking-widest text-text-tertiary">
          {isLoading
            ? "Loading..."
            : `${repos?.length ?? 0} repositories`}
        </span>
      </div>

      {/* Repository Grid */}
      {isLoading ? (
        <RepoGridSkeleton />
      ) : repos && repos.length > 0 ? (
        <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-3">
          {repos.map((repo, i) => (
            <div
              key={repo.name}
              className={cn(
                "group flex flex-col border-2 border-border-strong bg-bg-surface p-5 transition-all",
                "cursor-pointer hover:-translate-y-1 hover:shadow-card-hover",
                // Grid border collapsing — match KPI card pattern
                i > 0 && "sm:-ml-0.5",
                // Responsive border handling
                "max-sm:border-t-0 max-sm:first:border-t-2",
              )}
              onClick={() =>
                navigate(`/dashboard/repositories/${repo.name}`)
              }
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  navigate(`/dashboard/repositories/${repo.name}`);
                }
              }}
            >
              {/* Top row: quality ring + private badge */}
              <div className="mb-3 flex items-start justify-between">
                <MiniQualityRing score={repo.qualityScore} />
                {repo.isPrivate && (
                  <span className="flex items-center gap-1 border-2 border-warning bg-warning/10 px-2 py-0.5 font-mono text-overline font-bold text-warning">
                    <Lock className="h-2.5 w-2.5" />
                    Private
                  </span>
                )}
              </div>

              {/* Repo name */}
              <h3 className="font-mono text-body-md font-bold text-text-primary group-hover:text-brand-primary transition-colors">
                {repo.name}
              </h3>

              {/* Description */}
              <p className="mt-1 line-clamp-2 font-mono text-body-sm text-text-secondary leading-relaxed">
                {repo.description}
              </p>

              {/* Meta row: language + stars + updated */}
              <div className="mt-auto flex items-center gap-3 pt-4">
                <span className="flex items-center gap-1.5 font-mono text-caption font-bold uppercase tracking-wider text-brand-secondary">
                  <GitBranch className="h-3 w-3" />
                  {repo.primaryLanguage}
                </span>
                <span className="text-border-strong">|</span>
                <span className="flex items-center gap-1 font-mono text-caption text-text-tertiary">
                  <Star className="h-3 w-3" />
                  {formatNumber(repo.stars)}
                </span>
                <span className="ml-auto font-mono text-overline text-text-tertiary">
                  {formatRelativeDate(repo.lastUpdated)}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border-2 border-border-strong bg-bg-surface p-8">
          <EmptyState
            icon={<Search className="h-10 w-10 text-text-tertiary" />}
            title="No matching repositories"
            description={
              search || language !== "all"
                ? "Try adjusting your search or filters."
                : "Connect your GitHub account and run an analysis to see your repositories here."
            }
          />
        </div>
      )}
    </div>
  );
}

// ============================================================
// Skeleton Loader
// ============================================================

function RepoGridSkeleton() {
  return (
    <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-3 animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "border-2 border-border-strong bg-bg-surface p-5",
            i > 0 && "sm:-ml-0.5",
            "max-sm:border-t-0 max-sm:first:border-t-2",
          )}
        >
          <div className="mb-3 h-9 w-9 border-2 border-border-subtle bg-bg-surface-alt" />
          <div className="mb-2 h-5 w-3/4 bg-bg-surface-alt" />
          <div className="mb-4 h-4 w-full bg-bg-surface-alt" />
          <div className="flex items-center gap-3 pt-4">
            <div className="h-3 w-16 bg-bg-surface-alt" />
            <div className="h-3 w-8 bg-bg-surface-alt" />
          </div>
        </div>
      ))}
    </div>
  );
}
